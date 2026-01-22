import asyncio
import secrets
from pathlib import Path
import time
from uuid import UUID

import yaml
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from infrastructure.models.mcp_server import MCPServerSetupStatus, MCPTool
from infrastructure.repositories.mcp_server import (
    MCPEnvironmentVariableCreate,
    MCPToolCreate,
)
from infrastructure.repositories.repo_provider import Provider
from settings import settings

from core.services.tier_service import (
    CURATED_LIBRARIES,
    BLOCKED_MODULES,
    Tier,
    CodeValidator,
)
from loguru import logger

openai_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY,
)

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


class ToolParameter(BaseModel):
    name: str
    type: str
    required: bool
    description: str


class Tool(BaseModel):
    name: str = Field(description="pythonic snake_case name")
    description: str = Field(description="docstring for the function")
    parameters: list[ToolParameter] = Field(description="arguments for the function")


class EnvVar(BaseModel):
    name: str
    description: str


class ToolsResponse(BaseModel):
    """Wrapper for list[Tool] to support structured outputs."""

    tools: list[Tool]


class EnvVarsResponse(BaseModel):
    """Wrapper for list[EnvVar] to support structured outputs."""

    env_vars: list[EnvVar]


def load_prompt(filename: str, as_string=True):
    try:
        with open(PROMPTS_DIR / filename, "r") as file:
            if as_string:
                return file.read()
            prompt_data = yaml.full_load(file)
            return prompt_data
    except (FileNotFoundError, yaml.YAMLError) as e:
        print(f"Error loading prompt file {filename}: {e}")
        return ""


class WizardStepsService:
    """
    Class encapsulating steps of MCPServer creation.
    Main logic revolves around generating tools/code with AI and moving setup_status accordingly as it gets approved.
    Core idea is for any current state to be present in database, no browser-session temporary state.
    methods that include LLMs should always be background_jobs spawned, not sync, as they take time.
    """

    async def step_1a_suggest_tools_for_mcp_server(
        self,
        description: str,
        mcp_server_id: UUID | None = None,
        prompt_file: str = "step_1_tool_suggestion.yaml",
    ) -> list[Tool]:
        """
        Tools are just a list of strings for now based on the description, but saved in db regardless.
        Suggested tools are stored in draft state in db.
        Sets status to tools_generating during LLM call, then tools_selection when done.
        """
        if mcp_server_id is None:
            mcp_server = await Provider.mcp_server_repo().create()
            mcp_server_id = mcp_server.id

        # Set generating status
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.tools_generating
        )

        try:
            system_prompt = load_prompt(prompt_file)

            # Get server to access meta for technical details
            server = await Provider.mcp_server_repo().get(mcp_server_id)
            technical_details = (
                server.meta.get("technical_details", []) if server.meta else []
            )

            # Build user content with description and technical details
            user_content = description
            if technical_details:
                technical_details_text = "\n\n".join(
                    f"Technical Details {i + 1}:\n{details}"
                    for i, details in enumerate(technical_details)
                )
                user_content = f"{description}\n\n---\n\nTECHNICAL DETAILS (use these to design tools with exact specifications):\n{technical_details_text}\n\n---\n\nWhen designing tools, ensure they match the technical details above. Use exact endpoint names, parameter names, types, and requirements from the technical details."

            response = await openai_client.chat.completions.parse(
                model="google/gemini-3-pro-preview",
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_content,
                    },
                ],
                response_format=ToolsResponse,
            )
            parsed: list[Tool] = response.choices[0].message.parsed.tools

            create_payloads = []
            for tool in parsed:
                create_payloads.append(
                    MCPToolCreate(
                        server_id=mcp_server_id,
                        name=tool.name,
                        description=tool.description,
                        parameters_schema=[p.dict() for p in tool.parameters],
                    )
                )
            await Provider.mcp_tool_repo().create_bulk(create_payloads)
            return parsed
        finally:
            # Set to tools_selection when done (success or failure)
            await Provider.mcp_server_repo().update_setup_status(
                mcp_server_id, MCPServerSetupStatus.tools_selection
            )

    async def step_1b_refine_suggested_tools(
        self,
        mcp_server_id: UUID,
        feedback: str,
        tool_ids_for_refinement: list[UUID] | None = None,
        prompt_file: str = "step_1_tool_refinement.yaml",
    ) -> list[Tool]:
        """
        Refine tools suggested in 1a, fetch them from db, serialize them to LLM request,
        re-create based on LLM response. Re-create everything in db.
        Sets status to tools_generating during LLM call, then tools_selection when done.
        """
        # Set generating status
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.tools_generating
        )
        server = await Provider.mcp_server_repo().get(mcp_server_id)

        try:
            server_tools = await Provider.mcp_tool_repo().get_tools_for_server(
                mcp_server_id
            )
            if tool_ids_for_refinement is not None:
                server_tools = [
                    tool for tool in server_tools if tool.id in tool_ids_for_refinement
                ]

            tools_description = "\n".join(
                f"- {tool.name}: {tool.description}" for tool in server_tools
            )

            system_prompt = load_prompt(prompt_file)

            # Include technical details from meta if available
            technical_details = (
                server.meta.get("technical_details", []) if server.meta else []
            )
            technical_details_text = ""
            if technical_details:
                technical_details_text = "\n\n".join(
                    f"Technical Details {i + 1}:\n{details}"
                    for i, details in enumerate(technical_details)
                )
                technical_details_text = f"\n\n---\n\nTECHNICAL DETAILS (use these to refine tools with exact specifications):\n{technical_details_text}\n\n---\n\nWhen refining tools, ensure they match the technical details above. Use exact endpoint names, parameter names, types, and requirements from the technical details."

            user_content = f"Server description:\n{server.description}\n\nCurrent tools:\n{tools_description}\n\nUser feedback:\n{feedback}{technical_details_text}"

            response = await openai_client.chat.completions.parse(
                model="google/gemini-3-pro-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                response_format=ToolsResponse,
            )
            parsed: list[Tool] = response.choices[0].message.parsed.tools

            await Provider.mcp_tool_repo().delete_tools_for_server(mcp_server_id)

            create_payloads = []
            for tool in parsed:
                create_payloads.append(
                    MCPToolCreate(
                        server_id=mcp_server_id,
                        name=tool.name,
                        description=tool.description,
                        parameters_schema=[p.dict() for p in tool.parameters],
                    )
                )
            await Provider.mcp_tool_repo().create_bulk(create_payloads)
            return parsed
        finally:
            # Set to tools_selection when done (success or failure)
            await Provider.mcp_server_repo().update_setup_status(
                mcp_server_id, MCPServerSetupStatus.tools_selection
            )

    async def step_1c_submit_selected_tools(
        self,
        mcp_server_id: UUID,
        selected_tool_ids: list[UUID],
        # TODO: remove this override when suggest is called normally.
        setup_status_override: MCPServerSetupStatus | None = None,
    ) -> None:
        """
        Transition mcp server to another setup_status, delete the other tools
        of the MCP server (that didn't get selected).
        """
        await Provider.mcp_tool_repo().delete_tools_not_in_list(
            mcp_server_id, selected_tool_ids
        )
        if setup_status_override:
            await Provider.mcp_server_repo().update_setup_status(
                mcp_server_id,
                setup_status_override,
            )
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id,
            MCPServerSetupStatus.env_vars_setup,
        )

    async def step_2a_suggest_environment_variables_for_mcp_server(
        self,
        mcp_server_id: UUID,
        prompt_file: str = "step_2_env_var_suggestion.yaml",
    ) -> list[EnvVar]:
        """
        Long running background job.
        Suggest state for the mcp server that is required to be filled by user to run it.
        Prefer DB_URI over 5-6 vars for db connection and always prefer less creds if possible.
        Sets status to env_vars_generating during LLM call, then env_vars_setup when done.
        """
        # Set generating status
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.env_vars_generating
        )
        server = await Provider.mcp_server_repo().get(mcp_server_id)

        try:
            system_prompt = load_prompt(prompt_file)
            user_content = f"Server description:\n{server.description}\n"
            response = await openai_client.chat.completions.parse(
                model="google/gemini-3-pro-preview",
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {"role": "user", "content": user_content},
                ],
                response_format=EnvVarsResponse,
            )
            parsed: list[EnvVar] = response.choices[0].message.parsed.env_vars

            create_payloads = []
            for var in parsed:
                create_payloads.append(
                    MCPEnvironmentVariableCreate(
                        server_id=mcp_server_id,
                        name=var.name,
                        description=var.description,
                    )
                )
            await Provider.environment_variable_repo().create_bulk(create_payloads)
            return parsed
        finally:
            # Set to env_vars_setup when done (success or failure)
            await Provider.mcp_server_repo().update_setup_status(
                mcp_server_id, MCPServerSetupStatus.env_vars_setup
            )

    async def step_2b_refine_suggested_environment_variables_for_mcp_server(
        self,
        mcp_server_id: UUID,
        feedback: str,
        prompt_file: str = "step_2_env_var_refinement.yaml",
    ) -> list[EnvVar]:
        """
        Long running background job.
        If 2a's suggested vars were bad for any reason, re-send them to LLM to refine.
        Sets status to env_vars_generating during LLM call, then env_vars_setup when done.
        """
        # Set generating status
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.env_vars_generating
        )
        server = await Provider.mcp_server_repo().get(mcp_server_id)

        try:
            env_vars = await Provider.environment_variable_repo().get_vars_for_server(
                mcp_server_id
            )

            vars_description = "\n".join(
                f"- {var.name}: {var.description}" for var in env_vars
            )

            system_prompt = load_prompt(prompt_file)
            user_content = (
                f"MCP description: \n{server.description}\n\n"
                f"Current environment variables:\n{vars_description}\n\n"
                f"User feedback:\n{feedback}"
            )

            response = await openai_client.chat.completions.parse(
                model="google/gemini-3-pro-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                response_format=EnvVarsResponse,
            )
            parsed: list[EnvVar] = response.choices[0].message.parsed.env_vars

            await Provider.environment_variable_repo().delete_vars_for_server(
                mcp_server_id
            )

            create_payloads = []
            for var in parsed:
                create_payloads.append(
                    MCPEnvironmentVariableCreate(
                        server_id=mcp_server_id,
                        name=var.name,
                        description=var.description,
                    )
                )
            await Provider.environment_variable_repo().create_bulk(create_payloads)
            return parsed
        finally:
            # Set to env_vars_setup when done (success or failure)
            await Provider.mcp_server_repo().update_setup_status(
                mcp_server_id, MCPServerSetupStatus.env_vars_setup
            )

    async def step_2c_submit_variables(
        self,
        mcp_server_id: UUID,
        values: dict[UUID, str],
    ) -> None:
        """
        Set setup-status accordingly here.
        Values are sent as pairs of variable ID (in db) and values, update each var.

        Parameters:
        - mcp_server_id: UUID - The ID of the MCP server
        - values: dict[UUID, str] - A dictionary of variable IDs and their values
        """
        for var_id, value in values.items():
            await Provider.environment_variable_repo().update_value(var_id, value)

        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.auth_selection
        )

    async def step_3_set_header_auth(
        self,
        mcp_server_id: UUID,
    ) -> str:
        """
        Sets header auth to MCP server, generates a Bearer token and returns it.
        """
        token = secrets.token_urlsafe(32)
        await Provider.api_key_repo().create_for_server(mcp_server_id, token)
        await Provider.mcp_server_repo().update_auth_type(mcp_server_id, "bearer")
        return token

    async def step_4_generate_code_for_tools_and_env_vars(
        self,
        mcp_server_id: UUID,
    ):
        """
        Using the description of the server, all the function definitions and env vars provided,
        generate code, envs should be utilized and hardcoded into functions.
        If there's DB_URL in envs, write it in the connector code etc.
        Sets status to code_generating during LLM call, then code_gen when done.
        """
        server = await Provider.mcp_server_repo().get_by_uuid(mcp_server_id)

        if server.setup_status == MCPServerSetupStatus.code_generating:
            raise RuntimeError(
                "Code generation invoked at invalid server state (already code_generating)"
            )

        # Set generating status
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.code_generating
        )

        # customer_id = server.customer_id
        # customer = await Provider.customer_repo().get(customer_id)
        # tier = Tier(customer.tier)
        tier = Tier.FREE

        system_prompt = load_prompt("step_4_code_generation.yaml", as_string=False)

        async def generate_code_for_tool(
            prompt_template: str, tool: MCPTool, enable_logging: bool = False
        ):
            logger_instance = logger.bind(tool_name=tool.name)
            if enable_logging:
                logger_instance.info(f"[{tool.name}] Generating code for tool")

            available_libraries = []
            for package, imports in CURATED_LIBRARIES.items():
                available_libraries.append(
                    f"- {package}: "
                    + ("all exports" if imports is None else ", ".join(imports))
                )

            prompt = prompt_template.format(
                AVAILABLE_LIBRARIES="\n".join(available_libraries),
                FORBIDDEN_LIBRARIES="\n".join(f"- {lib}" for lib in BLOCKED_MODULES),
                ENVIRONMENT_VARIABLES="\n".join(
                    f"- {var.name}: {var.description}"
                    for var in server.environment_variables
                ),
                TECHNICAL_DETAILS=",".join(server.meta["technical_details"]),
                FUNCTION_NAME=tool.name,
                TOOL_NAME=tool.name,
                TOOL_DESCRIPTION=tool.description,
                MCP_SERVER_DESCRIPTION=server.description,  # needs better formatting at wizard system prompt level
                ARGUMENTS_DOCSTRING="\n".join(
                    f"{param.get('name', 'arg')}: {param.get('type', 'str')} - {param.get('description', '')}"
                    for param in tool.parameters_schema
                ),
                TOOL_ARGUMENTS="\n".join(
                    f"{param.get('name', 'arg')}: {param.get('type', 'str')} = Field(description='{param.get('description', '')}')"
                    for param in tool.parameters_schema
                ),
            )
            if enable_logging:
                logger_instance.info(f"[{tool.name}] Prompt: {prompt}")

            messages = [
                {"role": "user", "content": prompt},
            ]
            code_validator = CodeValidator(tier)

            MAX_GENERATION_RETRIES = 5

            for _ in range(MAX_GENERATION_RETRIES):
                response = await openai_client.chat.completions.create(
                    model="google/gemini-3-pro-preview",
                    messages=messages,
                )
                code = response.choices[0].message.content
                if enable_logging:
                    logger_instance.info(f"[{tool.name}] Code: {code}")
                errors = code_validator.validate(code)
                if not errors:
                    break
                if enable_logging:
                    logger_instance.info(
                        f"[{tool.name}] Code is not valid. Errors: {errors}"
                    )
                messages.append({"role": "assistant", "content": code})
                messages.append(
                    {
                        "role": "user",
                        "content": f"The code is not valid. Please fix the errors and return the code again. Errors: {errors}",
                    }
                )

            if enable_logging:
                logger_instance.info(f"[{tool.name}] Code: {code}")

            if not code:
                raise RuntimeError(
                    f"[{mcp_server_id}] Tool: {tool.name}, failed to generate code"
                )

            return code

        tasks = [
            generate_code_for_tool(system_prompt["prompt"], tool)
            for tool in server.tools
        ]

        start_time = time.time()
        results = await asyncio.gather(*tasks)
        end_time = time.time()
        logger.info(f"[{mcp_server_id}] Time taken: {end_time - start_time} seconds")
        for tool, code in zip(server.tools, results):
            if not code:
                logger.error(
                    f"[{mcp_server_id}] Tool: {tool.name}, failed to generate code"
                )
            await Provider.mcp_tool_repo().update_tool_code(tool.id, code)
            logger.success(
                f"[{mcp_server_id}] Tool: {tool.name}, completed code generation"
            )

        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.code_gen
        )

    async def step_5_deploy_to_shared(
        self,
        mcp_server_id: UUID,
    ): ...
