import json
import re
from typing import Any

from pydantic import BaseModel

from services.chat_service import MCPDesign
from services.llm_client import ChatMessage, LLMClient, get_llm_client

CODE_GEN_SYSTEM_PROMPT = """You are an expert Python developer specializing in MCP (Model Context Protocol) servers using the fastmcp library.

Your task is to generate working Python code for MCP tools based on specifications.

Guidelines:
1. Use the fastmcp library conventions
2. Tools should be async functions decorated with @mcp.tool()
3. Use proper type hints with Pydantic models or Python typing
4. Include error handling
5. Keep implementations focused and practical
6. Don't use external APIs unless specified
7. For file operations, use pathlib
8. Return meaningful results

Example tool implementation:

```python
from fastmcp import FastMCP
from pydantic import Field

mcp = FastMCP("example_server")

@mcp.tool()
async def add_numbers(a: int = Field(description="First number"), b: int = Field(description="Second number")) -> int:
    \"\"\"Add two numbers together.\"\"\"
    return a + b
```

Generate ONLY the Python code, no explanations. The code should be complete and runnable."""


class GeneratedTool(BaseModel):
    name: str
    code: str


class GeneratedPrompt(BaseModel):
    name: str
    code: str


class MCPGenerator:
    """Generates fastmcp code from MCP designs."""

    def __init__(self, llm_client: LLMClient | None = None):
        self.llm = llm_client or get_llm_client()

    async def generate_tool_code(
        self,
        tool_spec: dict[str, Any],
        server_context: str = "",
    ) -> str:
        """Generate Python code for a single tool."""
        prompt = f"""Generate a fastmcp tool implementation for:

Name: {tool_spec["name"]}
Description: {tool_spec["description"]}
Parameters: {json.dumps(tool_spec.get("parameters", {}), indent=2)}
Implementation notes: {tool_spec.get("implementation", "Implement as described")}

{f"Server context: {server_context}" if server_context else ""}

Generate only the tool function (with decorator), no imports or server setup.
Output the code in a ```python``` block."""

        messages = [
            ChatMessage(role="system", content=CODE_GEN_SYSTEM_PROMPT),
            ChatMessage(role="user", content=prompt),
        ]

        response = await self.llm.chat(messages, temperature=0.3)
        return self._extract_code(response.content)

    async def generate_prompt_code(self, prompt_spec: dict[str, Any]) -> str:
        """Generate Python code for a single prompt."""
        args = prompt_spec.get("arguments", [])
        args_str = ", ".join(
            f'{a["name"]}: str = Field(description="{a.get("description", "")}")'
            for a in args
        )

        template = prompt_spec.get("template", "")

        code = f'''@mcp.prompt()
async def {prompt_spec["name"]}({args_str}) -> str:
    """{prompt_spec.get("description", "")}"""
    return f"""{template}"""
'''
        return code

    async def generate_full_server(self, design: MCPDesign) -> str:
        """Generate a complete fastmcp server from a design."""
        tools_code = []
        for tool in design.tools:
            code = await self.generate_tool_code(tool, design.description)
            tools_code.append(code)

        prompts_code = []
        for prompt in design.prompts:
            code = await self.generate_prompt_code(prompt)
            prompts_code.append(code)

        server_code = f'''"""
{design.description}

Auto-generated MCP server using fastmcp.
"""
from fastmcp import FastMCP
from pydantic import Field

mcp = FastMCP("{design.server_name}")


# Tools
{chr(10).join(tools_code)}

# Prompts
{chr(10).join(prompts_code)}

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


# Singleton instance
_mcp_generator: MCPGenerator | None = None


def get_mcp_generator() -> MCPGenerator:
    global _mcp_generator
    if _mcp_generator is None:
        _mcp_generator = MCPGenerator()
    return _mcp_generator
