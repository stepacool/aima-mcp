"""
Shared MCP Runtime for Free Tier Users.

Uses the simple register_new_customer_app pattern to mount
customer MCP servers dynamically.
"""

from collections.abc import Sequence
from contextlib import AsyncExitStack
from uuid import UUID

from core.services.tool_loader import compile_server_tools
from fastapi import FastAPI
from fastmcp import FastMCP
from fastmcp.tools.tool import FunctionTool, Tool
from infrastructure.models.deployment import DeploymentStatus, DeploymentTarget
from infrastructure.repositories.repo_provider import Provider
from loguru import logger

from entrypoints.api.routes.oauth import mcp_oauth_router


def build_mcp_server(server_id: UUID, tools: Sequence[Tool | FunctionTool]) -> FastMCP:
    return FastMCP(
        f"MCPServer({server_id})",
        tools=tools,
    )


async def register_new_customer_app(
    app: FastAPI,
    server_id: UUID,
    tools: Sequence[Tool | FunctionTool],
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
    _ = await stack.enter_async_context(mcp_sub_app.lifespan(app))

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
            _ = app.routes.pop(i)
            logger.info(f"Unmounted MCP app from {mount_path}")
            return True

    logger.warning(f"No MCP app found at {mount_path} to unmount")
    return False


async def remount_mcp_server(
    app: FastAPI,
    server_id: UUID,
    stack: AsyncExitStack,
) -> bool:
    """
    Remount a deployed MCP server by recompiling its tools from DB.

    Called after tool descriptions or server metadata are updated so that
    the live runtime immediately reflects the changes.

    Returns:
        True if the server was remounted, False if it is not deployed.
    """

    server_repo = Provider.mcp_server_repo()
    tool_repo = Provider.mcp_tool_repo()
    env_var_repo = Provider.environment_variable_repo()
    deployment_repo = Provider.deployment_repo()

    # Only remount if the server is actively deployed on the shared runtime
    deployment = await deployment_repo.get_by_server_id(server_id)
    if not deployment or deployment.status != DeploymentStatus.ACTIVE.value:
        logger.debug(f"Server {server_id} is not deployed - skipping remount")
        return False

    if deployment.target != DeploymentTarget.SHARED.value:
        logger.debug(f"Server {server_id} is on dedicated target - skipping remount")
        return False

    # Fetch server and its updated tools from DB
    server = await server_repo.get_by_uuid(server_id)
    if not server:
        logger.warning(f"Server {server_id} not found during remount")
        return False

    tools = await tool_repo.get_tools_for_server(server_id)
    compiled_tools = await compile_server_tools(
        server=server,
        tools=tools,
        env_var_repo=env_var_repo,
    )

    if not compiled_tools:
        logger.warning(
            f"Server {server_id} has no compilable tools after edit - not remounting"
        )
        return False

    # Unmount the current app and register a fresh one with updated tools
    _ = unregister_mcp_app(app, server_id)
    _ = await register_new_customer_app(app, server_id, compiled_tools, stack=stack)

    logger.info(f"Remounted MCP server {server_id} with {len(compiled_tools)} tools")
    return True


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
    deployment_repo = Provider.deployment_repo()
    tool_repo = Provider.mcp_tool_repo()
    env_var_repo = Provider.environment_variable_repo()

    # Get all active shared deployments from DB
    deployments = await deployment_repo.get_active_shared_deployments()
    registered_servers: dict[UUID, FastMCP] = {}

    for deployment in deployments:
        server = deployment.server
        try:
            tools = await tool_repo.get_tools_for_server(server.id)
            compiled_tools = await compile_server_tools(
                server=server,
                tools=tools,
                env_var_repo=env_var_repo,
            )

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
