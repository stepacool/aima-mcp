from typing import Type
from uuid import UUID

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from entrypoints.api.main import get_app
from infrastructure.models import Customer
from infrastructure.models.deployment import DeploymentStatus, DeploymentTarget
from infrastructure.models.mcp_server import MCPServer, MCPServerSetupStatus, MCPTool
from infrastructure.repositories.customer import CustomerCreate
from infrastructure.repositories.deployment import DeploymentCreate
from infrastructure.repositories.mcp_server import MCPServerCreate, MCPToolCreate
from infrastructure.repositories.repo_provider import Provider


@pytest.fixture
async def customer(provider: Type[Provider]) -> Customer:
    customer = await Provider.customer_repo().create(
        CustomerCreate(
            name="test customer",
            email="test@aimalabs.io",
            meta={"eggs": "spam"},
        )
    )
    return customer


@pytest.fixture()
def app(provider: Provider) -> FastAPI:
    return get_app()


@pytest.fixture()
async def api_client(
    app: FastAPI,
) -> AsyncClient:
    """Generic API client for testing admin endpoints."""
    transport = ASGITransport(app=app, client=("1.2.3.4", 123))
    headers = {"C-Authorization": "TEST TOKEN"}
    return AsyncClient(transport=transport, base_url="http://test", headers=headers)


@pytest.fixture
async def mcp_server(provider: Type[Provider], customer: Customer) -> MCPServer:
    """Create an MCP server in DRAFT status."""
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="test_server",
            description="Test MCP Server",
            customer_id=str(customer.id),
            auth_type="none",
        )
    )
    return server


@pytest.fixture
async def active_mcp_server(provider: Type[Provider], customer: Customer) -> MCPServer:
    """Create an MCP server with active shared deployment (for lifespan loading tests)."""
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="active_test_server",
            description="Active Test MCP Server",
            customer_id=str(customer.id),
            auth_type="none",
        )
    )
    # Create a deployment record for this server
    await Provider.deployment_repo().create(
        DeploymentCreate(
            server_id=server.id,
            target=DeploymentTarget.SHARED.value,
            status=DeploymentStatus.ACTIVE.value,
            endpoint_url=f"/mcp/{server.id}",
        )
    )
    # Update server setup status to ready
    await Provider.mcp_server_repo().update_setup_status(
        server.id, MCPServerSetupStatus.ready
    )
    # Refresh to get updated status
    server = await Provider.mcp_server_repo().get_by_uuid(server.id)
    return server


def make_simple_tool_code(return_value: str) -> str:
    """Create simple tool code that returns a specified value."""
    return f'return "{return_value}"'


@pytest.fixture
async def mcp_tool(provider: Type[Provider], mcp_server: MCPServer) -> MCPTool:
    """Create an MCP tool for a server."""
    tool = await Provider.mcp_tool_repo().create(
        MCPToolCreate(
            server_id=mcp_server.id,
            name="test_tool",
            description="A test tool that returns a greeting",
            parameters_schema={"parameters": []},
            code=make_simple_tool_code("Hello from test tool!"),
        )
    )
    return tool


@pytest.fixture
async def active_mcp_tool(
    provider: Type[Provider], active_mcp_server: MCPServer
) -> MCPTool:
    """Create an MCP tool for an active server (for lifespan loading tests)."""
    tool = await Provider.mcp_tool_repo().create(
        MCPToolCreate(
            server_id=active_mcp_server.id,
            name="greeting_tool",
            description="A tool that returns a greeting",
            parameters_schema={"parameters": []},
            code=make_simple_tool_code("Hello from active tool!"),
        )
    )
    return tool


async def create_mcp_tool_for_server(
    server_id: UUID, name: str, return_value: str
) -> MCPTool:
    """Helper to create an MCP tool with specific return value."""
    tool = await Provider.mcp_tool_repo().create(
        MCPToolCreate(
            server_id=server_id,
            name=name,
            description=f"Tool {name} that returns {return_value}",
            parameters_schema={"parameters": []},
            code=make_simple_tool_code(return_value),
        )
    )
    return tool
