from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from core.services import get_tool_loader, get_llm_client


class ToolParameter(BaseModel):
    name: str
    type: str
    required: bool
    description: str


class Tool(BaseModel):
    name: str = Field(description="pythonic snake_case name")
    description: str = Field(description="docstring for the function")
    parameters: list[ToolParameter] = Field(description="arguments for the function")


class WizardStepsService:
    def __init__(
        self,
        server_repo,
        tool_repo,
    ):
        self.server_repo = server_repo
        self.tool_repo = tool_repo
        self.llm = get_llm_client()
        self.tool_loader = get_tool_loader()

    async def step_1a_suggest_tools_for_mcp_server(
        self,
        mcp_server_id: UUID,
        description: str,
    ) -> list[Tool]:
        """
        Tools are just a list of strings for now based on the description, but saved in db regardless.
        Suggested tools are stored in draft state in db
        """

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

    async def step_1c_submit_selected_tools(
        self,
        mcp_server_id: UUID,
        selected_tool_ids: list[UUID],
    ):
        """
        Transition selected tools to non-draft state, delete the other tools of the MCP server
        """
        ...

    async def step_2a_suggest_environment_variables_for_mcp_server(
        self,
        mcp_server_id: UUID,
    ) -> BaseModel:
        """
        Long running background job
        Suggest state for the mcp server that is required to be filled by user to run it.
        A flat json/pydantic model - for example db creds, API key or anything else.
        Prefer DB_URI over 5-6 vars for db connection and always prefer less creds if possible.
        """

    async def step_2b_refine_suggested_environment_variables_for_mcp_server(
        self,
        mcp_server_id: UUID,
    ) -> BaseModel:
        """
        Long running background job
        if 2a's suggested vars were bad for any reason, re-send them to LLM to re-fine
        """

    async def step_2c_submit_variables(
        self,
        variables: dict[str, Any],
    ):
        ...

    async def step_3_set_header_auth(
        self,
        mcp_server_id: UUID,
    ) -> str:
        """
        sets header auth to MCP server, generates a Bearer token and returns it.
        """

    async def step_4_generate_code_for_tools_and_env_vars(
        self,
        mcp_server_id: UUID,
    ):
        ...

    async def step_5_deploy_to_shared(
        self,
        mcp_server_id: UUID,
    ):
        ...
