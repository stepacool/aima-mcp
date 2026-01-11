import json
from typing import Any

from loguru import logger
from pydantic import BaseModel

from services.llm_client import ChatMessage, LLMClient, get_llm_client

SYSTEM_PROMPT = """You are an expert MCP (Model Context Protocol) server designer. Your job is to help users create custom MCP servers with tools and prompts.

When the user describes what they want their MCP server to do, you should:
1. Ask clarifying questions if needed
2. Propose tools and prompts that would fulfill their requirements
3. For each tool, specify:
   - name: A snake_case name for the tool
   - description: What the tool does
   - parameters: JSON schema for the tool's parameters
   - implementation: A brief description of what the code should do

4. For each prompt, specify:
   - name: A snake_case name for the prompt
   - description: What the prompt is for
   - template: The prompt template with {placeholders} for arguments
   - arguments: List of argument names and their descriptions

When you have a complete design, output it in the following JSON format wrapped in ```json``` code blocks:

```json
{
  "server_name": "my_server",
  "description": "Description of what this server does",
  "tools": [
    {
      "name": "tool_name",
      "description": "What this tool does",
      "parameters": {
        "type": "object",
        "properties": {
          "param1": {"type": "string", "description": "Parameter description"}
        },
        "required": ["param1"]
      },
      "implementation": "Description of the implementation logic"
    }
  ],
  "prompts": [
    {
      "name": "prompt_name",
      "description": "What this prompt is for",
      "template": "Template with {arg1} placeholders",
      "arguments": [
        {"name": "arg1", "description": "Argument description", "required": true}
      ]
    }
  ]
}
```

Be creative and helpful. If the user's request is vague, suggest useful tools and prompts they might not have thought of."""


class MCPDesign(BaseModel):
    """Parsed MCP server design from LLM response."""

    server_name: str
    description: str
    tools: list[dict[str, Any]]
    prompts: list[dict[str, Any]]


class ChatService:
    """Service for interactive chat-based MCP server creation."""

    def __init__(self, llm_client: LLMClient | None = None):
        self.llm = llm_client or get_llm_client()

    async def chat(
        self,
        user_message: str,
        history: list[dict[str, str]] | None = None,
    ) -> tuple[str, MCPDesign | None]:
        """
        Process a user message and return the assistant's response.

        Returns:
            Tuple of (response_text, parsed_design_if_complete)
        """
        messages = [ChatMessage(role="system", content=SYSTEM_PROMPT)]

        if history:
            for msg in history:
                messages.append(ChatMessage(role=msg["role"], content=msg["content"]))

        messages.append(ChatMessage(role="user", content=user_message))

        response = await self.llm.chat(messages)

        design = self._extract_design(response.content)

        return response.content, design

    def _extract_design(self, content: str) -> MCPDesign | None:
        """Try to extract a complete MCP design from the response."""
        try:
            start = content.find("```json")
            if start == -1:
                return None

            end = content.find("```", start + 7)
            if end == -1:
                return None

            json_str = content[start + 7 : end].strip()
            data = json.loads(json_str)

            return MCPDesign(
                server_name=data.get("server_name", "my_mcp_server"),
                description=data.get("description", ""),
                tools=data.get("tools", []),
                prompts=data.get("prompts", []),
            )
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.debug(f"Could not extract design from response: {e}")
            return None

    async def refine_design(
        self,
        current_design: MCPDesign,
        feedback: str,
        history: list[dict[str, str]] | None = None,
    ) -> tuple[str, MCPDesign | None]:
        """Refine an existing design based on user feedback."""
        context = f"""The current MCP server design is:

```json
{current_design.model_dump_json(indent=2)}
```

User feedback: {feedback}

Please update the design based on this feedback and output the complete updated design."""

        return await self.chat(context, history)


# Singleton instance
_chat_service: ChatService | None = None


def get_chat_service() -> ChatService:
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
