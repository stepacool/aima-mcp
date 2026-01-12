"""End-to-end tests for HTTP tools using FastMCP Client."""

from typing import Type

import httpx
import pytest
from fastapi import FastAPI
from fastmcp import Client

from core.services.tier_service import Tier
from core.services.tool_loader import get_tool_loader
from entrypoints.mcp.shared_runtime import register_new_customer_app
from infrastructure.models import Customer
from infrastructure.models.mcp_server import MCPServer
from infrastructure.repositories.mcp_server import MCPServerCreate, MCPToolCreate
from infrastructure.repositories.repo_provider import Provider

pytestmark = pytest.mark.anyio


def make_http_get_tool_code() -> str:
    """Create tool code that fetches a URL and returns the response text."""
    return """
async with httpx.AsyncClient() as client:
    response = await client.get("https://example.com")
    return response.text
"""


@pytest.fixture
async def http_server_with_tool(
    provider: Type[Provider], customer: Customer
) -> MCPServer:
    """Create an MCP server with an HTTP GET tool."""
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="http_test_server",
            description="Server for HTTP tool testing",
            customer_id=customer.id,
            tier="free",
            auth_type="none",
        )
    )

    await Provider.mcp_tool_repo().create(
        MCPToolCreate(
            server_id=server.id,
            name="fetch_example",
            description="Fetches example.com and returns the HTML",
            parameters_schema={"parameters": []},
            code=make_http_get_tool_code(),
            is_validated=True,
        )
    )

    # Refresh to get the tools relationship loaded
    server = await Provider.mcp_server_repo().get_with_tools(server.id)
    return server


class TestHTTPTools:
    """Test HTTP functionality in MCP tools end-to-end."""

    async def test_http_get_returns_same_as_direct_request(
        self,
        provider: Type[Provider],
        http_server_with_tool: MCPServer,
    ):
        """Test that HTTP tool returns the same response as a direct request."""
        server = http_server_with_tool
        tool = server.tools[0]

        app = FastAPI()

        # Compile the tool and register
        tool_loader = get_tool_loader()
        compiled_tool = tool_loader.compile_tool(
            tool_id=str(tool.id),
            name=tool.name,
            description=tool.description,
            parameters=tool.parameters_schema.get("parameters", []),
            code=tool.code,
            customer_id=server.customer_id,
            tier=Tier.FREE,
        )

        mcp_server = register_new_customer_app(app, server.id, [compiled_tool])

        # Make direct HTTP request
        async with httpx.AsyncClient() as http_client:
            direct_response = await http_client.get("https://example.com")
            direct_html = direct_response.text

        # Call tool via MCP Client
        async with Client(mcp_server) as client:
            tools = await client.list_tools()
            assert len(tools) == 1
            assert "fetch_example" in tools[0].name

            result = await client.call_tool(tools[0].name, {})
            mcp_html = result.content[0].text

        # Both should return the same HTML
        assert mcp_html == direct_html
        assert "Example Domain" in mcp_html

    async def test_http_tool_with_url_parameter(
        self,
        provider: Type[Provider],
        customer: Customer,
    ):
        """Test HTTP tool that accepts a URL parameter."""
        server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="http_param_server",
                description="Server with parameterized HTTP tool",
                customer_id=customer.id,
                tier="free",
                auth_type="none",
            )
        )

        # Tool that accepts a URL parameter
        tool_code = """
async with httpx.AsyncClient() as client:
    response = await client.get(url)
    return response.text
"""

        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server.id,
                name="fetch_url",
                description="Fetches the given URL and returns the HTML",
                parameters_schema={
                    "parameters": [
                        {
                            "name": "url",
                            "type": "string",
                            "description": "The URL to fetch",
                            "required": True,
                        }
                    ]
                },
                code=tool_code,
                is_validated=True,
            )
        )

        # Refresh server to get tools
        server = await Provider.mcp_server_repo().get_with_tools(server.id)
        tool = server.tools[0]

        app = FastAPI()

        tool_loader = get_tool_loader()
        compiled_tool = tool_loader.compile_tool(
            tool_id=str(tool.id),
            name=tool.name,
            description=tool.description,
            parameters=tool.parameters_schema.get("parameters", []),
            code=tool.code,
            customer_id=server.customer_id,
            tier=Tier.FREE,
        )

        mcp_server = register_new_customer_app(app, server.id, [compiled_tool])

        test_url = "https://example.com"

        # Make direct HTTP request
        async with httpx.AsyncClient() as http_client:
            direct_response = await http_client.get(test_url)
            direct_html = direct_response.text

        # Call tool via MCP Client with URL parameter
        async with Client(mcp_server) as client:
            tools = await client.list_tools()
            assert len(tools) == 1

            result = await client.call_tool(tools[0].name, {"url": test_url})
            mcp_html = result.content[0].text

        assert mcp_html == direct_html
        assert "Example Domain" in mcp_html

    async def test_http_tool_returns_status_code(
        self,
        provider: Type[Provider],
        customer: Customer,
    ):
        """Test HTTP tool that returns status code along with content."""
        server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="http_status_server",
                description="Server with status code tool",
                customer_id=customer.id,
                tier="free",
                auth_type="none",
            )
        )

        tool_code = """
async with httpx.AsyncClient() as client:
    response = await client.get("https://example.com")
    return json.dumps({"status_code": response.status_code, "body": response.text})
"""

        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server.id,
                name="fetch_with_status",
                description="Fetches example.com and returns status code and body",
                parameters_schema={"parameters": []},
                code=tool_code,
                is_validated=True,
            )
        )

        server = await Provider.mcp_server_repo().get_with_tools(server.id)
        tool = server.tools[0]

        app = FastAPI()

        tool_loader = get_tool_loader()
        compiled_tool = tool_loader.compile_tool(
            tool_id=str(tool.id),
            name=tool.name,
            description=tool.description,
            parameters=tool.parameters_schema.get("parameters", []),
            code=tool.code,
            customer_id=server.customer_id,
            tier=Tier.FREE,
        )

        mcp_server = register_new_customer_app(app, server.id, [compiled_tool])

        # Make direct HTTP request
        async with httpx.AsyncClient() as http_client:
            direct_response = await http_client.get("https://example.com")

        # Call tool via MCP Client
        async with Client(mcp_server) as client:
            tools = await client.list_tools()
            result = await client.call_tool(tools[0].name, {})

            import json

            mcp_result = json.loads(result.content[0].text)

        assert mcp_result["status_code"] == direct_response.status_code
        assert mcp_result["body"] == direct_response.text
