"""Wizard service for MCP server creation with DB persistence."""

import json
import re
from pathlib import Path
from typing import Any
from uuid import UUID

import yaml
from loguru import logger
from pydantic import BaseModel

from core.services.llm_client import ChatMessage, get_llm_client
from core.services.tool_loader import get_tool_loader
from infrastructure.models.mcp_server import MCPTool, WizardStep


class ActionSpec(BaseModel):
    """Specification for a single action/tool."""

    name: str
    description: str
    parameters: list[dict[str, Any]] = []
    auth_required: bool = False


class WizardResult(BaseModel):
    """Result from wizard operations."""

    server_id: UUID
    server_name: str
    description: str
    actions: list[ActionSpec]


def _load_prompt(name: str) -> str:
    """Load a prompt from YAML file."""
    prompt_path = Path(__file__).parent.parent / "prompts" / f"{name}.yaml"
    if prompt_path.exists():
        with open(prompt_path) as f:
            data = yaml.safe_load(f)
            return data.get("prompt", "")
    return ""


ACTION_SUGGESTION_PROMPT = """You are an expert at designing MCP server actions.
Given a system description, suggest concrete tools the server should have.

For each tool specify:
- name: snake_case function name
- description: What this tool does
- parameters: List of inputs needed (each with name, type, description)
- auth_required: Whether authentication is needed

If an OpenAPI schema is provided, use it to derive accurate API endpoints, parameters, and descriptions.
Each OpenAPI path/operation should map to one tool. Use the operation's parameters and request body schema.

Output ONLY valid JSON in this exact format:
{
    "server_name": "descriptive_snake_case_name",
    "description": "What this MCP server does",
    "actions": [
        {
            "name": "action_name",
            "description": "What this action does",
            "parameters": [
                {"name": "param1", "type": "string", "description": "...", "required": true}
            ],
            "auth_required": false
        }
    ]
}"""


def _get_tool_generation_prompt() -> str:
    """Get the tool generation prompt."""
    yaml_prompt = _load_prompt("tool_generation_prompt")
    if yaml_prompt:
        return yaml_prompt
    return """You are an MCP tools builder in Python on FastMCP v2

CRITICAL RULES:
1. Build isolated async functions - everything declared inside
2. No outside definitions, constants or imports
3. Use ONLY these pre-imported libraries: httpx, json, datetime, re, pydantic
4. Return a fully typed async function that works as-is
5. Include proper error handling
6. Do NOT include the @mcp.tool() decorator

OUTPUT FORMAT:
Return ONLY the function code in a ```python``` block."""


class WizardService:
    """Orchestrates the wizard flow with DB persistence."""

    def __init__(
        self,
        server_repo,
        tool_repo,
    ):
        self.server_repo = server_repo
        self.tool_repo = tool_repo
        self.llm = get_llm_client()
        self.tool_loader = get_tool_loader()

    async def start_wizard(
        self,
        customer_id: UUID,
        description: str,
        openapi_schema: str | None = None,
    ) -> WizardResult:
        """
        Step 1: Create server, suggest actions, save to DB.

        Args:
            customer_id: Customer ID (Auth user ID)
            description: User's description of what they want

        Returns:
            WizardResult with server_id and suggested actions
        """
        # Build user message with optional OpenAPI schema context
        user_content = description
        if openapi_schema:
            user_content = f"""User Description: {description}

OpenAPI Schema:
```json
{openapi_schema}
```

Generate actions based on both the description and the OpenAPI schema above."""

        # Ask LLM to suggest actions
        messages = [
            ChatMessage(role="system", content=ACTION_SUGGESTION_PROMPT),
            ChatMessage(role="user", content=user_content),
        ]

        response = await self.llm.chat(messages, temperature=0.7)

        # Parse the JSON response
        design = self._extract_json(response.content)

        server_name = design.get("server_name", "mcp_server")
        server_description = design.get("description", description)
        actions_data = design.get("actions", [])

        # Create server in DB
        from infrastructure.repositories.mcp_server import MCPServerCreate

        server = await self.server_repo.create(
            MCPServerCreate(
                name=server_name,
                description=server_description,
                customer_id=customer_id,
                meta={
                    "user_prompt": description,
                    "wizard_step": WizardStep.ACTIONS.value,
                    **({"openapi_schema": openapi_schema} if openapi_schema else {}),
                },
            )
        )

        # Create tools in DB (without code yet)
        actions = []
        for action_data in actions_data:
            action = ActionSpec(**action_data)
            actions.append(action)

            from infrastructure.repositories.mcp_server import MCPToolCreate

            await self.tool_repo.create(
                MCPToolCreate(
                    server_id=server.id,
                    name=action.name,
                    description=action.description,
                    parameters_schema={"parameters": action.parameters},
                    code="",  # Will be generated in refine step
                )
            )

        return WizardResult(
            server_id=server.id,
            server_name=server_name,
            description=server_description,
            actions=actions,
        )

    async def refine_actions(
        self,
        server_id: UUID,
        feedback: str,
        description: str | None = None,
    ) -> list[ActionSpec]:
        """
        Step 2: Refine actions based on feedback, generate code, save to DB.

        Args:
            server_id: Server UUID
            feedback: User's feedback for refining actions
            description: Optional updated user prompt/description
        """
        server = await self.server_repo.get_with_tools(server_id)
        if not server:
            raise ValueError(f"Server {server_id} not found")

        # Update user_prompt in meta if provided (this is the user's step 1 input)
        if description:
            from infrastructure.repositories.mcp_server import MCPServerUpdate

            new_meta = {**(server.meta or {}), "user_prompt": description}
            await self.server_repo.update(
                server_id,
                MCPServerUpdate(meta=new_meta),
            )
            # Update local server object for context
            server.meta = new_meta

        # Build context from existing tools
        existing_actions = [
            {
                "name": t.name,
                "description": t.description,
                "parameters": t.parameters_schema.get("parameters", []),
            }
            for t in server.tools
        ]

        messages = [
            ChatMessage(role="system", content=ACTION_SUGGESTION_PROMPT),
            ChatMessage(
                role="user",
                content=f"""Current server: {server.name}
Description: {server.description}

Current actions:
{json.dumps(existing_actions, indent=2)}

User feedback: {feedback}

Update the actions based on this feedback. Return the complete updated list.""",
            ),
        ]

        response = await self.llm.chat(messages, temperature=0.7)
        design = self._extract_json(response.content)

        # Delete old tools and create new ones
        await self.tool_repo.delete_tools_for_server(server_id)

        actions_data = design.get("actions", [])
        actions = []

        for action_data in actions_data:
            action = ActionSpec(**action_data)
            actions.append(action)

            # Generate code for this tool
            code = await self._generate_tool_code(action)

            from infrastructure.repositories.mcp_server import MCPToolCreate

            await self.tool_repo.create(
                MCPToolCreate(
                    server_id=server_id,
                    name=action.name,
                    description=action.description,
                    parameters_schema={"parameters": action.parameters},
                    code=code,
                    is_validated=True,
                )
            )

        return actions

    async def confirm_actions(
        self,
        server_id: UUID,
        selected_actions: list[str],
    ) -> None:
        """
        Step 2b: Confirm selected actions (delete unselected ones).

        Args:
            server_id: Server UUID
            selected_actions: List of action names to keep
        """
        server = await self.server_repo.get_with_tools(server_id)
        if not server:
            raise ValueError(f"Server {server_id} not found")

        # Get current tool names
        current_tool_names = {t.name for t in server.tools}

        # Verify selected actions exist
        for name in selected_actions:
            if name not in current_tool_names:
                # Warning or ignore? We'll ignore and just keep valid ones.
                logger.warning(
                    f"Selected action {name} not found in server {server_id}"
                )

        # Delete unselected tools
        for tool in server.tools:
            if tool.name not in selected_actions:
                # We assume tool_repo has delete method.
                # If not, we might need delete_by_id or similar.
                # Assuming standard repo pattern.
                if hasattr(self.tool_repo, "delete"):
                    await self.tool_repo.delete(tool.id)
                else:
                    logger.error("Tool repo missing delete method")

    async def generate_tool_codes(self, server_id: UUID) -> list[MCPTool]:
        """
        Generate code for all tools in a server.

        Args:
            server_id: Server UUID

        Returns:
            List of tools with generated code
        """
        tools = await self.tool_repo.get_tools_for_server(server_id)

        for tool in tools:
            if not tool.code:
                action = ActionSpec(
                    name=tool.name,
                    description=tool.description,
                    parameters=tool.parameters_schema.get("parameters", []),
                )
                code = await self._generate_tool_code(action)
                await self.tool_repo.update_tool_code(tool.id, code)
                tool.code = code

        return tools

    async def configure_auth(
        self,
        server_id: UUID,
        auth_type: str,
        auth_config: dict[str, Any] | None = None,
    ) -> None:
        """
        Step 3: Configure authentication.

        Args:
            server_id: Server UUID
            auth_type: Type of auth (none, oauth, ephemeral)
            auth_config: Optional auth configuration
        """
        from infrastructure.repositories.mcp_server import MCPServerUpdate

        await self.server_repo.update(
            server_id,
            MCPServerUpdate(auth_type=auth_type, auth_config=auth_config),
        )

    async def get_server_state(self, server_id: UUID) -> dict[str, Any]:
        """Get current state of a server for the wizard UI."""
        server = await self.server_repo.get_with_tools(server_id)
        if not server:
            raise ValueError(f"Server {server_id} not found")

        return {
            "server_id": str(server.id),
            "server_name": server.name,
            "description": server.description,
            "status": server.status,
            "wizard_step": server.wizard_step,
            "user_prompt": server.meta.get("user_prompt") if server.meta else None,
            "tier": server.tier,
            "auth_type": server.auth_type,
            "auth_config": server.auth_config,
            "meta": server.meta,
            "tools": [
                {
                    "id": str(t.id),
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.parameters_schema.get("parameters", []),
                    "has_code": bool(t.code),
                }
                for t in server.tools
            ],
        }

    async def _generate_tool_code(self, action: ActionSpec) -> str:
        """Generate code for a single tool using LLM."""
        prompt = _get_tool_generation_prompt()

        # Build parameter description
        params_desc = ""
        for p in action.parameters:
            params_desc += f"- {p['name']}: {p.get('type', 'string')} - {p.get('description', '')}\n"

        messages = [
            ChatMessage(role="system", content=prompt),
            ChatMessage(
                role="user",
                content=f"""Generate an async function for this tool:

Name: {action.name}
Description: {action.description}
Parameters:
{params_desc if params_desc else "No parameters"}

Return ONLY the function code.""",
            ),
        ]

        response = await self.llm.chat(messages, temperature=0.3)
        return self._extract_code(response.content)

    def _extract_json(self, content: str) -> dict[str, Any]:
        """Extract JSON from LLM response."""
        # Try to find JSON in markdown code block
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Try to parse the whole content as JSON
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # Try to find JSON object in content
        json_match = re.search(r"\{[\s\S]*\}", content)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass

        logger.warning(f"Failed to extract JSON from: {content[:200]}")
        return {}

    def _extract_code(self, content: str) -> str:
        """Extract Python code from LLM response."""
        # Try to find code in markdown code block
        code_match = re.search(r"```(?:python)?\s*([\s\S]*?)```", content)
        if code_match:
            return code_match.group(1).strip()

        # Return content as-is (might be raw code)
        return content.strip()


# Singleton with lazy initialization
_wizard_service: WizardService | None = None


def get_wizard_service(server_repo, tool_repo) -> WizardService:
    """Get wizard service instance."""
    global _wizard_service
    if _wizard_service is None:
        _wizard_service = WizardService(server_repo, tool_repo)
    return _wizard_service
