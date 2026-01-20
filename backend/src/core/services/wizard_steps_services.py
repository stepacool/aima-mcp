import secrets
from pathlib import Path
from uuid import UUID

import yaml
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from infrastructure.models.mcp_server import MCPServerSetupStatus
from infrastructure.repositories.mcp_server import (
    MCPEnvironmentVariableCreate,
    MCPToolCreate,
)
from infrastructure.repositories.repo_provider import Provider
from settings import settings

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
        with open(PROMPTS_DIR / filename, 'r') as file:
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
            response = await openai_client.chat.completions.parse(
                model="google/gemini-3-pro-preview",
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": description,
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
            user_content = (
                f"Server description:\n{server.description}\n\nCurrent tools:\n{tools_description}\n\nUser feedback:\n{feedback}"
            )

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
    ) -> None:
        """
        Transition mcp server to another setup_status, delete the other tools
        of the MCP server (that didn't get selected).
        """
        await Provider.mcp_tool_repo().delete_tools_not_in_list(
            mcp_server_id, selected_tool_ids
        )
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.env_vars_setup
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

        try:
            system_prompt = load_prompt(prompt_file)
            response = await openai_client.chat.completions.parse(
                model="google/gemini-3-pro-preview",
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
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

        try:
            env_vars = await Provider.environment_variable_repo().get_vars_for_server(
                mcp_server_id
            )

            vars_description = "\n".join(
                f"- {var.name}: {var.description}" for var in env_vars
            )

            system_prompt = load_prompt(prompt_file)
            user_content = (
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
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.code_gen
        )
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
        # Set generating status
        await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.code_generating
        )

        try:
            # TODO: Implement code generation logic
            pass
        finally:
            # Set to code_gen when done (success or failure)
            await Provider.mcp_server_repo().update_setup_status(
                mcp_server_id, MCPServerSetupStatus.code_gen
            )

    async def step_5_deploy_to_shared(
        self,
        mcp_server_id: UUID,
    ):
        ...
