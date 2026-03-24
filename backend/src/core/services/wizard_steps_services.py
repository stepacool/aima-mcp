import asyncio
import secrets
import time
from collections.abc import AsyncGenerator
from contextlib import AsyncExitStack
from pathlib import Path
from typing import Any, Literal, cast
from uuid import UUID

import yaml
from entrypoints.mcp.shared_runtime import register_new_customer_app
from fastapi import FastAPI
from infrastructure.models.deployment import DeploymentStatus, DeploymentTarget
from infrastructure.models.mcp_server import MCPServer, MCPServerSetupStatus, MCPTool
from infrastructure.repositories.deployment import DeploymentCreate
from infrastructure.repositories.mcp_server import (
    MCPEnvironmentVariableCreate,
    MCPServerUpdate,
    MCPToolCreate,
)
from infrastructure.repositories.repo_provider import Provider
from loguru import logger
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion, ChatCompletionMessageParam
from pydantic import BaseModel, Field, field_validator
from settings import settings

from core.services.tier_service import (
    BLOCKED_MODULES,
    CURATED_LIBRARIES,
    FREE_TIER_MAX_TOOLS,
    CodeValidator,
    Tier,
)
from core.services.tool_loader import compile_server_tools

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
    technical_details: list[str] | None = Field(
        default=None,
        description="Additional technical details generated during refinement (API schemas, endpoint specifications, etc.)",
    )

    @field_validator("technical_details", mode="before")
    @classmethod
    def _technical_details_to_list(cls, v: object) -> list[str] | None:
        """Coerce LLM output: sometimes returns string instead of array."""
        if v is None:
            return None
        if isinstance(v, str):
            return [v.strip()] if v.strip() else []
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        return []


class EnvVarsResponse(BaseModel):
    """Wrapper for list[EnvVar] to support structured outputs."""

    env_vars: list[EnvVar]


def _validate_tool_schemas(tools: list[Tool]) -> list[str]:
    """
    Validate generated tool schemas for anti-patterns that cause runtime failures.

    Returns list of error strings (empty if valid).
    """
    errors: list[str] = []

    for tool in tools:
        for param in tool.parameters:
            # Parameter names longer than 30 chars are likely verbose renames
            if len(param.name) > 30:
                errors.append(
                    f"Tool '{tool.name}': parameter '{param.name}' is very long ({len(param.name)} chars). "
                    f"Use concise snake_case names."
                )

    return errors


def load_prompt(filename: str, as_string: bool = True) -> str | dict[str, object]:
    try:
        with open(PROMPTS_DIR / filename, "r") as file:
            if as_string:
                return file.read()
            raw = cast(object, yaml.full_load(file))
            return cast(dict[str, object], raw) if isinstance(raw, dict) else {}
    except (FileNotFoundError, yaml.YAMLError) as e:
        print(f"Error loading prompt file {filename}: {e}")
        return "" if as_string else {}


class WizardStepsService:
    """
    Class encapsulating steps of MCPServer creation.
    Main logic revolves around generating tools/code with AI and moving setup_status accordingly as it gets approved.
    Core idea is for any current state to be present in database, no browser-session temporary state.
    methods that include LLMs should always be background_jobs spawned, not sync, as they take time.
    """

    # ── Marker constants (kept in sync with step_0_wizard_chat.yaml) ──
    READY_TO_START_MARKER: str = "---READY_TO_START---"
    END_READY_MARKER: str = "---END_READY---"
    TECHNICAL_DETAILS_MARKER: str = "---TECHNICAL_DETAILS---"
    END_TECHNICAL_DETAILS_MARKER: str = "---END_TECHNICAL_DETAILS---"

    # ── Step 0: Wizard chat session ──────────────────────────────────

    async def start_wizard_session(self, customer_id: UUID) -> MCPServer:
        """
        Create a new MCPServer in gathering_requirements status.
        Initialises empty chat history in meta.
        """
        from infrastructure.repositories.mcp_server import MCPServerCreate

        server: MCPServer = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="New MCP Server",
                customer_id=customer_id,
                meta={"step_zero_chat_history": []},
            )
        )
        _ = await Provider.mcp_server_repo().update_setup_status(
            server.id, MCPServerSetupStatus.gathering_requirements
        )
        return server

    async def _save_chat_history(
        self, server_id: UUID, history: list[dict[str, str]]
    ) -> None:
        """Persist the chat history list into server.meta."""
        server: MCPServer | None = await Provider.mcp_server_repo().get(server_id)  # type: ignore[arg-type]
        updated_meta: dict[Any, Any] = (
            dict(server.meta) if server and server.meta else {}
        )
        updated_meta["step_zero_chat_history"] = history
        _ = await Provider.mcp_server_repo().update(
            server_id, MCPServerUpdate(meta=updated_meta)
        )

    def _extract_ready_description(self, text: str) -> str | None:
        """Extract description between READY_TO_START markers."""
        start = text.find(self.READY_TO_START_MARKER)
        end = text.find(self.END_READY_MARKER)
        if start == -1 or end == -1 or end <= start:
            return None
        desc = text[start + len(self.READY_TO_START_MARKER) : end].strip()
        return desc or None

    def _extract_technical_details(self, text: str) -> str | None:
        """Extract technical details between markers."""
        start = text.find(self.TECHNICAL_DETAILS_MARKER)
        end = text.find(self.END_TECHNICAL_DETAILS_MARKER)
        if start == -1 or end == -1 or end <= start:
            return None
        details = text[start + len(self.TECHNICAL_DETAILS_MARKER) : end].strip()
        return details or None

    def is_ready_to_start(self, text: str) -> bool:
        """Check if text contains the ready-to-start markers."""
        return self.READY_TO_START_MARKER in text and self.END_READY_MARKER in text

    async def _post_process_assistant_response(
        self,
        server_id: UUID,
        assistant_text: str,
        history: list[dict[str, str]],
    ) -> None:
        """
        After an assistant response is fully accumulated:
        – save it to chat history
        – extract technical details and description if ready
        """
        history.append({"role": "assistant", "content": assistant_text})
        await self._save_chat_history(server_id, history)

        # Extract and merge technical details from all assistant messages
        all_technical_details: list[str] = []
        for msg in history:
            if msg["role"] == "assistant":
                details = self._extract_technical_details(msg["content"])
                if details:
                    all_technical_details.append(details)

        if all_technical_details:
            server: MCPServer | None = await Provider.mcp_server_repo().get(server_id)  # type: ignore[arg-type]
            updated_meta: dict[Any, Any] = (
                dict(server.meta) if server and server.meta else {}
            )
            updated_meta["technical_details"] = all_technical_details
            _ = await Provider.mcp_server_repo().update(
                server_id, MCPServerUpdate(meta=updated_meta)
            )

        # If ready, extract description too
        if self.is_ready_to_start(assistant_text):
            description = self._extract_ready_description(assistant_text)
            if description:
                _ = await Provider.mcp_server_repo().update(
                    server_id, MCPServerUpdate(description=description)
                )

    async def process_wizard_chat_message_stream(
        self,
        mcp_server_id: UUID,
        message: str,
    ) -> AsyncGenerator[str, None]:
        """
        Process a user message in the Step 0 chat with streaming.
        Yields Vercel AI SDK compatible text-stream chunks: ``0:"text"\\n``.
        Persists the full assistant response to DB after the stream completes.
        """
        server = await Provider.mcp_server_repo().get(mcp_server_id)  # type: ignore[arg-type]
        if server is None:
            raise ValueError(f"Server {mcp_server_id} not found")

        # Load existing history
        history: list[dict[str, str]] = list(
            (server.meta or {}).get("step_zero_chat_history", [])
        )
        history.append({"role": "user", "content": message})
        # Persist user message immediately
        await self._save_chat_history(mcp_server_id, history)

        # Build LLM messages
        system_prompt = load_prompt("step_0_wizard_chat.yaml")
        llm_messages: list[ChatCompletionMessageParam] = cast(
            list[ChatCompletionMessageParam],
            [
                {"role": "system", "content": system_prompt},
                *[{"role": m["role"], "content": m["content"]} for m in history],
            ],
        )

        # Stream from LLM
        stream = await openai_client.chat.completions.create(
            model=settings.WIZARD_CHAT_MODEL,
            messages=llm_messages,
            stream=True,
        )

        accumulated = ""
        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            content = delta.content if delta else None
            if content:
                accumulated += content
                yield content

        # Post-process: save response, extract markers
        await self._post_process_assistant_response(mcp_server_id, accumulated, history)

    async def process_wizard_chat_message(
        self,
        mcp_server_id: UUID,
        message: str,
    ) -> str:
        """
        Process a user message in the Step 0 chat without streaming (for CLI/agents).
        Returns the full assistant response text.
        Persists the full assistant response to DB.
        """
        server = await Provider.mcp_server_repo().get(mcp_server_id)  # type: ignore[arg-type]
        if server is None:
            raise ValueError(f"Server {mcp_server_id} not found")

        # Load existing history
        history: list[dict[str, str]] = list(
            (server.meta or {}).get("step_zero_chat_history", [])
        )
        history.append({"role": "user", "content": message})
        # Persist user message immediately
        await self._save_chat_history(mcp_server_id, history)

        # Build LLM messages
        system_prompt = load_prompt("step_0_wizard_chat.yaml")
        llm_messages: list[ChatCompletionMessageParam] = cast(
            list[ChatCompletionMessageParam],
            [
                {"role": "system", "content": system_prompt},
                *[{"role": m["role"], "content": m["content"]} for m in history],
            ],
        )

        response: ChatCompletion = await openai_client.chat.completions.create(
            model=settings.WIZARD_CHAT_MODEL,
            messages=llm_messages,
        )
        assistant_text: Any | Literal[""] = response.choices[0].message.content or ""

        # Post-process: save response, extract markers
        await self._post_process_assistant_response(
            mcp_server_id, assistant_text, history
        )

        return assistant_text

    async def step_1a_suggest_tools_for_mcp_server(
        self,
        description: str,
        mcp_server_id: UUID,
        prompt_file: str = "step_1_tool_suggestion.yaml",
    ) -> list[Tool]:
        """
        Tools are just a list of strings for now based on the description, but saved in db regardless.
        Suggested tools are stored in draft state in db.
        Sets status to tools_generating during LLM call, then tools_selection when done.
        """
        # Set generating status
        _ = await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.tools_generating
        )

        try:
            system_prompt = load_prompt(prompt_file)

            # Get server to access meta for technical details
            server = await Provider.mcp_server_repo().get(mcp_server_id)  # type: ignore[arg-type]
            technical_details: list[str] = cast(
                list[str],
                server.meta.get("technical_details", [])
                if server and server.meta
                else [],
            )

            # Build user content with description and technical details
            user_content = description
            if technical_details:
                technical_details_text = "\n\n".join(
                    f"Technical Details {i + 1}:\n{details}"
                    for i, details in enumerate(technical_details)
                )
                user_content = f"{description}\n\n---\n\nTECHNICAL DETAILS (use these to design tools with exact specifications):\n{technical_details_text}\n\n---\n\nWhen designing tools, ensure they match the technical details above. Use exact endpoint names, parameter names, types, and requirements from the technical details."

            messages: list[ChatCompletionMessageParam] = cast(
                list[ChatCompletionMessageParam],
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
            )
            parsed: list[Tool] = []
            max_retries = 3
            for attempt in range(max_retries):
                response = await openai_client.chat.completions.parse(
                    model=settings.TOOL_GENERATION_MODEL,
                    messages=messages,
                    response_format=ToolsResponse,
                )
                parsed_response = response.choices[0].message.parsed
                parsed = parsed_response.tools if parsed_response else []
                if parsed:
                    # Validate schemas before saving — catch anti-patterns early
                    schema_errors = _validate_tool_schemas(parsed)
                    if not schema_errors:
                        break
                    logger.warning(
                        f"[{mcp_server_id}] step_1a schema errors (attempt {attempt + 1}/{max_retries}): {schema_errors}"
                    )
                    # Feed errors back to LLM for correction
                    messages.append(
                        {
                            "role": "assistant",
                            "content": response.choices[0].message.content or "",
                        }
                    )
                    messages.append(
                        {
                            "role": "user",
                            "content": "Your tool definitions have issues. Please fix them and return corrected tools.\n\nErrors:\n"
                            + "\n".join(f"- {e}" for e in schema_errors),
                        }
                    )
                else:
                    logger.warning(
                        f"[{mcp_server_id}] step_1a returned no tools (attempt {attempt + 1}/{max_retries}), retrying"
                    )

            create_payloads: list[MCPToolCreate] = []
            for tool in parsed:
                create_payloads.append(
                    MCPToolCreate(
                        server_id=mcp_server_id,
                        name=tool.name,
                        description=tool.description,
                        parameters_schema=[p.model_dump() for p in tool.parameters],
                    )
                )
            _ = await Provider.mcp_tool_repo().create_bulk(create_payloads)
            return parsed
        finally:
            # Set to tools_selection when done (success or failure)
            _ = await Provider.mcp_server_repo().update_setup_status(
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
        _ = await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.tools_generating
        )
        server = await Provider.mcp_server_repo().get(mcp_server_id)
        if server is None:
            raise ValueError(f"Server {mcp_server_id} not found")

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

            system_prompt: str | dict[str, object] = load_prompt(prompt_file)

            # Include technical details from meta if available
            technical_details: list[str] = cast(
                list[str],
                server.meta.get("technical_details", []) if server.meta else [],
            )
            technical_details_text = ""
            if technical_details:
                technical_details_text = "\n\n".join(
                    f"Technical Details {i + 1}:\n{details}"
                    for i, details in enumerate(technical_details)
                )
                technical_details_text = f"\n\n---\n\nTECHNICAL DETAILS (use these to refine tools with exact specifications):\n{technical_details_text}\n\n---\n\nWhen refining tools, ensure they match the technical details above. Use exact endpoint names, parameter names, types, and requirements from the technical details."

            server_desc: str = (
                server.description if server and server.description is not None else ""
            )
            user_content = f"Server description:\n{server_desc}\n\nCurrent tools:\n{tools_description}\n\nUser feedback:\n{feedback}{technical_details_text}"

            messages: list[ChatCompletionMessageParam] = cast(
                list[ChatCompletionMessageParam],
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
            )
            response: ChatCompletion = await openai_client.chat.completions.parse(
                model=settings.TOOL_GENERATION_MODEL,
                messages=messages,
                response_format=ToolsResponse,
            )
            parsed_response = response.choices[0].message.parsed
            parsed: list[Tool] = cast(
                list[Tool], parsed_response.tools if parsed_response else []
            )

            # Validate schemas — retry once if anti-patterns found
            schema_errors = _validate_tool_schemas(parsed)
            if schema_errors:
                logger.warning(
                    f"[{mcp_server_id}] step_1b schema errors (first attempt): {schema_errors}"
                )
                messages.append(
                    {
                        "role": "assistant",
                        "content": response.choices[0].message.content or "",
                    }
                )
                messages.append(
                    {
                        "role": "user",
                        "content": "Your tool definitions have issues. Please fix them.\n\nErrors:\n"
                        + "\n".join(f"- {e}" for e in schema_errors),
                    }
                )
                response = await openai_client.chat.completions.parse(
                    model=settings.TOOL_GENERATION_MODEL,
                    messages=messages,
                    response_format=ToolsResponse,
                )
                parsed_response = response.choices[0].message.parsed
                parsed = cast(
                    list[Tool], parsed_response.tools if parsed_response else []
                )

            # Extract and merge additional technical details
            new_technical_details = (
                parsed_response.technical_details if parsed_response else None
            )
            if new_technical_details:
                # Merge with existing technical details, avoiding duplicates
                existing_technical_details = set(technical_details)
                merged_technical_details = list(
                    technical_details
                )  # Start with existing

                for new_detail in new_technical_details:
                    # Only add if it's not already present (simple deduplication)
                    if (
                        new_detail.strip()
                        and new_detail not in existing_technical_details
                    ):
                        merged_technical_details.append(new_detail.strip())
                        existing_technical_details.add(new_detail.strip())

                # Update server meta with merged technical details
                updated_meta = dict(server.meta) if server.meta else {}
                updated_meta["technical_details"] = merged_technical_details

                _ = await Provider.mcp_server_repo().update(
                    mcp_server_id,
                    MCPServerUpdate(meta=updated_meta),
                )

            _ = await Provider.mcp_tool_repo().delete_tools_for_server(mcp_server_id)

            create_payloads: list[MCPToolCreate] = []
            for tool in parsed:
                create_payloads.append(
                    MCPToolCreate(
                        server_id=mcp_server_id,
                        name=tool.name,
                        description=tool.description,
                        parameters_schema=[p.model_dump() for p in tool.parameters],
                    )
                )
            _ = await Provider.mcp_tool_repo().create_bulk(create_payloads)
            return parsed
        finally:
            # Set to tools_selection when done (success or failure)
            _ = await Provider.mcp_server_repo().update_setup_status(
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
        _ = await Provider.mcp_tool_repo().delete_tools_not_in_list(
            mcp_server_id, selected_tool_ids
        )
        _ = await Provider.mcp_server_repo().update_setup_status(
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
        _ = await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.env_vars_generating
        )
        server = await Provider.mcp_server_repo().get(mcp_server_id)

        try:
            system_prompt = load_prompt(prompt_file)
            server_desc = server.description if server else ""

            server_tools = await Provider.mcp_tool_repo().get_tools_for_server(
                mcp_server_id
            )
            tools_description = "\n".join(
                f"- {tool.name}: {tool.description} "
                + f"(params: {', '.join(p.get('name', '') for p in tool.parameters_schema)})"
                for tool in server_tools
            )
            technical_details: list[str] = cast(
                list[str],
                server.meta.get("technical_details", [])
                if server and server.meta
                else [],
            )
            technical_details_text = ""
            if technical_details:
                technical_details_text = "\n\nTechnical details:\n" + "\n".join(
                    f"- {detail}" for detail in technical_details
                )

            user_content = (
                f"Server description:\n{server_desc}\n\n"
                + f"Tools in this server:\n{tools_description}"
                + f"{technical_details_text}\n"
            )
            messages: list[ChatCompletionMessageParam] = cast(
                list[ChatCompletionMessageParam],
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
            )
            response = await openai_client.chat.completions.parse(
                model=settings.ENV_VARS_GENERATION_MODEL,
                messages=messages,
                response_format=EnvVarsResponse,
            )
            parsed_response = response.choices[0].message.parsed
            parsed: list[EnvVar] = parsed_response.env_vars if parsed_response else []

            create_payloads: list[MCPEnvironmentVariableCreate] = []
            for var in parsed:
                create_payloads.append(
                    MCPEnvironmentVariableCreate(
                        server_id=mcp_server_id,
                        name=var.name,
                        description=var.description,
                    )
                )
            _ = await Provider.environment_variable_repo().create_bulk(create_payloads)
            return parsed
        finally:
            # Set to env_vars_setup when done (success or failure)
            _ = await Provider.mcp_server_repo().update_setup_status(
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
        _ = await Provider.mcp_server_repo().update_setup_status(
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
            server_desc = server.description if server else ""

            server_tools = await Provider.mcp_tool_repo().get_tools_for_server(
                mcp_server_id
            )
            tools_description = "\n".join(
                f"- {tool.name}: {tool.description} "
                + f"(params: {', '.join(p.get('name', '') for p in tool.parameters_schema)})"
                for tool in server_tools
            )
            technical_details: list[str] = cast(
                list[str],
                server.meta.get("technical_details", [])
                if server and server.meta
                else [],
            )
            technical_details_text = ""
            if technical_details:
                technical_details_text = "\n\nTechnical details:\n" + "\n".join(
                    f"- {detail}" for detail in technical_details
                )

            user_content = (
                f"MCP description:\n{server_desc}\n\n"
                + f"Tools in this server:\n{tools_description}"
                + f"{technical_details_text}\n\n"
                + f"Current environment variables:\n{vars_description}\n\n"
                + f"User feedback:\n{feedback}"
            )

            messages: list[ChatCompletionMessageParam] = cast(
                list[ChatCompletionMessageParam],
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
            )
            response = await openai_client.chat.completions.parse(
                model=settings.ENV_VARS_GENERATION_MODEL,
                messages=messages,
                response_format=EnvVarsResponse,
            )
            parsed_response = response.choices[0].message.parsed
            parsed: list[EnvVar] = parsed_response.env_vars if parsed_response else []

            _ = await Provider.environment_variable_repo().delete_vars_for_server(
                mcp_server_id
            )

            create_payloads: list[MCPEnvironmentVariableCreate] = []
            for var in parsed:
                create_payloads.append(
                    MCPEnvironmentVariableCreate(
                        server_id=mcp_server_id,
                        name=var.name,
                        description=var.description,
                    )
                )
            _ = await Provider.environment_variable_repo().create_bulk(create_payloads)
            return parsed
        finally:
            # Set to env_vars_setup when done (success or failure)
            _ = await Provider.mcp_server_repo().update_setup_status(
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

        Skips auth_selection and transitions directly to code_generating.

        Parameters:
        - mcp_server_id: UUID - The ID of the MCP server
        - values: dict[UUID, str] - A dictionary of variable IDs and their values
        """
        _ = mcp_server_id  # Reserved for future setup_status transition
        for var_id, value in values.items():
            _ = await Provider.environment_variable_repo().update_value(var_id, value)

    async def step_3_set_header_auth(
        self,
        mcp_server_id: UUID,
    ) -> str:
        """
        Sets header auth to MCP server, generates a Bearer token and returns it.
        """
        token = secrets.token_urlsafe(32)
        _ = await Provider.static_api_key_repo().create_for_server(mcp_server_id, token)
        _ = await Provider.mcp_server_repo().update_auth_type(mcp_server_id, "bearer")
        return token

    async def _generate_tool_code(
        self,
        server: MCPServer,
        tool: MCPTool,
        prompt_template: str,
        tier: Tier,
        enable_logging: bool = False,
        server_id_for_log: UUID | None = None,
    ) -> str:
        """
        Build the code-generation prompt for a single tool and call the LLM
        with a retry loop that validates each attempt via CodeValidator.

        This is the single source of truth for the prompt-building +
        validation loop that was previously duplicated in
        step_4_generate_code_for_tools_and_env_vars and
        regenerate_code_for_tool.
        """
        log_prefix = f"[{server_id_for_log or server.id}]"
        logger_instance = logger.bind(tool_name=tool.name)
        if enable_logging:
            logger_instance.info(f"{log_prefix} [{tool.name}] Generating code for tool")

        # Only advertise libraries that are actually importable in the runtime.
        # This prevents the LLM from generating code that imports a package
        # (e.g. dateutil, psycopg) that isn't installed.
        import importlib

        available_libraries: list[str] = []
        for package, imports in CURATED_LIBRARIES.items():
            base = package.split(".")[0]
            try:
                importlib.import_module(base)
            except ImportError:
                continue  # Skip packages not installed in the runtime
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
            TECHNICAL_DETAILS=",".join(
                cast(list[str], (server.meta or {}).get("technical_details") or [])
            ),
            FUNCTION_NAME=tool.name,
            TOOL_NAME=tool.name,
            TOOL_DESCRIPTION=tool.description,
            MCP_SERVER_DESCRIPTION=server.description or "",
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
            logger_instance.info(f"{log_prefix} [{tool.name}] Prompt: {prompt}")

        messages: list[ChatCompletionMessageParam] = cast(
            list[ChatCompletionMessageParam],
            [{"role": "user", "content": prompt}],
        )
        code_validator = CodeValidator(tier)

        # Build expected parameter set and type map from the tool schema so we can catch
        # cases where the LLM renames, drops, adds parameters, or uses wrong types.
        expected_params: set[str] = {
            param["name"] for param in tool.parameters_schema if param.get("name")
        }
        expected_types: dict[str, str] = {
            param["name"]: param["type"]
            for param in tool.parameters_schema
            if param.get("name") and param.get("type")
        }

        MAX_RETRIES = 5
        code: str | None = None

        for _ in range(MAX_RETRIES):
            response = await openai_client.chat.completions.create(
                model=settings.CODE_GENERATION_MODEL,
                messages=messages,
            )
            code = response.choices[0].message.content
            if enable_logging:
                logger_instance.info(f"{log_prefix} [{tool.name}] Code: {code}")
            if code is None:
                continue
            errors = code_validator.validate(
                code,
                expected_params=expected_params if expected_params else None,
                expected_name=tool.name,
                expected_types=expected_types if expected_types else None,
            )
            if not errors:
                break
            if enable_logging:
                logger_instance.info(
                    f"{log_prefix} [{tool.name}] Code is not valid. Errors: {errors}"
                )
            messages.append({"role": "assistant", "content": code})
            messages.append(
                {
                    "role": "user",
                    "content": f"The code is not valid. Please fix the errors and return the code again. Errors: {errors}",
                }
            )

        if enable_logging:
            logger_instance.info(f"{log_prefix} [{tool.name}] Final code: {code}")

        if not code:
            raise RuntimeError(
                f"{log_prefix} Tool: {tool.name}, failed to generate code"
            )

        return code

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
        if server is None:
            raise ValueError(f"Server {mcp_server_id} not found")

        if server.setup_status == MCPServerSetupStatus.code_generating:
            # Allow retry if tools have no code (previous run failed)
            has_code = any(t.code and t.code.strip() for t in server.tools)
            if has_code:
                logger.warning(
                    f"[{mcp_server_id}] Code generation already in progress, skipping duplicate call"
                )
                return
            logger.info(
                f"[{mcp_server_id}] Retrying code generation (tools have no code from previous failed run)"
            )

        # Clear any previous processing_error when retrying
        updated_meta = dict(server.meta or {})
        if "processing_error" in updated_meta:
            del updated_meta["processing_error"]
            _ = await Provider.mcp_server_repo().update(
                mcp_server_id, MCPServerUpdate(meta=updated_meta)
            )

        # Set generating status
        _ = await Provider.mcp_server_repo().update_setup_status(
            mcp_server_id, MCPServerSetupStatus.code_generating
        )

        # customer_id = server.customer_id
        # customer = await Provider.customer_repo().get(customer_id)
        # tier = Tier(customer.tier)
        tier = Tier.FREE

        system_prompt_data = load_prompt("step_4_code_generation.yaml", as_string=False)
        assert isinstance(system_prompt_data, dict)
        prompt_template = system_prompt_data.get("prompt", "")
        assert isinstance(prompt_template, str)

        async def generate_code_for_tool(
            pt: str, tool: MCPTool, enable_logging: bool = False
        ) -> str:
            return await self._generate_tool_code(
                server=server,
                tool=tool,
                prompt_template=pt,
                tier=tier,
                enable_logging=enable_logging,
                server_id_for_log=mcp_server_id,
            )

        tasks = [generate_code_for_tool(prompt_template, tool) for tool in server.tools]

        try:
            start_time = time.time()
            results = await asyncio.gather(*tasks, return_exceptions=True)
            end_time = time.time()
            logger.info(
                f"[{mcp_server_id}] Time taken: {end_time - start_time} seconds"
            )
            for tool, result in zip(server.tools, results):
                if isinstance(result, BaseException):
                    logger.error(
                        f"[{mcp_server_id}] Tool: {tool.name}, failed: {result}"
                    )
                    raise result
                code: str = result
                if not code:
                    logger.error(
                        f"[{mcp_server_id}] Tool: {tool.name}, failed to generate code"
                    )
                _ = await Provider.mcp_tool_repo().update_tool_code(tool.id, code)
                logger.success(
                    f"[{mcp_server_id}] Tool: {tool.name}, completed code generation"
                )

            _ = await Provider.mcp_server_repo().update_setup_status(
                mcp_server_id, MCPServerSetupStatus.code_gen
            )
        except Exception as e:
            logger.exception(f"[{mcp_server_id}] Code generation failed: {e}")
            _ = await Provider.mcp_server_repo().update(
                mcp_server_id,
                MCPServerUpdate(
                    meta={**(server.meta or {}), "processing_error": str(e)},
                ),
            )
            _ = await Provider.mcp_server_repo().update_setup_status(
                mcp_server_id, MCPServerSetupStatus.deployment_selection
            )
            raise

    async def regenerate_code_for_tool(
        self,
        mcp_server_id: UUID,
        tool_id: UUID,
    ) -> str:
        """
        Regenerate code for a single tool. Uses same LLM logic as step_4.
        Returns the generated code. Raises on failure.
        """
        server = await Provider.mcp_server_repo().get_by_uuid(mcp_server_id)
        if server is None:
            raise ValueError(f"Server {mcp_server_id} not found")

        tool = await Provider.mcp_tool_repo().get_by_uuid(tool_id)
        if tool is None:
            raise ValueError(f"Tool {tool_id} not found")
        if tool.server_id != mcp_server_id:
            raise ValueError(
                f"Tool {tool_id} does not belong to server {mcp_server_id}"
            )

        tier = Tier.FREE
        system_prompt_data = load_prompt("step_4_code_generation.yaml", as_string=False)
        assert isinstance(system_prompt_data, dict)
        prompt_template_val = system_prompt_data.get("prompt", "")
        assert isinstance(prompt_template_val, str)

        code = await self._generate_tool_code(
            server=server,
            tool=tool,
            prompt_template=prompt_template_val,
            tier=tier,
            enable_logging=False,
            server_id_for_log=mcp_server_id,
        )

        _ = await Provider.mcp_tool_repo().update_tool_code(tool_id, code)
        logger.success(f"[{mcp_server_id}] Regenerated code for tool {tool.name}")
        return code

    async def step_5_deploy_to_shared(
        self,
        mcp_server_id: UUID,
        app: FastAPI,
        stack: AsyncExitStack,
    ) -> tuple[str, str]:
        """
        Deploy MCP server to the shared runtime.

        Validates tools, compiles them, registers with shared runtime,
        creates deployment record, generates API key, and updates server status to ready.

        Returns tuple of (endpoint_url, bearer_token).
        """
        server_repo = Provider.mcp_server_repo()
        deployment_repo = Provider.deployment_repo()

        # Load server with tools
        server = await server_repo.get_with_tools(mcp_server_id)
        if not server:
            raise ValueError(f"Server {mcp_server_id} not found")

        # Idempotent: if already deployed, return existing endpoint and token
        existing = await deployment_repo.get_by_server_id(mcp_server_id)
        if existing and existing.status == DeploymentStatus.ACTIVE.value:
            api_key = await Provider.static_api_key_repo().get_by_server_id(
                mcp_server_id
            )
            token = api_key.key if api_key else ""
            _ = await server_repo.update_setup_status(
                mcp_server_id, MCPServerSetupStatus.ready
            )
            return existing.endpoint_url or "", token

        # Check tool count for free tier
        if len(server.tools) > FREE_TIER_MAX_TOOLS:
            raise ValueError(
                f"Free tier allows max {FREE_TIER_MAX_TOOLS} tools. "
                + f"You have {len(server.tools)}. Upgrade to paid for more."
            )

        # Validate and compile tools
        env_var_repo = Provider.environment_variable_repo()
        compiled_tools = await compile_server_tools(
            server=server,
            tools=server.tools,
            env_var_repo=env_var_repo,
            raise_on_missing_code=True,
        )

        # Register with shared runtime.
        # Must run in a separate task to avoid cancel-scope conflict: entering the
        # new server's lifespan binds a cancel scope to the current task, which
        # breaks the meta server's MCP session cleanup (RuntimeError: "Attempted
        # to exit a cancel scope that isn't the current task's current cancel scope").
        done: asyncio.Event = asyncio.Event()

        async def _register_in_task() -> None:
            await register_new_customer_app(
                app, mcp_server_id, compiled_tools, stack=stack
            )
            done.set()

        _ = asyncio.create_task(_register_in_task())
        await done.wait()

        # Create or update deployment record
        endpoint_url = f"/mcp/{mcp_server_id}/mcp"
        if existing:
            # Update existing deployment
            _ = await deployment_repo.activate(existing.id, endpoint_url)
        else:
            # Create new deployment
            deployment = await deployment_repo.create(
                DeploymentCreate(
                    server_id=mcp_server_id,
                    target=DeploymentTarget.SHARED.value,
                    status=DeploymentStatus.ACTIVE.value,
                    endpoint_url=endpoint_url,
                )
            )
            # Set deployed_at
            _ = await deployment_repo.activate(deployment.id, endpoint_url)

        # Reuse existing API key if auth step already created one
        api_key_repo = Provider.static_api_key_repo()
        existing_key = await api_key_repo.get_by_server_id(mcp_server_id)
        if existing_key:
            token = existing_key.key
        else:
            token = secrets.token_urlsafe(32)
            _ = await api_key_repo.create_for_server(mcp_server_id, token)
        _ = await Provider.mcp_server_repo().update_auth_type(mcp_server_id, "bearer")

        # Update server setup status to READY
        _ = await server_repo.update_setup_status(
            mcp_server_id, MCPServerSetupStatus.ready
        )

        logger.success(f"Server {mcp_server_id} deployed to shared runtime")
        return endpoint_url, token
