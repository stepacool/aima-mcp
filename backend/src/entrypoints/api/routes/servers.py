"""Server routes for activation and deployment."""

from datetime import datetime
from typing import Any
from uuid import UUID

from core.services.tier_service import (
    CURATED_LIBRARIES,
    FREE_TIER_MAX_TOOLS,
    Tier,
    get_tier_limits,
)
from core.services.tool_loader import compile_server_tools
from fastapi import APIRouter, HTTPException, Request
from infrastructure.models.deployment import DeploymentStatus, DeploymentTarget
from infrastructure.models.mcp_server import MCPServerSetupStatus
from infrastructure.repositories.deployment import DeploymentCreate
from infrastructure.repositories.repo_provider import Provider
from loguru import logger
from pydantic import BaseModel, ConfigDict, computed_field, field_validator

from entrypoints.api.deps import (
    require_org_access_to_customer,
    require_org_access_to_server,
)
from entrypoints.mcp.shared_runtime import (
    register_new_customer_app,
    remount_mcp_server,
    unregister_mcp_app,
)

router = APIRouter()


async def _try_remount(request: Request, server_id: UUID) -> None:
    """Remount the live MCP app if the server is on the shared runtime. Best-effort."""
    app = request.app
    stack = getattr(app.state, "mcp_stack", None)
    if stack:
        try:
            _ = await remount_mcp_server(app, server_id, stack)
        except Exception as e:
            logger.warning(f"Failed to remount server {server_id}: {e}")


class TierInfoResponse(BaseModel):
    tier: Tier
    max_tools: int
    can_deploy: bool
    curated_only: bool
    curated_libraries: list[str]


class ActivateResponse(BaseModel):
    server_id: UUID
    status: str
    mcp_endpoint: str
    tools_count: int


class DeployRequest(BaseModel):
    target: str = "dedicated"


class DeployResponse(BaseModel):
    server_id: UUID
    target: str
    status: str
    message: str


class UpdateServerRequest(BaseModel):
    name: str | None = None
    description: str | None = None


class ApiKeyResponse(BaseModel):
    api_key: str | None
    auth_type: str


class UpdateEnvVarRequest(BaseModel):
    value: str


@router.get("/tier-info/{tier}", response_model=TierInfoResponse)
async def get_tier_info(tier: str) -> TierInfoResponse:
    """Get information about tier limits."""
    try:
        tier_enum = Tier(tier)
    except ValueError:
        raise HTTPException(400, f"Invalid tier. Valid: {[t.value for t in Tier]}")

    limits = get_tier_limits(tier_enum)
    return TierInfoResponse(
        tier=tier_enum,
        max_tools=limits.max_tools,
        can_deploy=limits.can_deploy,
        curated_only=limits.curated_only,
        curated_libraries=sorted(CURATED_LIBRARIES.keys()),
    )


@router.get("/targets")
async def list_deployment_targets() -> dict[str, Any]:
    """List available deployment targets."""
    return {
        "targets": [
            {
                "id": t.value,
                "name": t.value.title(),
                "description": _get_target_desc(t),
            }
            for t in DeploymentTarget.public_targets()
        ]
    }


def _get_target_desc(target: DeploymentTarget) -> str:
    descriptions = {
        DeploymentTarget.SHARED: "Shared multi-tenant runtime (free tier)",
        DeploymentTarget.DEDICATED: "Dedicated VPC hosting (paid tier)",
    }
    return descriptions.get(target, "")


@router.post("/{server_id}/activate", response_model=ActivateResponse)
async def activate_server(server_id: UUID, request: Request) -> ActivateResponse:
    await require_org_access_to_server(server_id, request)
    """
    Activate an MCP server on the shared runtime (free tier).

    Loads tools from DB and registers with the FastAPI app.
    """
    server_repo = Provider.mcp_server_repo()
    deployment_repo = Provider.deployment_repo()
    env_var_repo = Provider.environment_variable_repo()

    # Load server with tools from DB
    server = await server_repo.get_with_tools(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    # Check if already deployed
    existing = await deployment_repo.get_by_server_id(server_id)
    if existing and existing.status == DeploymentStatus.ACTIVE.value:
        raise HTTPException(400, f"Server {server_id} is already deployed")

    # Check tool count for free tier
    if len(server.tools) > FREE_TIER_MAX_TOOLS:
        raise HTTPException(
            400,
            f"Free tier allows max {FREE_TIER_MAX_TOOLS} tools. "
            + f"You have {len(server.tools)}. Upgrade to paid for more.",
        )

    # Compile tools from DB (CodeValidator runs inside compile_tool for free tier)
    compiled_tools = await compile_server_tools(
        server=server,
        tools=server.tools,
        env_var_repo=env_var_repo,
        raise_on_missing_code=True,
    )

    # Register the MCP app using the simple pattern
    app = request.app
    stack = getattr(app.state, "mcp_stack", None)
    if not stack:
        logger.error("MCP stack not initialized in app state")
        raise HTTPException(status_code=500, detail="MCP runtime not initialized")

    _ = await register_new_customer_app(app, server_id, compiled_tools, stack=stack)

    # Create or update deployment record
    endpoint_url = f"/mcp/{server_id}/mcp"
    if existing:
        # Update existing deployment
        _ = await deployment_repo.activate(existing.id, endpoint_url)
    else:
        # Create new deployment
        deployment = await deployment_repo.create(
            DeploymentCreate(
                server_id=server_id,
                target=DeploymentTarget.SHARED.value,
                status=DeploymentStatus.ACTIVE.value,
                endpoint_url=endpoint_url,
            )
        )
        # Set deployed_at
        _ = await deployment_repo.activate(deployment.id, endpoint_url)

    # Update server setup status to READY
    _ = await server_repo.update_setup_status(server_id, MCPServerSetupStatus.ready)

    return ActivateResponse(
        server_id=server_id,
        status="active",
        mcp_endpoint=endpoint_url,
        tools_count=len(compiled_tools),
    )


@router.post("/{server_id}/deploy", response_model=DeployResponse)
async def deploy_server(
    server_id: UUID, request: DeployRequest, req: Request
) -> DeployResponse:
    await require_org_access_to_server(server_id, req)
    """
    Deploy to dedicated VPC (paid tier).

    Currently returns a placeholder - VPC deployment coming soon.
    """
    server_repo = Provider.mcp_server_repo()
    deployment_repo = Provider.deployment_repo()

    server = await server_repo.get_with_tools(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    # Validate target
    if request.target not in [DeploymentTarget.DEDICATED.value]:
        raise HTTPException(
            400,
            f"Invalid target '{request.target}'. "
            + "Use 'dedicated' for VPC deployment or /activate for shared runtime.",
        )

    # Check if already deployed
    existing = await deployment_repo.get_by_server_id(server_id)
    if existing and existing.status == DeploymentStatus.ACTIVE.value:
        raise HTTPException(400, f"Server {server_id} is already deployed")

    # Create deployment record with PENDING status
    if existing:
        _ = await deployment_repo.delete(existing.id)

    _ = await deployment_repo.create(
        DeploymentCreate(
            server_id=server_id,
            target=DeploymentTarget.DEDICATED.value,
            status=DeploymentStatus.PENDING.value,
        )
    )

    # Update server setup status to READY
    _ = await server_repo.update_setup_status(server_id, MCPServerSetupStatus.ready)

    return DeployResponse(
        server_id=server_id,
        target=DeploymentTarget.DEDICATED.value,
        status="pending",
        message="Dedicated VPC deployment is coming soon. "
        + "Your server has been queued for deployment.",
    )


# === Server Management Endpoints ===


class MCPToolResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str
    parameters_schema: list[dict[str, Any]]
    code: str
    server_id: UUID

    @field_validator("parameters_schema", mode="before")
    @classmethod
    def normalize_parameters_schema(cls, v: object) -> list[dict[str, Any]]:
        """Handle both dict format {'parameters': [...]} and list format [...]"""
        if isinstance(v, dict):
            return v.get("parameters", [])
        return v if isinstance(v, list) else []


class MCPEnvironmentVariableResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str
    value: str | None
    server_id: UUID


class DeploymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    server_id: UUID
    target: str
    status: str
    endpoint_url: str | None
    target_config: dict[str, Any] | None
    error_message: str | None
    deployed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class ServerListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    setup_status: str
    auth_type: str
    auth_config: dict[str, Any] | None
    tools: list[MCPToolResponse]
    environment_variables: list[MCPEnvironmentVariableResponse]
    deployment: DeploymentResponse | None
    created_at: datetime
    updated_at: datetime

    @computed_field
    def tools_count(self) -> int:
        """Number of tools for this server."""
        return len(self.tools)

    @computed_field
    def is_deployed(self) -> bool:
        """Check if server is actively deployed."""
        return (
            self.deployment is not None
            and self.deployment.status == DeploymentStatus.ACTIVE.value
        )

    @computed_field
    def mcp_endpoint(self) -> str | None:
        """Get MCP endpoint URL if deployed."""
        if self.deployment and self.deployment.endpoint_url:
            return self.deployment.endpoint_url
        return None

    @computed_field
    def tier(self) -> str:
        """Derive tier from deployment target."""
        if self.deployment and self.deployment.target != DeploymentTarget.SHARED.value:
            return "paid"
        return "free"


class ServerListResponse(BaseModel):
    servers: list[ServerListItem]


@router.get("/list/{customer_id}", response_model=ServerListResponse)
async def list_servers(customer_id: UUID, request: Request) -> ServerListResponse:
    await require_org_access_to_customer(customer_id, request)
    """
    List all MCP servers for a customer.

    Returns both drafts and completed servers with basic info.
    """
    servers = await Provider.mcp_server_repo().get_by_customer_with_stats(customer_id)
    return ServerListResponse(
        servers=[ServerListItem.model_validate(server) for server in servers]
    )


@router.get("/{server_id}/details", response_model=ServerListItem)
async def get_server_details(server_id: UUID, request: Request) -> ServerListItem:
    await require_org_access_to_server(server_id, request)
    """
    Get full details of a server including tools and deployment info.
    """
    server = await Provider.mcp_server_repo().get_with_full_details(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    return ServerListItem.model_validate(server)


@router.delete("/{server_id}")
async def delete_server(server_id: UUID, request: Request) -> dict[str, Any]:
    await require_org_access_to_server(server_id, request)
    """
    Delete an MCP server.

    This will unmount the MCP app from FastAPI if currently deployed and delete the server and all related data (tools, prompts cascade).
    """
    server_repo = Provider.mcp_server_repo()

    server = await server_repo.get_by_uuid(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    if server.deployment and server.deployment.status == DeploymentStatus.ACTIVE.value:
        _ = unregister_mcp_app(request.app, server_id)

    _ = await server_repo.delete_cascade(server_id)
    logger.info(f"Deleted server {server_id}")
    return {
        "status": "deleted",
        "server_id": str(server_id),
    }


@router.patch("/{server_id}", response_model=ServerListItem)
async def update_server(
    server_id: UUID, body: UpdateServerRequest, request: Request
) -> ServerListItem:
    await require_org_access_to_server(server_id, request)
    """
    Update an MCP server's name and description.
    Remounts the server in the shared runtime if it is actively deployed.
    """
    server_repo = Provider.mcp_server_repo()

    # Check if server exists
    server = await server_repo.get_by_uuid(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    # Prepare update data
    from infrastructure.repositories.mcp_server import MCPServerUpdate

    update_data = MCPServerUpdate()
    if body.name is not None:
        update_data.name = body.name
    if body.description is not None:
        update_data.description = body.description

    _ = await server_repo.update(server_id, update_data)

    # Remount the live MCP app if the server is deployed (best-effort)
    await _try_remount(request, server_id)

    # Fetch full details to return consistent response format
    server_details = await server_repo.get_with_full_details(server_id)

    return ServerListItem.model_validate(server_details)


@router.get("/{server_id}/api-key", response_model=ApiKeyResponse)
async def get_server_api_key(server_id: UUID, request: Request) -> ApiKeyResponse:
    await require_org_access_to_server(server_id, request)
    """Get the API key for a server."""
    server_repo = Provider.mcp_server_repo()
    server = await server_repo.get_by_uuid(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    api_key_repo = Provider.static_api_key_repo()
    api_key_record = await api_key_repo.get_by_server_id(server_id)

    return ApiKeyResponse(
        api_key=api_key_record.key if api_key_record else None,
        auth_type=server.auth_type,
    )


@router.patch("/{server_id}/tools/{tool_id}", response_model=MCPToolResponse)
async def update_tool(
    server_id: UUID, tool_id: UUID, body: UpdateServerRequest, request: Request
) -> MCPToolResponse:
    await require_org_access_to_server(server_id, request)
    """
    Update an MCP tool's description.
    Remounts the server in the shared runtime if it is actively deployed.
    """
    from infrastructure.repositories.mcp_server import MCPToolUpdate

    tool_repo = Provider.mcp_tool_repo()

    # Verify tool exists and belongs to this server
    tool = await tool_repo.get_by_uuid(tool_id)
    if not tool or tool.server_id != server_id:
        raise HTTPException(404, f"Tool {tool_id} not found for server {server_id}")

    update_data = MCPToolUpdate()
    if body.description is not None:
        update_data.description = body.description

    _ = await tool_repo.update(tool_id, update_data)

    # Remount the live MCP app if the server is deployed (best-effort)
    await _try_remount(request, server_id)

    # Fetch updated tool
    updated_tool = await tool_repo.get_by_uuid(tool_id)
    if not updated_tool:
        raise HTTPException(500, "Failed to fetch updated tool")

    return MCPToolResponse.model_validate(updated_tool)


@router.patch("/{server_id}/env-vars/{var_id}")
async def update_env_var(
    server_id: UUID, var_id: UUID, request: UpdateEnvVarRequest, req: Request
) -> dict[str, Any]:
    await require_org_access_to_server(server_id, req)
    """Update the value of an environment variable. Remounts the server if deployed."""
    env_var_repo = Provider.environment_variable_repo()

    # Verify the variable exists and belongs to this server
    env_vars = await env_var_repo.get_vars_for_server(server_id)
    if not any(var.id == var_id for var in env_vars):
        raise HTTPException(
            404,
            f"Environment variable {var_id} not found for server {server_id}",
        )

    updated = await env_var_repo.update_value(var_id, request.value)
    if not updated:
        raise HTTPException(500, "Failed to update environment variable")

    # Remount so tools pick up the new env var values (they are injected at compile time)
    try:
        app = req.app
        stack = getattr(app.state, "mcp_stack", None)
        if stack:
            _ = await remount_mcp_server(app, server_id, stack)
    except Exception as e:
        logger.warning(
            f"Failed to remount server {server_id} after env var update: {e}"
        )

    return {"status": "updated", "var_id": str(var_id)}
