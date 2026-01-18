"""Tests for shared MCP runtime - lifespan loading and dynamic registration."""
from contextlib import AsyncExitStack
from typing import Type

import pytest
from fastapi import FastAPI
from fastmcp import Client

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
        async with AsyncExitStack() as stack:
            registered_servers = await load_and_register_all_mcp_servers(app, stack)

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
        async with AsyncExitStack() as stack:
            registered_servers = await load_and_register_all_mcp_servers(app, stack)

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
        async with AsyncExitStack() as stack:
            registered_servers = await load_and_register_all_mcp_servers(app, stack)

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
        async with AsyncExitStack() as stack:
            mcp_server = await register_new_customer_app(app, server.id, [compiled_tool], stack)

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
        async with AsyncExitStack() as stack:
            mcp_server = await register_new_customer_app(app, server.id, [compiled_tool], stack)

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
        async with AsyncExitStack() as stack:
            registered_servers = await load_and_register_all_mcp_servers(app, stack)

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
        async with AsyncExitStack() as stack:
            registered_servers = await load_and_register_all_mcp_servers(app, stack)

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
