import json
from enum import Enum
from typing import Any

from loguru import logger
from pydantic import BaseModel, Field

from services.llm_client import ChatMessage, LLMClient, get_llm_client


class FlowStep(str, Enum):
    DESCRIBE_SYSTEM = "describe_system"
    REFINE_ACTIONS = "refine_actions"
    CONFIGURE_AUTH = "configure_auth"
    REVIEW_AND_DEPLOY = "review_and_deploy"


class AuthType(str, Enum):
    OAUTH = "oauth"
    EPHEMERAL = "ephemeral"
    NONE = "none"


class ActionSpec(BaseModel):
    """Specification for a single action/tool."""

    name: str
    description: str
    parameters: list[dict[str, Any]] = Field(default_factory=list)
    auth_required: bool = False


class MCPDesign(BaseModel):
    """Complete MCP server design."""

    server_name: str = "my_mcp_server"
    description: str = ""
    actions: list[ActionSpec] = Field(default_factory=list)
    auth_type: AuthType = AuthType.NONE
    auth_config: dict[str, Any] = Field(default_factory=dict)


SYSTEM_PROMPT = """You are an expert at designing MCP (Model Context Protocol) servers. Your job is to help users define ACTIONS (tools) their server should perform.

Focus on ACTIONS - what the server can DO, not code implementation.

When the user describes their system, extract and suggest concrete actions. For each action, specify:
- name: A clear snake_case name
- description: What this action does
- parameters: List of inputs needed (name, type, description)
- auth_required: Whether this action needs authentication

After understanding the user's needs, output the actions in this JSON format:

```json
{
  "server_name": "descriptive_name",
  "description": "What this server does",
  "actions": [
    {
      "name": "action_name",
      "description": "What this action does",
      "parameters": [
        {"name": "param1", "type": "string", "description": "Parameter description"}
      ],
      "auth_required": true
    }
  ]
}
```

Be helpful and suggest useful actions the user might not have thought of. Keep descriptions concise and action-oriented."""


class ChatService:
    """Service for interactive chat-based MCP server creation."""

    def __init__(self, llm_client: LLMClient | None = None):
        self.llm = llm_client or get_llm_client()

    async def chat(
        self,
        user_message: str,
        history: list[dict[str, str]] | None = None,
        current_step: FlowStep = FlowStep.DESCRIBE_SYSTEM,
    ) -> tuple[str, MCPDesign | None]:
        """Process a user message and return the assistant's response."""
        messages = [ChatMessage(role="system", content=SYSTEM_PROMPT)]

        if history:
            for msg in history:
                messages.append(ChatMessage(role=msg["role"], content=msg["content"]))

        messages.append(ChatMessage(role="user", content=user_message))

        response = await self.llm.chat(messages)
        design = self._extract_design(response.content)

        return response.content, design

    async def suggest_actions(
        self, system_description: str
    ) -> tuple[str, MCPDesign | None]:
        """Generate action suggestions from a system description."""
        prompt = f"""Based on this system description, suggest a set of actions (tools) this MCP server should have:

"{system_description}"

Think about:
1. What are the main operations users would want to perform?
2. What data would they need to read or write?
3. Are there any integrations or external services involved?
4. Which actions would require authentication?

Output the actions in JSON format."""

        messages = [
            ChatMessage(role="system", content=SYSTEM_PROMPT),
            ChatMessage(role="user", content=prompt),
        ]

        response = await self.llm.chat(messages)
        design = self._extract_design(response.content)

        return response.content, design

    async def refine_actions(
        self,
        current_actions: list[ActionSpec],
        feedback: str,
    ) -> tuple[str, list[ActionSpec] | None]:
        """Refine actions based on user feedback."""
        actions_json = json.dumps([a.model_dump() for a in current_actions], indent=2)

        prompt = f"""Current actions:
```json
{actions_json}
```

User feedback: {feedback}

Update the actions based on this feedback. Add, remove, or modify actions as needed.
Output the complete updated list in JSON format."""

        messages = [
            ChatMessage(role="system", content=SYSTEM_PROMPT),
            ChatMessage(role="user", content=prompt),
        ]

        response = await self.llm.chat(messages)
        design = self._extract_design(response.content)

        if design:
            return response.content, design.actions
        return response.content, None

    def _extract_design(self, content: str) -> MCPDesign | None:
        """Try to extract MCP design from the response."""
        try:
            start = content.find("```json")
            if start == -1:
                start = content.find("```")
                if start == -1:
                    return None
                start += 3
            else:
                start += 7

            end = content.find("```", start)
            if end == -1:
                return None

            json_str = content[start:end].strip()
            data = json.loads(json_str)

            actions = []
            for action_data in data.get("actions", []):
                actions.append(
                    ActionSpec(
                        name=action_data.get("name", ""),
                        description=action_data.get("description", ""),
                        parameters=action_data.get("parameters", []),
                        auth_required=action_data.get("auth_required", False),
                    )
                )

            return MCPDesign(
                server_name=data.get("server_name", "my_mcp_server"),
                description=data.get("description", ""),
                actions=actions,
            )
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.debug(f"Could not extract design from response: {e}")
            return None


_chat_service: ChatService | None = None


def get_chat_service() -> ChatService:
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
