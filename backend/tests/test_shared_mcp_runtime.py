"""Tests for shared MCP runtime - lifespan loading and dynamic registration."""

from typing import Type

import pytest
from fastapi import FastAPI

from core.services.tier_service import Tier
from core.services.tool_loader import get_tool_loader
from entrypoints.mcp.shared_runtime import (
    load_and_register_all_mcp_servers,
    register_new_customer_app,
)
from fixtures import make_simple_tool_code
from infrastructure.models import Customer
from infrastructure.models.mcp_server import MCPServer, MCPServerStatus, MCPTool
from infrastructure.repositories.mcp_server import MCPServerCreate, MCPToolCreate
from infrastructure.repositories.repo_provider import Provider

pytestmark = pytest.mark.anyio


@pytest.fixture
async def active_server_with_tool(
    provider: Type[Provider], customer: Customer
) -> tuple[MCPServer, MCPTool]:
    """Create an ACTIVE MCP server with a tool for lifespan tests."""
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="lifespan_test_server",
            description="Server for lifespan loading test",
            customer_id=customer.id,
            tier="free",
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

    await Provider.mcp_server_repo().update_status(server.id, MCPServerStatus.ACTIVE)
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
            customer_id=customer.id,
            tier="free",
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

        # Create a fresh FastAPI app (without lifespan to control loading manually)
        app = FastAPI()

        # Manually call the loading function
        count = await load_and_register_all_mcp_servers(app)

        # Should have loaded 1 server
        assert count == 1

        # Verify the MCP endpoint is mounted by checking app routes
        # FastMCP mounts at /mcp/{server_id}
        route_paths = [r.path for r in app.routes if hasattr(r, "path")]
        expected_path = f"/mcp/{server.id}"
        assert expected_path in route_paths, (
            f"Expected {expected_path} in {route_paths}"
        )

    async def test_lifespan_loads_tools_correctly(
        self,
        provider: Type[Provider],
        active_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that loaded tools are correctly compiled and accessible."""
        server, tool = active_server_with_tool

        app = FastAPI()
        count = await load_and_register_all_mcp_servers(app)

        # Verify the server was loaded
        assert count == 1

        # Check the tool was compiled by verifying the tool_loader cache
        tool_loader = get_tool_loader()
        cache_key = f"{server.customer_id}:{tool.id}"
        assert cache_key in tool_loader._compiled_tools

        # Verify the compiled tool has correct name
        compiled_tool = tool_loader._compiled_tools[cache_key]
        expected_name = f"{server.customer_id.hex[:8]}_lifespan_tool"
        assert compiled_tool.name == expected_name

    async def test_lifespan_skips_draft_servers(
        self,
        provider: Type[Provider],
        draft_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that DRAFT servers are not loaded during lifespan."""
        server, tool = draft_server_with_tool

        app = FastAPI()
        count = await load_and_register_all_mcp_servers(app)

        # Should not have loaded any servers (DRAFT status)
        assert count == 0

        # Verify the endpoint is not mounted
        route_paths = [r.path for r in app.routes if hasattr(r, "path")]
        expected_path = f"/mcp/{server.id}"
        assert expected_path not in route_paths


class TestDynamicMCPRegistration:
    """Test dynamic MCP server registration after app startup."""

    async def test_endpoint_not_mounted_before_registration(
        self,
        provider: Type[Provider],
        draft_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that MCP endpoint is not mounted before registration."""
        server, tool = draft_server_with_tool

        app = FastAPI()

        # Verify route not present before registration
        route_paths = [r.path for r in app.routes if hasattr(r, "path")]
        expected_path = f"/mcp/{server.id}"
        assert expected_path not in route_paths

    async def test_endpoint_mounted_after_dynamic_registration(
        self,
        provider: Type[Provider],
        draft_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that MCP endpoint is mounted after dynamic registration."""
        server, tool = draft_server_with_tool

        app = FastAPI()

        # Verify not mounted before
        route_paths = [r.path for r in app.routes if hasattr(r, "path")]
        expected_path = f"/mcp/{server.id}"
        assert expected_path not in route_paths

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

        register_new_customer_app(app, server.id, [compiled_tool])

        # Verify route is now mounted
        route_paths = [r.path for r in app.routes if hasattr(r, "path")]
        assert expected_path in route_paths, (
            f"Expected {expected_path} in {route_paths}"
        )

    async def test_dynamic_registration_tool_cached_and_callable(
        self,
        provider: Type[Provider],
        draft_server_with_tool: tuple[MCPServer, MCPTool],
    ):
        """Test that dynamically registered tools are cached and callable."""
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

        register_new_customer_app(app, server.id, [compiled_tool])

        # Verify tool is in cache
        cache_key = f"{server.customer_id}:{tool.id}"
        assert cache_key in tool_loader._compiled_tools

        # Verify the compiled tool has correct properties
        expected_name = f"{server.customer_id.hex[:8]}_dynamic_tool"
        assert compiled_tool.name == expected_name
        assert compiled_tool.description == tool.description

        # Verify the tool function can be called directly
        result = await compiled_tool.fn()
        assert result == "dynamic_response"


class TestMultipleServers:
    """Test scenarios with multiple MCP servers."""

    async def test_multiple_active_servers_loaded(
        self, provider: Type[Provider], customer: Customer
    ):
        """Test that multiple ACTIVE servers are all loaded."""
        # Create 3 active servers with tools
        servers = []
        for i in range(3):
            server = await Provider.mcp_server_repo().create(
                MCPServerCreate(
                    name=f"multi_server_{i}",
                    description=f"Multi test server {i}",
                    customer_id=customer.id,
                    tier="free",
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
            await Provider.mcp_server_repo().update_status(
                server.id, MCPServerStatus.ACTIVE
            )
            servers.append(server)

        app = FastAPI()
        count = await load_and_register_all_mcp_servers(app)

        assert count == 3

        # Verify all endpoints are mounted by checking routes
        route_paths = [r.path for r in app.routes if hasattr(r, "path")]
        for server in servers:
            expected_path = f"/mcp/{server.id}"
            assert expected_path in route_paths, f"Server {server.id} not mounted"

    async def test_mixed_status_servers(
        self, provider: Type[Provider], customer: Customer
    ):
        """Test that only ACTIVE servers are loaded, not DRAFT/READY."""
        # Create servers with different statuses
        active_server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="active_server",
                description="Active server",
                customer_id=customer.id,
            )
        )
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=active_server.id,
                name="active_tool",
                description="Active tool",
                parameters_schema={"parameters": []},
                code=make_simple_tool_code("active"),
                is_validated=True,
            )
        )
        await Provider.mcp_server_repo().update_status(
            active_server.id, MCPServerStatus.ACTIVE
        )

        draft_server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="draft_server",
                description="Draft server",
                customer_id=customer.id,
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
        # draft_server stays DRAFT (default)

        ready_server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name="ready_server",
                description="Ready server",
                customer_id=customer.id,
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

        app = FastAPI()
        count = await load_and_register_all_mcp_servers(app)

        # Only 1 server should be loaded (the ACTIVE one)
        assert count == 1

        # Verify only active server is mounted
        route_paths = [r.path for r in app.routes if hasattr(r, "path")]

        # Active server should be mounted
        assert f"/mcp/{active_server.id}" in route_paths

        # Draft and Ready servers should not be mounted
        assert f"/mcp/{draft_server.id}" not in route_paths
        assert f"/mcp/{ready_server.id}" not in route_paths
