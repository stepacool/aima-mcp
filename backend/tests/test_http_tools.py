"""End-to-end tests for HTTP tools using FastMCP Client over HTTP.

These tests run a real HTTP server via uvicorn and connect to it
using the FastMCP Client, providing true end-to-end testing of the
MCP protocol over HTTP.
"""

import asyncio
import socket
import threading
from typing import Type

import httpx
import pytest
import uvicorn
from fastapi import FastAPI
from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

from core.services.tier_service import Tier
from core.services.tool_loader import get_tool_loader
from infrastructure.models import Customer
from infrastructure.models.mcp_server import MCPServer
from infrastructure.repositories.mcp_server import MCPServerCreate, MCPToolCreate
from infrastructure.repositories.repo_provider import Provider

pytestmark = pytest.mark.anyio


def get_free_port() -> int:
    """Get a free port for the test server."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class UvicornTestServer:
    """Context manager that runs uvicorn in a background thread."""

    def __init__(self, app: FastAPI, port: int):
        self.app = app
        self.port = port
        self.server: uvicorn.Server | None = None
        self.thread: threading.Thread | None = None

    async def __aenter__(self):
        config = uvicorn.Config(
            self.app,
            host="127.0.0.1",
            port=self.port,
            log_level="error",
        )
        self.server = uvicorn.Server(config)
        self.thread = threading.Thread(target=self.server.run)
        self.thread.daemon = True
        self.thread.start()

        # Wait for server to be ready
        for _ in range(50):  # 5 seconds max
            await asyncio.sleep(0.1)
            if self.server.started:
                break
        return self

    async def __aexit__(self, *args):
        if self.server:
            self.server.should_exit = True
        if self.thread:
            self.thread.join(timeout=2)


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
            customer_id=str(customer.id),
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

    server = await Provider.mcp_server_repo().get_with_tools(server.id)
    return server


class TestHTTPToolsViaHTTP:
    """Test HTTP functionality in MCP tools via actual HTTP connection."""

    async def test_http_tool_via_http_transport(
        self,
        provider: Type[Provider],
        http_server_with_tool: MCPServer,
    ):
        """Test calling an HTTP tool via real HTTP transport."""
        server = http_server_with_tool
        tool = server.tools[0]

        # Compile the tool
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

        # Create FastMCP app and get its lifespan
        from fastmcp import FastMCP

        mcp = FastMCP(f"MCPServer({server.id})", tools=[compiled_tool])
        mcp_app = mcp.http_app()

        # Create FastAPI with the MCP lifespan
        app = FastAPI(lifespan=mcp_app.lifespan)
        app.mount(f"/mcp/{server.id}", mcp_app)

        # Get a free port and run the server
        port = get_free_port()
        async with UvicornTestServer(app, port):
            # Make direct HTTP request for comparison
            async with httpx.AsyncClient() as http_client:
                direct_response = await http_client.get("https://example.com")
                direct_html = direct_response.text

            # Connect via MCP Client over HTTP
            mcp_url = f"http://127.0.0.1:{port}/mcp/{server.id}/mcp"
            transport = StreamableHttpTransport(url=mcp_url)

            async with Client(transport) as client:
                tools = await client.list_tools()
                assert len(tools) == 1
                assert "fetch_example" in tools[0].name

                result = await client.call_tool(tools[0].name, {})
                mcp_html = result.content[0].text

            # Both should return the same HTML
            assert mcp_html == direct_html
            assert "Example Domain" in mcp_html

    async def test_http_tool_with_parameter_via_http(
        self,
        provider: Type[Provider],
        customer: Customer,
    ):
        """Test HTTP tool with URL parameter via HTTP transport."""
        server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="http_param_server",
                description="Server with parameterized HTTP tool",
                customer_id=str(customer.id),
                auth_type="none",
            )
        )

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

        server = await Provider.mcp_server_repo().get_with_tools(server.id)
        tool = server.tools[0]

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

        from fastmcp import FastMCP

        mcp = FastMCP(f"MCPServer({server.id})", tools=[compiled_tool])
        mcp_app = mcp.http_app()

        app = FastAPI(lifespan=mcp_app.lifespan)
        app.mount(f"/mcp/{server.id}", mcp_app)

        port = get_free_port()
        async with UvicornTestServer(app, port):
            test_url = "https://example.com"

            # Make direct HTTP request
            async with httpx.AsyncClient() as http_client:
                direct_response = await http_client.get(test_url)
                direct_html = direct_response.text

            # Call tool via MCP Client over HTTP
            mcp_url = f"http://127.0.0.1:{port}/mcp/{server.id}/mcp"
            transport = StreamableHttpTransport(url=mcp_url)

            async with Client(transport) as client:
                tools = await client.list_tools()
                assert len(tools) == 1

                result = await client.call_tool(tools[0].name, {"url": test_url})
                mcp_html = result.content[0].text

            assert mcp_html == direct_html
            assert "Example Domain" in mcp_html

    async def test_multiple_tools_via_http(
        self,
        provider: Type[Provider],
        customer: Customer,
    ):
        """Test server with multiple tools accessible via HTTP."""
        server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="multi_tool_server",
                description="Server with multiple HTTP tools",
                customer_id=str(customer.id),
                auth_type="none",
            )
        )

        # Tool 1: Fetch and return text
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server.id,
                name="fetch_text",
                description="Fetches example.com and returns text",
                parameters_schema={"parameters": []},
                code=make_http_get_tool_code(),
                is_validated=True,
            )
        )

        # Tool 2: Fetch and return status info
        status_tool_code = """
async with httpx.AsyncClient() as client:
    response = await client.get("https://example.com")
    return json.dumps({"status": response.status_code, "length": len(response.text)})
"""
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server.id,
                name="fetch_status",
                description="Fetches example.com and returns status info",
                parameters_schema={"parameters": []},
                code=status_tool_code,
                is_validated=True,
            )
        )

        server = await Provider.mcp_server_repo().get_with_tools(server.id)

        tool_loader = get_tool_loader()
        compiled_tools = []
        for tool in server.tools:
            compiled = tool_loader.compile_tool(
                tool_id=str(tool.id),
                name=tool.name,
                description=tool.description,
                parameters=tool.parameters_schema.get("parameters", []),
                code=tool.code,
                customer_id=server.customer_id,
                tier=Tier.FREE,
            )
            compiled_tools.append(compiled)

        from fastmcp import FastMCP

        mcp = FastMCP(f"MCPServer({server.id})", tools=compiled_tools)
        mcp_app = mcp.http_app()

        app = FastAPI(lifespan=mcp_app.lifespan)
        app.mount(f"/mcp/{server.id}", mcp_app)

        port = get_free_port()
        async with UvicornTestServer(app, port):
            mcp_url = f"http://127.0.0.1:{port}/mcp/{server.id}/mcp"
            transport = StreamableHttpTransport(url=mcp_url)

            async with Client(transport) as client:
                tools = await client.list_tools()
                assert len(tools) == 2

                tool_names = [t.name for t in tools]
                assert any("fetch_text" in name for name in tool_names)
                assert any("fetch_status" in name for name in tool_names)

                # Call the text tool
                text_tool = next(t for t in tools if "fetch_text" in t.name)
                result = await client.call_tool(text_tool.name, {})
                assert "Example Domain" in result.content[0].text

                # Call the status tool
                status_tool = next(t for t in tools if "fetch_status" in t.name)
                result = await client.call_tool(status_tool.name, {})

                import json

                status_data = json.loads(result.content[0].text)
                assert status_data["status"] == 200
                assert status_data["length"] > 0

    async def test_http_routing_with_server_id(
        self,
        provider: Type[Provider],
        customer: Customer,
    ):
        """Test that HTTP requests are correctly routed by server ID."""
        # Create two servers with different tools
        server1 = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="server_one",
                description="First server",
                customer_id=str(customer.id),
                auth_type="none",
            )
        )
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server1.id,
                name="tool_one",
                description="Returns 'one'",
                parameters_schema={"parameters": []},
                code='return "response_from_server_one"',
                is_validated=True,
            )
        )

        server2 = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="server_two",
                description="Second server",
                customer_id=str(customer.id),
                auth_type="none",
            )
        )
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server2.id,
                name="tool_two",
                description="Returns 'two'",
                parameters_schema={"parameters": []},
                code='return "response_from_server_two"',
                is_validated=True,
            )
        )

        server1 = await Provider.mcp_server_repo().get_with_tools(server1.id)
        server2 = await Provider.mcp_server_repo().get_with_tools(server2.id)

        tool_loader = get_tool_loader()

        # Build MCP apps for both servers
        from fastmcp import FastMCP

        mcp_apps = {}
        for server in [server1, server2]:
            tool = server.tools[0]
            compiled = tool_loader.compile_tool(
                tool_id=str(tool.id),
                name=tool.name,
                description=tool.description,
                parameters=tool.parameters_schema.get("parameters", []),
                code=tool.code,
                customer_id=server.customer_id,
                tier=Tier.FREE,
            )
            mcp = FastMCP(f"MCPServer({server.id})", tools=[compiled])
            mcp_apps[server.id] = mcp.http_app()

        # Create combined lifespan for all MCP apps
        from contextlib import asynccontextmanager

        @asynccontextmanager
        async def combined_lifespan(app):
            async with mcp_apps[server1.id].lifespan(mcp_apps[server1.id]):
                async with mcp_apps[server2.id].lifespan(mcp_apps[server2.id]):
                    yield

        app = FastAPI(lifespan=combined_lifespan)
        app.mount(f"/mcp/{server1.id}", mcp_apps[server1.id])
        app.mount(f"/mcp/{server2.id}", mcp_apps[server2.id])

        port = get_free_port()
        async with UvicornTestServer(app, port):
            # Connect to server1 via HTTP
            transport1 = StreamableHttpTransport(
                url=f"http://127.0.0.1:{port}/mcp/{server1.id}/mcp"
            )
            async with Client(transport1) as client:
                tools = await client.list_tools()
                assert len(tools) == 1
                assert "tool_one" in tools[0].name

                result = await client.call_tool(tools[0].name, {})
                assert result.content[0].text == "response_from_server_one"

            # Connect to server2 via HTTP
            transport2 = StreamableHttpTransport(
                url=f"http://127.0.0.1:{port}/mcp/{server2.id}/mcp"
            )
            async with Client(transport2) as client:
                tools = await client.list_tools()
                assert len(tools) == 1
                assert "tool_two" in tools[0].name

                result = await client.call_tool(tools[0].name, {})
                assert result.content[0].text == "response_from_server_two"
