"""
Shared MCP Runtime for Free Tier Users.

Uses the simple register_new_customer_app pattern to mount
customer MCP servers dynamically.
"""

from uuid import UUID

from fastapi import FastAPI
from fastmcp import FastMCP
from loguru import logger


def register_new_customer_app(app: FastAPI, server_id: UUID, tools: list) -> None:
    """
    Register a new customer MCP app on the FastAPI server.

    This is the core pattern for dynamic MCP server registration.

    Args:
        app: FastAPI application instance
        server_id: UUID of the MCP server (used as mount path)
        tools: List of compiled fastmcp Tool objects
    """
    mcp = FastMCP(
        f"MCPServer({server_id})",
        tools=tools,
    )
    app.mount(f"/mcp/{server_id}", mcp.http_app())
    logger.info(f"Registered MCP app at /mcp/{server_id} with {len(tools)} tools")


async def load_and_register_all_mcp_servers(app: FastAPI) -> int:
    """
    Load all active MCP servers from DB and register them.

    Called during FastAPI startup to restore all previously activated servers.

    Args:
        app: FastAPI application instance

    Returns:
        Number of servers registered
    """
    from core.services.tier_service import Tier
    from core.services.tool_loader import get_tool_loader
    from infrastructure.repositories.repo_provider import Provider

    server_repo = Provider.mcp_server_repo()
    tool_loader = get_tool_loader()

    # Get all active servers from DB
    servers = await server_repo.get_all_active()
    registered_count = 0

    for server in servers:
        try:
            # Compile tools for this server
            compiled_tools = []

            for tool in server.tools:
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
                register_new_customer_app(app, server.id, compiled_tools)
                registered_count += 1
            else:
                logger.warning(f"Server {server.id} has no valid tools, skipping")

        except Exception as e:
            logger.error(f"Failed to register server {server.id}: {e}")

    logger.info(f"Startup complete: registered {registered_count} MCP servers")
    return registered_count
