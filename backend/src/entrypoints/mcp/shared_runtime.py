"""
Shared MCP Runtime for Free Tier Users.

Uses the simple register_new_customer_app pattern to mount
customer MCP servers dynamically.
"""
from contextlib import asynccontextmanager
from uuid import UUID

from fastapi import FastAPI
from fastmcp import FastMCP
from loguru import logger


def build_mcp_server(server_id: UUID, tools: list) -> FastMCP:
    """
    Build a FastMCP server instance for given tools.

    Args:
        server_id: UUID of the MCP server
        tools: List of compiled fastmcp Tool objects

    Returns:
        FastMCP instance ready to be mounted or tested
    """
    return FastMCP(
        f"MCPServer({server_id})",
        tools=tools,
    )


def register_new_customer_app(app: FastAPI, server_id: UUID, tools: list) -> FastMCP:
    """
    Register a new customer MCP app on the FastAPI server.

    This is the core pattern for dynamic MCP server registration.

    Args:
        app: FastAPI application instance
        server_id: UUID of the MCP server (used as mount path)
        tools: List of compiled fastmcp Tool objects

    Returns:
        FastMCP instance that was mounted
    """
    mcp = build_mcp_server(server_id, tools)
    app.mount(
        f"/mcp/{server_id}",
        mcp.http_app(),
    )
    logger.info(f"Registered MCP app at /mcp/{server_id} with {len(tools)} tools")
    return mcp


async def load_and_register_all_mcp_servers(
    app: FastAPI,
) -> dict[UUID, FastMCP]:
    """
    Load all active shared deployments from DB and register them.

    Called during FastAPI startup to restore all previously activated servers.

    Args:
        app: FastAPI application instance

    Returns:
        Dictionary mapping server_id to registered FastMCP instances
    """
    from core.services.tier_service import Tier
    from core.services.tool_loader import get_tool_loader
    from infrastructure.repositories.repo_provider import Provider

    deployment_repo = Provider.deployment_repo()
    tool_repo = Provider.mcp_tool_repo()
    tool_loader = get_tool_loader()

    # Get all active shared deployments from DB
    deployments = await deployment_repo.get_active_shared_deployments()
    registered_servers: dict[UUID, FastMCP] = {}

    for deployment in deployments:
        server = deployment.server
        try:
            # Get tools for this server
            tools = await tool_repo.get_tools_for_server(server.id)

            # Compile tools for this server
            compiled_tools = []

            for tool in tools:
                if not tool.code:
                    logger.warning(
                        f"Skipping tool {tool.name} for server {server.id}: no code"
                    )
                    continue

                try:
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
                except Exception as e:
                    logger.error(
                        f"Failed to compile tool {tool.name} for server {server.id}: {e}"
                    )
                    continue

            if compiled_tools:
                mcp = register_new_customer_app(app, server.id, compiled_tools)
                registered_servers[server.id] = mcp
            else:
                logger.warning(f"Server {server.id} has no valid tools, skipping")

        except Exception as e:
            logger.error(f"Failed to register server {server.id}: {e}")

    logger.info(f"Startup complete: registered {len(registered_servers)} MCP servers")
    return registered_servers
