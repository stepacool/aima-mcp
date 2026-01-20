from pathlib import Path
from typing import Any
from uuid import UUID

import yaml
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from core.services import get_tool_loader
from infrastructure.repositories.mcp_server import MCPToolCreate, MCPEnvironmentVariableCreate
from infrastructure.repositories.repo_provider import Provider
from settings import settings

openai_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY,
)

PROMPTS_DIR = Path(__name__).parent.parent / "prompts"


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


def load_prompt(filename: str):
    try:
        with open(PROMPTS_DIR / filename, 'r') as file:
            prompt_data = yaml.full_load(file)
            return prompt_data
    except (FileNotFoundError, yaml.YAMLError) as e:
        print(f"Error loading prompt file {filename}: {e}")
        return ""


class WizardStepsService:
    """
    Class encapsulating steps of MCPServer creation.
    Main logic revolves around generating tools/code with AI and moving setup_status accordingly as it gets approved.
    Core idea is for any current state to be present in database, recoverable from point in time, no browser-session temporary state.
    methods that include LLMs should always be background_jobs spawned, not sync, as they take time.
    """
    def __init__(
        self,
        server_repo,
        tool_repo,
    ):
        self.server_repo = server_repo
        self.tool_repo = tool_repo
        self.tool_loader = get_tool_loader()

    async def step_1a_suggest_tools_for_mcp_server(
        self,
        description: str,
        mcp_server_id: UUID | None = None,
        prompt_file: str = "step_1_tool_suggestion.yaml",
    ) -> list[Tool]:
        """
        Tools are just a list of strings for now based on the description, but saved in db regardless.
        Suggested tools are stored in draft state in db
        """
        system_prompt = load_prompt(prompt_file)
        response = await openai_client.chat.completions.parse(
            model="google/gemini-3-pro-preview",
            messages=[
                {
                    "role": "developer",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": description,
                },
            ],
            response_format=list[Tool],
            timeout=settings.POLLING_TIMEOUT,
        )
        parsed: list[Tool] = response.choices[0].message.parsed

        if mcp_server_id is None:
            mcp_server = await Provider.mcp_server_repo().create()
            mcp_server_id = mcp_server.id

        create_payloads = []
        for tool in parsed:
            create_payloads.append(MCPToolCreate(
                server_id=mcp_server_id,
                name=tool.name,
                description=tool.description,
                parameters_schema=tool.parameters,
            ))
        await Provider.mcp_server_repo().create_bulk(create_payloads)
        return parsed

    async def step_1b_refine_suggested_tools(
        self,
        mcp_server_id: UUID,
        feedback: str,
        tool_ids_for_refinement: list[UUID] | None = None,
    ) -> list[Tool]:
        """
        Refine tools suggested in 1a, fetch them from db, serialize them to LLM request, re-create based on LLM response.
        Re-create everything in db
        """
        server_tools = await Provider.mcp_tool_repo().get_tools_for_server(mcp_server_id)
        if tool_ids_for_refinement is not None:
            server_tools = [tool for tool in server_tools if tool.id in tool_ids_for_refinement]
        ...

    async def step_1c_submit_selected_tools(
        self,
        mcp_server_id: UUID,
        selected_tool_ids: list[UUID],
    ):
        """
        Transition mcp server to another setup_status, delete the other tools of the MCP server(that didn't get selected)
        """
        ...

    async def step_2a_suggest_environment_variables_for_mcp_server(
        self,
        mcp_server_id: UUID,
        prompt_file: str = "step_2_env_var_suggestion.yaml",
    ) -> list[EnvVar]:
        """
        Long running background job
        Suggest state for the mcp server that is required to be filled by user to run it.
        Prefer DB_URI over 5-6 vars for db connection and always prefer less creds if possible.
        """
        system_prompt = load_prompt(prompt_file)
        response = await openai_client.chat.completions.parse(
            model="google/gemini-3-pro-preview",
            messages=[
                {
                    "role": "developer",
                    "content": system_prompt,
                },
            ],
            response_format=list[EnvVar],
            timeout=settings.POLLING_TIMEOUT,
        )
        parsed: list[EnvVar] = response.choices[0].message.parsed

        create_payloads = []
        for tool in parsed:
            create_payloads.append(MCPEnvironmentVariableCreate(
                server_id=mcp_server_id,
                name=tool.name,
                description=tool.description,
            ))
        await Provider.environment_variable_repo().create_bulk(create_payloads)
        return parsed

    async def step_2b_refine_suggested_environment_variables_for_mcp_server(
        self,
        mcp_server_id: UUID,
        feedback: str,
    ) -> list[EnvVar]:
        """
        Long running background job
        if 2a's suggested vars were bad for any reason, re-send them to LLM to refine
        """

    async def step_2c_submit_variables(
        self,
        mcp_server_id: UUID,
        values: dict[UUID, str],
    ):
        """
        Set setup-status accordingly here,
        values are sent as pairs of variable ID(in db) and values, update each var.
        :param variables:
        :return:
        """
        ...

    async def step_3_set_header_auth(
        self,
        mcp_server_id: UUID,
    ) -> str:
        """
        sets header auth to MCP server, generates a Bearer token and returns it.
        """
        #TODO: create api_key_repo, create an api key
        api_key = await Provider.api_key_repo().create()

    async def step_4_generate_code_for_tools_and_env_vars(
        self,
        mcp_server_id: UUID,
    ):
        """
        Using the description of the server, all the function definitions and env vars provided,
        generate code, envs should be utilized and hardcoded into functions.
        If there's DB_URL in envs, write it in the connector code etc.
        """
        ...

    async def step_5_deploy_to_shared(
        self,
        mcp_server_id: UUID,
    ):
        ...
