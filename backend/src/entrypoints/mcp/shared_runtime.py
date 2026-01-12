"""
Shared MCP Runtime for Free Tier Users.

This runtime dynamically injects customer tools based on authentication.
Each customer gets their tools namespaced and isolated.
"""

from typing import Any
from uuid import UUID

from fastmcp import FastMCP
from fastmcp.server.middleware.tool_injection import ToolInjectionMiddleware
from loguru import logger
from pydantic import Field

from core.services.tool_loader import get_tool_loader

# The shared MCP server
mcp = FastMCP(
    name="automcp_shared",
    instructions="""
This is a shared MCP runtime that provides customer-specific tools.
Tools are dynamically loaded based on your authentication.
""",
)


# In-memory customer tool registry (in production, load from database)
_customer_tools_registry: dict[UUID, list[dict[str, Any]]] = {}


def register_customer_tools(customer_id: UUID, tools: list[dict[str, Any]]) -> None:
    """
    Register tools for a customer in the shared runtime.

    Args:
        customer_id: Customer UUID
        tools: List of tool specs with id, name, description, parameters, code
    """
    _customer_tools_registry[customer_id] = tools
    # Invalidate any cached compiled tools
    get_tool_loader().invalidate_customer_tools(customer_id)
    logger.info(f"Registered {len(tools)} tools for customer {customer_id}")


def unregister_customer_tools(customer_id: UUID) -> None:
    """Remove all tools for a customer."""
    if customer_id in _customer_tools_registry:
        del _customer_tools_registry[customer_id]
    get_tool_loader().invalidate_customer_tools(customer_id)
    logger.info(f"Unregistered tools for customer {customer_id}")


def get_customer_middleware(customer_id: UUID) -> ToolInjectionMiddleware | None:
    """
    Get a ToolInjectionMiddleware with the customer's tools.

    Args:
        customer_id: Customer UUID

    Returns:
        Middleware with customer tools, or None if no tools registered
    """
    if customer_id not in _customer_tools_registry:
        return None

    tool_specs = _customer_tools_registry[customer_id]
    if not tool_specs:
        return None

    loader = get_tool_loader()
    tools = loader.get_customer_tools(customer_id, tool_specs)

    if not tools:
        return None

    return ToolInjectionMiddleware(tools=tools)


# Base tools available to all customers
@mcp.tool()
async def get_server_info() -> dict:
    """Get information about this MCP server."""
    return {
        "name": "AutoMCP Shared Runtime",
        "version": "1.0.0",
        "tier": "free",
        "description": "Shared runtime for free tier customers",
    }


@mcp.tool()
async def list_my_tools(customer_id: str = Field(description="Your customer ID")) -> dict:
    """List the tools registered for your account."""
    try:
        cid = UUID(customer_id)
    except ValueError:
        return {"error": "Invalid customer ID format"}

    if cid not in _customer_tools_registry:
        return {"tools": [], "message": "No tools registered"}

    tools = _customer_tools_registry[cid]
    return {
        "tools": [
            {"name": t["name"], "description": t["description"]}
            for t in tools
        ],
        "count": len(tools),
    }


def create_customer_mcp(customer_id: UUID) -> FastMCP:
    """
    Create a FastMCP instance with customer-specific tools injected.

    This is used when serving a specific customer's request.
    """
    middleware = get_customer_middleware(customer_id)

    if middleware:
        # Create a new server with the middleware
        customer_mcp = FastMCP(
            name=f"automcp_{customer_id.hex[:8]}",
            middleware=[middleware],
        )

        # Copy base tools
        @customer_mcp.tool()
        async def get_server_info() -> dict:
            """Get information about this MCP server."""
            return {
                "name": f"AutoMCP Customer {customer_id.hex[:8]}",
                "version": "1.0.0",
                "tier": "free",
                "customer_id": str(customer_id),
            }

        return customer_mcp

    return mcp


# HTTP app factory for serving multiple customers
def create_app():
    """Create the shared runtime HTTP app."""
    from fastapi import FastAPI, Header, HTTPException
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(
        title="AutoMCP Shared Runtime",
        description="Shared MCP runtime for free tier customers",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    async def get_customer_id(
        x_customer_id: str | None = Header(None, alias="X-Customer-ID"),
        authorization: str | None = Header(None),
    ) -> UUID | None:
        """Extract customer ID from headers."""
        if x_customer_id:
            try:
                return UUID(x_customer_id)
            except ValueError:
                raise HTTPException(400, "Invalid X-Customer-ID header")

        # Could also extract from JWT token in authorization header
        return None

    @app.get("/health")
    async def health():
        return {"status": "healthy", "runtime": "shared"}

    @app.get("/customers/{customer_id}/tools")
    async def get_customer_tools_endpoint(customer_id: UUID):
        """Get tools registered for a customer."""
        if customer_id not in _customer_tools_registry:
            return {"tools": []}
        return {
            "tools": [
                {"name": t["name"], "description": t["description"]}
                for t in _customer_tools_registry[customer_id]
            ]
        }

    # Mount the base MCP server
    app.mount("/mcp", mcp.http_app())

    return app


if __name__ == "__main__":
    import uvicorn

    app = create_app()
    uvicorn.run(app, host="0.0.0.0", port=8001)
