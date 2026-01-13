"""Tests for shared MCP runtime - lifespan loading and dynamic registration."""

import asyncio
import socket
import threading
from contextlib import AsyncExitStack, asynccontextmanager
from typing import Type

import pytest
import uvicorn
from fastapi import FastAPI
from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

from core.services.tier_service import Tier
from core.services.tool_loader import get_tool_loader
from entrypoints.mcp.shared_runtime import (
    load_and_register_all_mcp_servers,
    register_new_customer_app,
)
from fixtures import make_simple_tool_code
from infrastructure.models import Customer
from infrastructure.models.deployment import DeploymentStatus, DeploymentTarget
from infrastructure.models.mcp_server import MCPServer, MCPServerStatus, MCPTool
from infrastructure.repositories.deployment import DeploymentCreate
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


@pytest.fixture
async def active_server_with_tool(
    provider: Type[Provider], customer: Customer
) -> tuple[MCPServer, MCPTool]:
    """Create an MCP server with active shared deployment for lifespan tests."""
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="lifespan_test_server",
            description="Server for lifespan loading test",
            customer_id=str(customer.id),
            auth_type="none",
        )
    )

    tool = await Provider.mcp_tool_repo().create(
        MCPToolCreate(
            server_id=server.id,
            name="lifespan_tool",
            description="Tool loaded during lifespan",
            parameters_schema={"parameters": []},
            code=make_simple_tool_code("lifespan_response"),
            is_validated=True,
        )
    )

    # Create deployment record
    await Provider.deployment_repo().create(
        DeploymentCreate(
            server_id=server.id,
            target=DeploymentTarget.SHARED.value,
            status=DeploymentStatus.ACTIVE.value,
            endpoint_url=f"/mcp/{server.id}",
        )
    )
    await Provider.mcp_server_repo().update_status(server.id, MCPServerStatus.READY)
    server = await Provider.mcp_server_repo().get_by_uuid(server.id)
    return server, tool


@pytest.fixture
async def draft_server_with_tool(
    provider: Type[Provider], customer: Customer
) -> tuple[MCPServer, MCPTool]:
    """Create a DRAFT MCP server with a tool for dynamic registration tests."""
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="dynamic_test_server",
            description="Server for dynamic registration test",
            customer_id=str(customer.id),
            auth_type="none",
        )
    )

    tool = await Provider.mcp_tool_repo().create(
        MCPToolCreate(
            server_id=server.id,
            name="dynamic_tool",
            description="Tool registered dynamically",
            parameters_schema={"parameters": []},
            code=make_simple_tool_code("dynamic_response"),
            is_validated=True,
        )
    )

    return server, tool


class TestLifespanMCPLoading:
    """Test that lifespan loads existing ACTIVE MCP servers on startup."""

    async def test_lifespan_loads_active_servers(
        self,
        provider: Type[Provider],
        active_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that load_and_register_all_mcp_servers loads ACTIVE servers."""
        server, tool = active_server_with_tool

        app = FastAPI()
        registered_servers = await load_and_register_all_mcp_servers(app)

        # Should have loaded 1 server
        assert len(registered_servers) == 1
        assert server.id in registered_servers

        # Verify the server has tools via FastMCP Client
        mcp_server = registered_servers[server.id]
        async with Client(mcp_server) as client:
            tools = await client.list_tools()
            assert len(tools) == 1

    async def test_lifespan_loads_tools_correctly(
        self,
        provider: Type[Provider],
        active_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that loaded tools are correctly compiled and callable."""
        server, tool = active_server_with_tool

        app = FastAPI()
        registered_servers = await load_and_register_all_mcp_servers(app)

        assert len(registered_servers) == 1

        # Verify tools via FastMCP Client
        mcp_server = registered_servers[server.id]
        async with Client(mcp_server) as client:
            tools = await client.list_tools()
            assert len(tools) == 1

            # Verify tool name contains the expected suffix
            tool_info = tools[0]
            assert "lifespan_tool" in tool_info.name

            # Verify tool is callable and returns expected result
            result = await client.call_tool(tool_info.name, {})
            assert len(result.content) == 1
            assert result.content[0].text == "lifespan_response"

    async def test_lifespan_skips_draft_servers(
        self,
        provider: Type[Provider],
        draft_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that DRAFT servers are not loaded during lifespan."""
        server, tool = draft_server_with_tool

        app = FastAPI()
        registered_servers = await load_and_register_all_mcp_servers(app)

        # Should not have loaded any servers (DRAFT status)
        assert len(registered_servers) == 0
        assert server.id not in registered_servers


class TestDynamicMCPRegistration:
    """Test dynamic MCP server registration after app startup."""

    async def test_dynamic_registration_creates_working_server(
        self,
        provider: Type[Provider],
        draft_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that dynamically registered server is accessible via Client."""
        server, tool = draft_server_with_tool

        app = FastAPI()

        # Compile the tool and register dynamically
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

        mcp_server = await register_new_customer_app(app, server.id, [compiled_tool])

        # Verify the server has tools via FastMCP Client
        async with Client(mcp_server) as client:
            tools = await client.list_tools()
            assert len(tools) == 1
            assert "dynamic_tool" in tools[0].name

    async def test_dynamic_registration_tool_callable(
        self,
        provider: Type[Provider],
        draft_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that dynamically registered tools are callable via Client."""
        server, tool = draft_server_with_tool

        app = FastAPI()

        # Compile and register the tool
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

        mcp_server = await register_new_customer_app(app, server.id, [compiled_tool])

        # Verify the tool is callable via FastMCP Client
        async with Client(mcp_server) as client:
            tools = await client.list_tools()
            assert len(tools) == 1

            tool_info = tools[0]
            assert tool_info.description == tool.description

            # Call the tool and verify result
            result = await client.call_tool(tool_info.name, {})
            assert len(result.content) == 1
            assert result.content[0].text == "dynamic_response"

    async def test_dynamic_registration_via_http_with_lifespan(
        self,
        provider: Type[Provider],
        draft_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test dynamically registered server works over HTTP with proper lifespan.

        This test verifies that the AsyncExitStack approach properly initializes
        the FastMCP lifespan for dynamically mounted apps.
        """
        server, tool = draft_server_with_tool

        # Create app with lifespan that includes AsyncExitStack
        @asynccontextmanager
        async def test_lifespan(app: FastAPI):
            async with AsyncExitStack() as stack:
                app.state.mcp_lifespan_stack = stack
                yield

        app = FastAPI(lifespan=test_lifespan)

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

        # Start the server and register the MCP app dynamically inside the lifespan
        port = get_free_port()

        async with UvicornTestServer(app, port):
            # Register the app AFTER server startup (dynamic registration)
            await register_new_customer_app(app, server.id, [compiled_tool])

            # Connect via HTTP transport and verify it works
            mcp_url = f"http://127.0.0.1:{port}/mcp/{server.id}/mcp"
            transport = StreamableHttpTransport(url=mcp_url)

            async with Client(transport) as client:
                tools = await client.list_tools()
                assert len(tools) == 1
                assert "dynamic_tool" in tools[0].name

                # Call the tool and verify result
                result = await client.call_tool(tools[0].name, {})
                assert len(result.content) == 1
                assert result.content[0].text == "dynamic_response"

    async def test_multiple_dynamic_registrations_via_http(
        self,
        provider: Type[Provider],
        customer: Customer,
    ):
        """Test multiple dynamically registered servers work over HTTP."""
        # Create two servers
        servers_and_tools = []
        for i in range(2):
            server = await Provider.mcp_server_repo().create(
                MCPServerCreate(
                    name=f"dynamic_http_server_{i}",
                    description=f"Dynamic HTTP server {i}",
                    customer_id=str(customer.id),
                    auth_type="none",
                )
            )
            tool = await Provider.mcp_tool_repo().create(
                MCPToolCreate(
                    server_id=server.id,
                    name=f"http_tool_{i}",
                    description=f"HTTP tool {i}",
                    parameters_schema={"parameters": []},
                    code=make_simple_tool_code(f"http_response_{i}"),
                    is_validated=True,
                )
            )
            servers_and_tools.append((server, tool))

        # Create app with lifespan that includes AsyncExitStack
        @asynccontextmanager
        async def test_lifespan(app: FastAPI):
            async with AsyncExitStack() as stack:
                app.state.mcp_lifespan_stack = stack
                yield

        app = FastAPI(lifespan=test_lifespan)
        port = get_free_port()

        async with UvicornTestServer(app, port):
            # Register both apps dynamically
            tool_loader = get_tool_loader()
            for server, tool in servers_and_tools:
                compiled_tool = tool_loader.compile_tool(
                    tool_id=str(tool.id),
                    name=tool.name,
                    description=tool.description,
                    parameters=tool.parameters_schema.get("parameters", []),
                    code=tool.code,
                    customer_id=server.customer_id,
                    tier=Tier.FREE,
                )
                await register_new_customer_app(app, server.id, [compiled_tool])

            # Verify both servers work over HTTP
            for i, (server, tool) in enumerate(servers_and_tools):
                mcp_url = f"http://127.0.0.1:{port}/mcp/{server.id}/mcp"
                transport = StreamableHttpTransport(url=mcp_url)

                async with Client(transport) as client:
                    tools = await client.list_tools()
                    assert len(tools) == 1
                    assert f"http_tool_{i}" in tools[0].name

                    result = await client.call_tool(tools[0].name, {})
                    assert result.content[0].text == f"http_response_{i}"


class TestMultipleServers:
    """Test scenarios with multiple MCP servers."""

    async def test_multiple_active_servers_loaded(
        self, provider: Type[Provider], customer: Customer
    ):
        """Test that multiple deployed servers are all loaded and accessible."""
        # Create 3 servers with active shared deployments
        servers = []
        for i in range(3):
            server = await Provider.mcp_server_repo().create(
                MCPServerCreate(
                    name=f"multi_server_{i}",
                    description=f"Multi test server {i}",
                    customer_id=str(customer.id),
                    auth_type="none",
                )
            )
            await Provider.mcp_tool_repo().create(
                MCPToolCreate(
                    server_id=server.id,
                    name=f"multi_tool_{i}",
                    description=f"Multi tool {i}",
                    parameters_schema={"parameters": []},
                    code=make_simple_tool_code(f"response_{i}"),
                    is_validated=True,
                )
            )
            # Create deployment record
            await Provider.deployment_repo().create(
                DeploymentCreate(
                    server_id=server.id,
                    target=DeploymentTarget.SHARED.value,
                    status=DeploymentStatus.ACTIVE.value,
                    endpoint_url=f"/mcp/{server.id}",
                )
            )
            await Provider.mcp_server_repo().update_status(
                server.id, MCPServerStatus.READY
            )
            servers.append(server)

        app = FastAPI()
        registered_servers = await load_and_register_all_mcp_servers(app)

        assert len(registered_servers) == 3

        # Verify all servers are accessible via FastMCP Client
        for i, server in enumerate(servers):
            assert server.id in registered_servers
            mcp_server = registered_servers[server.id]

            async with Client(mcp_server) as client:
                tools = await client.list_tools()
                assert len(tools) == 1
                assert f"multi_tool_{i}" in tools[0].name

                # Call the tool and verify result
                result = await client.call_tool(tools[0].name, {})
                assert len(result.content) == 1
                assert result.content[0].text == f"response_{i}"

    async def test_mixed_status_servers(
        self, provider: Type[Provider], customer: Customer
    ):
        """Test that only servers with active deployments are loaded."""
        # Create server with active shared deployment
        deployed_server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="deployed_server",
                description="Deployed server",
                customer_id=str(customer.id),
            )
        )
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=deployed_server.id,
                name="deployed_tool",
                description="Deployed tool",
                parameters_schema={"parameters": []},
                code=make_simple_tool_code("deployed"),
                is_validated=True,
            )
        )
        await Provider.deployment_repo().create(
            DeploymentCreate(
                server_id=deployed_server.id,
                target=DeploymentTarget.SHARED.value,
                status=DeploymentStatus.ACTIVE.value,
                endpoint_url=f"/mcp/{deployed_server.id}",
            )
        )
        await Provider.mcp_server_repo().update_status(
            deployed_server.id, MCPServerStatus.READY
        )

        draft_server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="draft_server",
                description="Draft server",
                customer_id=str(customer.id),
            )
        )
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=draft_server.id,
                name="draft_tool",
                description="Draft tool",
                parameters_schema={"parameters": []},
                code=make_simple_tool_code("draft"),
                is_validated=True,
            )
        )
        # draft_server stays DRAFT (no deployment)

        ready_server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="ready_server",
                description="Ready server",
                customer_id=str(customer.id),
            )
        )
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=ready_server.id,
                name="ready_tool",
                description="Ready tool",
                parameters_schema={"parameters": []},
                code=make_simple_tool_code("ready"),
                is_validated=True,
            )
        )
        await Provider.mcp_server_repo().update_status(
            ready_server.id, MCPServerStatus.READY
        )
        # ready_server is READY but has no deployment

        app = FastAPI()
        registered_servers = await load_and_register_all_mcp_servers(app)

        # Only 1 server should be loaded (the one with active deployment)
        assert len(registered_servers) == 1

        # Verify only deployed server is accessible
        assert deployed_server.id in registered_servers
        assert draft_server.id not in registered_servers
        assert ready_server.id not in registered_servers

        # Verify deployed server works via FastMCP Client
        mcp_server = registered_servers[deployed_server.id]
        async with Client(mcp_server) as client:
            tools = await client.list_tools()
            assert len(tools) == 1
            assert "deployed_tool" in tools[0].name

            result = await client.call_tool(tools[0].name, {})
            assert len(result.content) == 1
            assert result.content[0].text == "deployed"
