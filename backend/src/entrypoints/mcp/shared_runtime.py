"""
Shared MCP Runtime for Free Tier Users.

Uses the simple register_new_customer_app pattern to mount
customer MCP servers dynamically.
"""

from contextlib import AsyncExitStack
from uuid import UUID

from fastapi import FastAPI
from fastmcp import FastMCP
from loguru import logger
from entrypoints.api.routes.oauth import mcp_oauth_router

def build_mcp_server(server_id: UUID, tools: list) -> FastMCP:
    return FastMCP(
        f"MCPServer({server_id})",
        tools=tools,
    )


async def register_new_customer_app(
    app: FastAPI,
    server_id: UUID,
    tools: list,
    stack: AsyncExitStack,
) -> FastMCP:
    """
    Register a new customer MCP app and activate its lifespan immediately.
    """
    mcp = build_mcp_server(server_id, tools)

    # 1. Create the sub-app instance ONCE
    mcp_sub_app = mcp.http_app()

    # 2. Mount it
    app.mount(
        f"/mcp/{server_id}",
        mcp_sub_app,
    )

    # 2. Mount oauth routes
    app.include_router(mcp_oauth_router, prefix=f"/mcp/{server_id}")

    # 3. Manually trigger its lifespan using the stack
    # This initializes the FastMCP TaskGroup/SessionManager
    await stack.enter_async_context(mcp_sub_app.lifespan(app))

    logger.info(f"Registered and started MCP app at /mcp/{server_id}")
    return mcp


def unregister_mcp_app(app: FastAPI, server_id: UUID) -> bool:
    """
    Unregister/unmount an MCP app from FastAPI.

    Note: This only removes the route from FastAPI. The lifespan context
    will be cleaned up when the app shuts down via the AsyncExitStack.

    Args:
        app: FastAPI application instance
        server_id: UUID of the server to unmount

    Returns:
        True if the app was found and unmounted, False otherwise
    """
    mount_path = f"/mcp/{server_id}"

    # Find and remove the mounted route
    for i, route in enumerate(app.routes):
        if hasattr(route, "path") and route.path == mount_path:  # type: ignore[attr-defined]
            app.routes.pop(i)
            logger.info(f"Unmounted MCP app from {mount_path}")
            return True

    logger.warning(f"No MCP app found at {mount_path} to unmount")
    return False


async def load_and_register_all_mcp_servers(
    app: FastAPI,
    stack: AsyncExitStack,
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

    env_var_repo = Provider.environment_variable_repo()

    for deployment in deployments:
        server = deployment.server
        try:
            # Get tools for this server
            tools = await tool_repo.get_tools_for_server(server.id)

            # Get environment variables for this server
            env_var_records = await env_var_repo.get_vars_for_server(server.id)
            env_vars = {
                var.name: var.value for var in env_var_records if var.value is not None
            }

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
                        parameters=tool.parameters_schema,
                        code=tool.code,
                        customer_id=server.customer_id,
                        tier=Tier.FREE,
                        env_vars=env_vars,
                    )
                    compiled_tools.append(compiled)
                except Exception as e:
                    logger.error(
                        f"Failed to compile tool {tool.name} for server {server.id}: {e}"
                    )
                    continue

            if compiled_tools:
                mcp = await register_new_customer_app(
                    app,
                    server.id,
                    compiled_tools,
                    stack,
                )
                registered_servers[server.id] = mcp
            else:
                logger.warning(f"Server {server.id} has no valid tools, skipping")

        except Exception as e:
            logger.error(f"Failed to register server {server.id}: {e}")

    logger.info(f"Startup complete: registered {len(registered_servers)} MCP servers")
    return registered_servers
