"""
Meta MCP Server — a pre-built MCP server for creating and managing MCP servers.

Exposes tools that let an AI assistant programmatically:
  - Create new MCP servers
  - Add and update tools with Python code
  - Configure environment variables
  - Activate / deploy servers onto the shared runtime
  - Inspect existing servers

Mount with ``mount_meta_mcp(app, stack)`` during FastAPI startup.
"""

import json
from contextlib import AsyncExitStack
from uuid import UUID

from core.services.tier_service import CURATED_LIBRARIES, FREE_TIER_MAX_TOOLS
from core.services.tool_loader import compile_server_tools
from fastapi import FastAPI
from fastmcp import FastMCP
from infrastructure.models.deployment import DeploymentStatus, DeploymentTarget
from infrastructure.models.mcp_server import MCPServerSetupStatus
from infrastructure.repositories.deployment import DeploymentCreate
from infrastructure.repositories.mcp_server import (
    MCPEnvironmentVariableCreate,
    MCPServerCreate,
    MCPToolCreate,
    MCPToolUpdate,
)
from infrastructure.repositories.repo_provider import Provider
from loguru import logger

META_MCP_PATH = "/meta"

_INSTRUCTIONS = """\
You are connected to the AutoMCP Meta Server.
Use the tools below to create, configure, and deploy MCP servers on the AutoMCP platform.

## Typical workflow

1. `create_server`            — create a blank server
2. `add_tool` (repeat)        — add Python-backed tools
3. `add_environment_variable` — store API keys / config (optional)
4. `activate_server`          — deploy to the shared runtime

After activation the server is reachable at `/mcp/{server_id}/mcp`.

## Tool code rules

- The `code` argument is the **async function body** (not the `def` line).
- Access environment variables with `os.environ.get("VAR_NAME")`.
- Only curated libraries are allowed on the free tier (httpx, aiohttp, json,
  datetime, re, asyncpg, …).  Use `get_allowed_libraries` to see the full list.
- Do **not** write top-level imports; put any `import` statements inside the body.

### Minimal example
```python
import httpx
async with httpx.AsyncClient() as client:
    resp = await client.get(f"https://api.example.com/items/{item_id}")
    return resp.json()
```
"""


def build_meta_mcp(app: FastAPI, stack: AsyncExitStack) -> FastMCP:
    """
    Build the Meta MCP server.

    Returns a configured :class:`FastMCP` instance whose tools close over
    *app* and *stack* so they can mount new servers at runtime.

    Args:
        app:   The running FastAPI application.
        stack: The :class:`AsyncExitStack` that manages MCP server lifespans.
    """
    mcp = FastMCP("AutoMCP Meta Server", instructions=_INSTRUCTIONS)

    # ------------------------------------------------------------------
    # Server lifecycle tools
    # ------------------------------------------------------------------

    @mcp.tool()
    async def create_server(
        name: str,
        description: str,
        customer_id: str,
    ) -> str:
        """
        Create a new MCP server.

        Creates a blank server owned by *customer_id*.  The server has no
        tools yet — add them with ``add_tool`` before calling
        ``activate_server``.

        Args:
            name:        Short, descriptive name  (e.g. "GitHub Tools").
            description: What this server does and which tools it will expose.
            customer_id: UUID of the customer who owns the server.

        Returns:
            JSON with ``server_id``, ``name``, ``description``, and next steps.
        """
        try:
            customer_uuid = UUID(customer_id)
        except ValueError:
            return json.dumps({"error": f"Invalid customer_id: '{customer_id}'"})

        server_repo = Provider.mcp_server_repo()
        server = await server_repo.create(
            MCPServerCreate(
                name=name,
                description=description,
                customer_id=customer_uuid,
            )
        )

        logger.info(f"Meta MCP: created server '{name}' (id={server.id})")
        return json.dumps(
            {
                "server_id": str(server.id),
                "name": server.name,
                "description": server.description,
                "setup_status": server.setup_status.value,
                "message": (
                    "Server created. "
                    "Add tools with `add_tool`, then call `activate_server`."
                ),
            }
        )

    @mcp.tool()
    async def activate_server(server_id: str) -> str:
        """
        Activate an MCP server on the shared runtime (free tier).

        Compiles all tools, validates their code, and mounts the server so
        it is immediately reachable at ``/mcp/{server_id}/mcp``.

        Requirements:
          - The server must have at least one tool with non-empty code.
          - Free tier: maximum ``FREE_TIER_MAX_TOOLS`` tools per server.

        Args:
            server_id: UUID of the server to activate.

        Returns:
            JSON with ``mcp_endpoint`` and ``tools_count`` on success, or an
            ``error`` key describing what went wrong.
        """
        try:
            server_uuid = UUID(server_id)
        except ValueError:
            return json.dumps({"error": f"Invalid server_id: '{server_id}'"})

        server_repo = Provider.mcp_server_repo()
        deployment_repo = Provider.deployment_repo()
        env_var_repo = Provider.environment_variable_repo()

        server = await server_repo.get_with_tools(server_uuid)
        if not server:
            return json.dumps({"error": f"Server {server_id} not found"})

        if not server.tools:
            return json.dumps(
                {
                    "error": (
                        "Server has no tools. "
                        "Add at least one tool with `add_tool` before activating."
                    )
                }
            )

        if len(server.tools) > FREE_TIER_MAX_TOOLS:
            return json.dumps(
                {
                    "error": (
                        f"Free tier allows max {FREE_TIER_MAX_TOOLS} tools, "
                        f"but this server has {len(server.tools)}."
                    )
                }
            )

        existing = await deployment_repo.get_by_server_id(server_uuid)
        if existing and existing.status == DeploymentStatus.ACTIVE.value:
            return json.dumps(
                {
                    "error": "Server is already active.",
                    "mcp_endpoint": existing.endpoint_url,
                }
            )

        try:
            compiled_tools = await compile_server_tools(
                server=server,
                tools=server.tools,
                env_var_repo=env_var_repo,
                raise_on_missing_code=True,
            )
        except Exception as exc:
            return json.dumps({"error": f"Tool compilation failed: {exc}"})

        if not compiled_tools:
            return json.dumps(
                {"error": "No tools could be compiled. Check the tool code."}
            )

        from entrypoints.mcp.shared_runtime import register_new_customer_app

        _ = await register_new_customer_app(app, server_uuid, compiled_tools, stack)

        endpoint_url = f"/mcp/{server_uuid}/mcp"
        if existing:
            _ = await deployment_repo.activate(existing.id, endpoint_url)
        else:
            deployment = await deployment_repo.create(
                DeploymentCreate(
                    server_id=server_uuid,
                    target=DeploymentTarget.SHARED.value,
                    status=DeploymentStatus.ACTIVE.value,
                    endpoint_url=endpoint_url,
                )
            )
            _ = await deployment_repo.activate(deployment.id, endpoint_url)

        _ = await server_repo.update_setup_status(
            server_uuid, MCPServerSetupStatus.ready
        )

        logger.info(
            f"Meta MCP: activated server {server_id} with {len(compiled_tools)} tool(s)"
        )
        return json.dumps(
            {
                "server_id": server_id,
                "status": "active",
                "mcp_endpoint": endpoint_url,
                "tools_count": len(compiled_tools),
                "message": f"Server is live at {endpoint_url}",
            }
        )

    # ------------------------------------------------------------------
    # Tool management
    # ------------------------------------------------------------------

    @mcp.tool()
    async def add_tool(
        server_id: str,
        name: str,
        description: str,
        code: str,
        parameters: str = "[]",
    ) -> str:
        """
        Add a tool to an MCP server.

        Tools are async Python functions called by AI clients through the MCP
        protocol.  Each tool has a name, a description (shown to the AI as
        context), typed parameters, and a Python implementation.

        **Parameter format** (JSON array of objects):
        ```json
        [
          {
            "name": "url",
            "type": "string",
            "description": "The URL to fetch",
            "required": true
          },
          {
            "name": "timeout",
            "type": "integer",
            "description": "Timeout in seconds",
            "required": false
          }
        ]
        ```
        Valid types: ``"string"``, ``"integer"``, ``"number"``, ``"boolean"``.

        **Code example** (async function body):
        ```python
        import httpx
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(url)
            return resp.text
        ```

        Args:
            server_id:   UUID of the target server.
            name:        Snake_case tool name  (e.g. ``"get_weather"``).
            description: Detailed description of what the tool does, what it
                         returns, and when an AI should call it.  Good
                         descriptions dramatically improve AI accuracy.
            code:        Async function body (no ``def`` line needed).
                         Use ``os.environ.get("VAR")`` for env vars.
            parameters:  JSON array of parameter definitions (see above).
                         Defaults to ``"[]"`` (no parameters).

        Returns:
            JSON with ``tool_id`` and a confirmation message.
        """
        try:
            server_uuid = UUID(server_id)
        except ValueError:
            return json.dumps({"error": f"Invalid server_id: '{server_id}'"})

        try:
            parsed = json.loads(parameters)
        except (json.JSONDecodeError, ValueError) as exc:
            return json.dumps({"error": f"Invalid parameters JSON: {exc}"})

        if not isinstance(parsed, list):
            return json.dumps({"error": "'parameters' must be a JSON array"})

        params_list: list[dict[str, object]] = parsed

        for param in params_list:
            if not isinstance(param, dict) or "name" not in param:
                return json.dumps(
                    {
                        "error": (
                            "Each parameter must be a JSON object "
                            "with at least a 'name' field."
                        )
                    }
                )

        tool_repo = Provider.mcp_tool_repo()
        tool = await tool_repo.create(
            MCPToolCreate(
                server_id=server_uuid,
                name=name,
                description=description,
                parameters_schema=params_list,
                code=code,
            )
        )

        logger.info(f"Meta MCP: added tool '{name}' to server {server_id}")
        return json.dumps(
            {
                "tool_id": str(tool.id),
                "name": tool.name,
                "description": tool.description,
                "parameters_count": len(params_list),
                "message": (
                    f"Tool '{name}' added. "
                    "Add more tools or call `activate_server` to deploy."
                ),
            }
        )

    @mcp.tool()
    async def update_tool(
        server_id: str,
        tool_id: str,
        code: str | None = None,
        description: str | None = None,
        parameters: str | None = None,
    ) -> str:
        """
        Update an existing tool's code, description, or parameters.

        Only the fields you provide are changed.  If the server is already
        active on the shared runtime it will be remounted automatically so the
        change takes effect immediately — no manual re-activation needed.

        Args:
            server_id:   UUID of the server that owns the tool (needed to
                         trigger a remount when the server is live).
            tool_id:     UUID of the tool to update.
            code:        New async function body  (optional).
            description: New description for the tool  (optional).
            parameters:  New parameters as a JSON array  (optional).

        Returns:
            JSON confirming the update and whether the server was remounted.
        """
        try:
            tool_uuid = UUID(tool_id)
            server_uuid = UUID(server_id)
        except ValueError as exc:
            return json.dumps({"error": f"Invalid UUID: {exc}"})

        tool_repo = Provider.mcp_tool_repo()
        existing_tool = await tool_repo.get_by_uuid(tool_uuid)
        if not existing_tool:
            return json.dumps({"error": f"Tool {tool_id} not found"})

        params_list: list[dict[str, object]] | None = None
        if parameters is not None:
            try:
                params_list = json.loads(parameters)
            except (json.JSONDecodeError, ValueError) as exc:
                return json.dumps({"error": f"Invalid parameters JSON: {exc}"})

        _ = await tool_repo.update(
            tool_uuid,
            MCPToolUpdate(
                code=code,
                description=description,
                parameters_schema=params_list,
            ),
        )

        from entrypoints.mcp.shared_runtime import remount_mcp_server

        remounted = await remount_mcp_server(app, server_uuid, stack)
        logger.info(f"Meta MCP: updated tool {tool_id} (remounted={remounted})")
        return json.dumps(
            {
                "tool_id": tool_id,
                "updated": True,
                "remounted": remounted,
                "message": "Tool updated"
                + (" and server remounted" if remounted else ""),
            }
        )

    @mcp.tool()
    async def delete_tool(server_id: str, tool_id: str) -> str:
        """
        Delete a tool from an MCP server.

        If the server is active on the shared runtime it will be remounted
        without the deleted tool.

        Args:
            server_id: UUID of the server that owns the tool.
            tool_id:   UUID of the tool to delete.

        Returns:
            JSON confirming deletion and whether the server was remounted.
        """
        try:
            tool_uuid = UUID(tool_id)
            server_uuid = UUID(server_id)
        except ValueError as exc:
            return json.dumps({"error": f"Invalid UUID: {exc}"})

        tool_repo = Provider.mcp_tool_repo()
        deleted = await tool_repo.delete(tool_uuid)
        if not deleted:
            return json.dumps({"error": f"Tool {tool_id} not found"})

        from entrypoints.mcp.shared_runtime import remount_mcp_server

        remounted = await remount_mcp_server(app, server_uuid, stack)
        logger.info(f"Meta MCP: deleted tool {tool_id} (remounted={remounted})")
        return json.dumps(
            {
                "tool_id": tool_id,
                "deleted": True,
                "remounted": remounted,
            }
        )

    # ------------------------------------------------------------------
    # Environment variable management
    # ------------------------------------------------------------------

    @mcp.tool()
    async def add_environment_variable(
        server_id: str,
        name: str,
        description: str,
        value: str = "",
    ) -> str:
        """
        Add an environment variable to an MCP server.

        Environment variables store sensitive configuration like API keys or
        database URLs.  Inside tool code, access them with
        ``os.environ.get("VAR_NAME")``.

        Args:
            server_id:   UUID of the target server.
            name:        Variable name in ``UPPER_SNAKE_CASE``
                         (e.g. ``"GITHUB_TOKEN"``).
            description: Purpose of this variable and how to obtain it
                         (e.g. "GitHub personal access token with repo:read").
            value:       Variable value (optional — can be set later).

        Returns:
            JSON with ``env_var_id`` and confirmation.
        """
        try:
            server_uuid = UUID(server_id)
        except ValueError:
            return json.dumps({"error": f"Invalid server_id: '{server_id}'"})

        env_var_repo = Provider.environment_variable_repo()
        env_var = await env_var_repo.create(
            MCPEnvironmentVariableCreate(
                server_id=server_uuid,
                name=name,
                description=description,
                value=value if value else None,
            )
        )

        return json.dumps(
            {
                "env_var_id": str(env_var.id),
                "name": env_var.name,
                "description": env_var.description,
                "has_value": bool(env_var.value),
                "message": f"Environment variable '{name}' added.",
            }
        )

    # ------------------------------------------------------------------
    # Inspection tools
    # ------------------------------------------------------------------

    @mcp.tool()
    async def list_servers(customer_id: str) -> str:
        """
        List all MCP servers for a customer.

        Returns every server owned by *customer_id* — drafts and deployed
        alike — with their status, tool count, and endpoint URL.

        Args:
            customer_id: UUID of the customer whose servers to list.

        Returns:
            JSON with a ``servers`` array and a ``total`` count.
        """
        try:
            customer_uuid = UUID(customer_id)
        except ValueError:
            return json.dumps({"error": f"Invalid customer_id: '{customer_id}'"})

        server_repo = Provider.mcp_server_repo()
        servers = await server_repo.get_by_customer_with_stats(customer_uuid)

        items = [
            {
                "server_id": str(s.id),
                "name": s.name,
                "description": s.description,
                "setup_status": s.setup_status.value,
                "tools_count": len(s.tools),
                "is_deployed": s.is_deployed,
                "mcp_endpoint": (
                    s.deployment.endpoint_url
                    if s.deployment and s.is_deployed
                    else None
                ),
                "deployment_status": (s.deployment.status if s.deployment else None),
            }
            for s in servers
        ]

        return json.dumps({"servers": items, "total": len(items)})

    @mcp.tool()
    async def get_server_details(server_id: str) -> str:
        """
        Get full details of an MCP server.

        Returns the server's metadata, all tools (name, description,
        parameters, and code), environment variable names/descriptions (values
        are redacted), and deployment information.

        Args:
            server_id: UUID of the server to inspect.

        Returns:
            JSON with complete server details.
        """
        try:
            server_uuid = UUID(server_id)
        except ValueError:
            return json.dumps({"error": f"Invalid server_id: '{server_id}'"})

        server_repo = Provider.mcp_server_repo()
        server = await server_repo.get_with_full_details(server_uuid)
        if not server:
            return json.dumps({"error": f"Server {server_id} not found"})

        tools = [
            {
                "tool_id": str(t.id),
                "name": t.name,
                "description": t.description,
                "parameters": t.parameters_schema,
                "code": t.code,
            }
            for t in server.tools
        ]

        env_vars = [
            {
                "env_var_id": str(v.id),
                "name": v.name,
                "description": v.description,
                "has_value": bool(v.value),
            }
            for v in server.environment_variables
        ]

        dep = server.deployment
        return json.dumps(
            {
                "server_id": str(server.id),
                "name": server.name,
                "description": server.description,
                "setup_status": server.setup_status.value,
                "auth_type": server.auth_type,
                "tools": tools,
                "environment_variables": env_vars,
                "deployment": (
                    {
                        "status": dep.status,
                        "target": dep.target,
                        "endpoint_url": dep.endpoint_url,
                        "deployed_at": (
                            dep.deployed_at.isoformat() if dep.deployed_at else None
                        ),
                    }
                    if dep
                    else None
                ),
            }
        )

    # ------------------------------------------------------------------
    # Platform information
    # ------------------------------------------------------------------

    @mcp.tool()
    async def get_allowed_libraries() -> str:
        """
        List Python libraries allowed in free-tier tool code.

        Free-tier tools run in a sandboxed environment.  Only libraries in
        this curated list may be imported.  A ``null`` value means all exports
        from that library are permitted; a list value restricts imports to the
        named symbols.

        Returns:
            JSON mapping library names to allowed exports (or ``null``).
        """
        libraries = {lib: exports for lib, exports in sorted(CURATED_LIBRARIES.items())}
        return json.dumps(
            {
                "allowed_libraries": libraries,
                "note": (
                    "null = all exports allowed; "
                    "a list = only those symbols may be imported."
                ),
            }
        )

    return mcp


async def mount_meta_mcp(app: FastAPI, stack: AsyncExitStack) -> FastMCP:
    """
    Build and mount the Meta MCP server on *app*.

    Call this once during FastAPI startup (before ``yield``) to make the
    meta server available at :data:`META_MCP_PATH`.

    Args:
        app:   The running FastAPI application.
        stack: The ``AsyncExitStack`` managing MCP server lifespans.

    Returns:
        The mounted :class:`FastMCP` instance.
    """
    mcp = build_meta_mcp(app, stack)
    mcp_sub_app = mcp.http_app()

    app.mount(META_MCP_PATH, mcp_sub_app)
    _ = await stack.enter_async_context(mcp_sub_app.lifespan(app))

    logger.info(f"Meta MCP server mounted at {META_MCP_PATH}")
    return mcp
