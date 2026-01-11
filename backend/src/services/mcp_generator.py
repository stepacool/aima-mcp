import re

from pydantic import BaseModel

from services.chat_service import ActionSpec, AuthType, MCPDesign
from services.llm_client import ChatMessage, LLMClient, get_llm_client

CODE_GEN_SYSTEM_PROMPT = """You are an expert Python developer specializing in MCP (Model Context Protocol) servers using the fastmcp library.

Generate working Python code for MCP tools based on specifications.

Guidelines:
1. Use fastmcp library conventions
2. Tools should be async functions decorated with @mcp.tool()
3. Use proper type hints with Pydantic Field for descriptions
4. Include error handling
5. Keep implementations focused and practical
6. For file operations, use pathlib
7. Return meaningful results

Example tool:
```python
@mcp.tool()
async def get_weather(
    city: str = Field(description="City name"),
    units: str = Field(default="celsius", description="Temperature units")
) -> dict:
    \"\"\"Get current weather for a city.\"\"\"
    # Implementation here
    return {"city": city, "temperature": 22, "units": units}
```

Generate ONLY the Python code for the tool function, no imports or server setup."""


class GeneratedTool(BaseModel):
    name: str
    code: str


class MCPGenerator:
    """Generates fastmcp code from MCP designs."""

    def __init__(self, llm_client: LLMClient | None = None):
        self.llm = llm_client or get_llm_client()

    async def generate_action_code(
        self,
        action: ActionSpec,
        auth_type: AuthType = AuthType.NONE,
    ) -> str:
        """Generate Python code for a single action/tool."""
        params_desc = "\n".join(
            f"  - {p.get('name')}: {p.get('type', 'string')} - {p.get('description', '')}"
            for p in action.parameters
        )

        auth_note = ""
        if action.auth_required:
            if auth_type == AuthType.OAUTH:
                auth_note = "This action requires OAuth authentication. Include token validation."
            elif auth_type == AuthType.EPHEMERAL:
                auth_note = (
                    "This action uses ephemeral credentials passed as parameters."
                )

        prompt = f"""Generate a fastmcp tool for:

Name: {action.name}
Description: {action.description}
Parameters:
{params_desc if params_desc else "  (no parameters)"}

{auth_note}

Generate only the @mcp.tool() decorated function. Output in ```python``` block."""

        messages = [
            ChatMessage(role="system", content=CODE_GEN_SYSTEM_PROMPT),
            ChatMessage(role="user", content=prompt),
        ]

        response = await self.llm.chat(messages, temperature=0.3)
        return self._extract_code(response.content)

    async def generate_full_server(self, design: MCPDesign) -> str:
        """Generate a complete fastmcp server from a design."""
        actions_code = []
        for action in design.actions:
            code = await self.generate_action_code(action, design.auth_type)
            actions_code.append(code)

        # Build auth helper if needed
        auth_imports = ""
        auth_helper = ""

        if design.auth_type == AuthType.OAUTH and any(
            a.auth_required for a in design.actions
        ):
            auth_imports = "import httpx\n"
            provider_url = design.auth_config.get("provider_url", "")
            client_id = design.auth_config.get("client_id", "")
            scopes = design.auth_config.get("scopes", [])
            auth_helper = f'''
# OAuth configuration
OAUTH_CONFIG = {{
    "provider_url": "{provider_url}",
    "client_id": "{client_id}",
    "scopes": {scopes},
}}


async def validate_token(token: str) -> dict:
    """Validate OAuth token and return user info."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{{OAUTH_CONFIG['provider_url']}}/userinfo",
            headers={{"Authorization": f"Bearer {{token}}"}}
        )
        resp.raise_for_status()
        return resp.json()

'''
        elif design.auth_type == AuthType.EPHEMERAL and any(
            a.auth_required for a in design.actions
        ):
            auth_helper = """
# Ephemeral credentials are passed directly to actions that require auth
# No persistent token storage - credentials provided at runtime

"""

        server_code = f'''"""
{design.description}

Auto-generated MCP server using fastmcp.
"""
from fastmcp import FastMCP
from pydantic import Field
{auth_imports}
mcp = FastMCP("{design.server_name}")

{auth_helper}
# Actions
{chr(10).join(actions_code)}


if __name__ == "__main__":
    mcp.run()
'''
        return server_code

    def _extract_code(self, content: str) -> str:
        """Extract Python code from markdown code blocks."""
        match = re.search(r"```python\n(.*?)```", content, re.DOTALL)
        if match:
            return match.group(1).strip()

        match = re.search(r"```\n(.*?)```", content, re.DOTALL)
        if match:
            return match.group(1).strip()

        return content.strip()


_mcp_generator: MCPGenerator | None = None


def get_mcp_generator() -> MCPGenerator:
    global _mcp_generator
    if _mcp_generator is None:
        _mcp_generator = MCPGenerator()
    return _mcp_generator
