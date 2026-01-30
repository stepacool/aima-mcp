"""Server routes for activation and deployment."""

from datetime import datetime
from uuid import UUID
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, Request
from loguru import logger
from pydantic import BaseModel, ConfigDict, computed_field, field_validator

from core.services.tier_service import (
    CURATED_LIBRARIES,
    FREE_TIER_MAX_TOOLS,
    CodeValidator,
    Tier,
    get_tier_limits,
)
from core.services.tool_loader import get_tool_loader
from entrypoints.mcp.shared_runtime import register_new_customer_app, unregister_mcp_app
from infrastructure.models.deployment import DeploymentStatus, DeploymentTarget
from infrastructure.models.mcp_server import MCPServerSetupStatus
from infrastructure.repositories.deployment import DeploymentCreate
from infrastructure.repositories.repo_provider import Provider


router = APIRouter()


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
    name: Optional[str] = None
    description: Optional[str] = None



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
async def list_deployment_targets() -> dict:
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
            f"You have {len(server.tools)}. Upgrade to paid for more.",
        )

    # Get environment variables for this server
    env_var_records = await env_var_repo.get_vars_for_server(server_id)
    env_vars = {var.name: var.value for var in env_var_records if var.value is not None}

    # Compile tools from DB
    tool_loader = get_tool_loader()
    compiled_tools = []

    for tool in server.tools:
        if not tool.code:
            raise HTTPException(
                400,
                f"Tool {tool.name} has no code. "
                f"Generate code first via /wizard/{server_id}/generate-code",
            )

        # Validate code for free tier
        validator = CodeValidator(Tier.FREE)
        errors = validator.validate(tool.code)
        if errors:
            raise HTTPException(400, f"Tool {tool.name} validation failed: {errors}")

        # Compile the tool
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
            logger.error(f"Failed to compile tool {tool.name}: {e}")
            raise HTTPException(400, f"Failed to compile tool {tool.name}: {e}")

    # Register the MCP app using the simple pattern
    app = request.app
    stack = getattr(app.state, "mcp_stack", None)
    if not stack:
        logger.error("MCP stack not initialized in app state")
        raise HTTPException(status_code=500, detail="MCP runtime not initialized")

    await register_new_customer_app(app, server_id, compiled_tools, stack=stack)

    # Create or update deployment record
    endpoint_url = f"/mcp/{server_id}/mcp"
    if existing:
        # Update existing deployment
        await deployment_repo.activate(existing.id, endpoint_url)
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
        await deployment_repo.activate(deployment.id, endpoint_url)

    # Update server setup status to READY
    await server_repo.update_setup_status(server_id, MCPServerSetupStatus.ready)

    return ActivateResponse(
        server_id=server_id,
        status="active",
        mcp_endpoint=endpoint_url,
        tools_count=len(compiled_tools),
    )


@router.post("/{server_id}/deploy", response_model=DeployResponse)
async def deploy_server(server_id: UUID, request: DeployRequest) -> DeployResponse:
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
            "Use 'dedicated' for VPC deployment or /activate for shared runtime.",
        )

    # Check if already deployed
    existing = await deployment_repo.get_by_server_id(server_id)
    if existing and existing.status == DeploymentStatus.ACTIVE.value:
        raise HTTPException(400, f"Server {server_id} is already deployed")

    # Create deployment record with PENDING status
    if existing:
        await deployment_repo.delete(existing.id)

    await deployment_repo.create(
        DeploymentCreate(
            server_id=server_id,
            target=DeploymentTarget.DEDICATED.value,
            status=DeploymentStatus.PENDING.value,
        )
    )

    # Update server setup status to READY
    await server_repo.update_setup_status(server_id, MCPServerSetupStatus.ready)

    return DeployResponse(
        server_id=server_id,
        target=DeploymentTarget.DEDICATED.value,
        status="pending",
        message="Dedicated VPC deployment is coming soon. "
        "Your server has been queued for deployment.",
    )


# === Server Management Endpoints ===


class MCPToolResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str
    parameters_schema: list[dict]
    code: str
    server_id: UUID

    @field_validator("parameters_schema", mode="before")
    @classmethod
    def normalize_parameters_schema(cls, v):
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
    target_config: dict | None
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
    deployment: Optional[DeploymentResponse]
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
async def list_servers(customer_id: UUID) -> ServerListResponse:
    """
    List all MCP servers for a customer.

    Returns both drafts and completed servers with basic info.
    """
    servers = await Provider.mcp_server_repo().get_by_customer_with_stats(customer_id)
    return ServerListResponse(
        servers=[ServerListItem.model_validate(server) for server in servers]
    )


@router.get("/{server_id}/details", response_model=ServerListItem)
async def get_server_details(server_id: UUID) -> ServerListItem:
    """
    Get full details of a server including tools and deployment info.
    """
    server = await Provider.mcp_server_repo().get_with_full_details(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    return ServerListItem.model_validate(server)


@router.delete("/{server_id}")
async def delete_server(server_id: UUID, request: Request) -> dict:
    """
    Delete an MCP server.

    This will unmount the MCP app from FastAPI if currently deployed and delete the server and all related data (tools, prompts cascade).
    """
    server_repo = Provider.mcp_server_repo()

    server = await server_repo.get_by_uuid(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    if server.deployment and server.deployment.status == DeploymentStatus.ACTIVE.value:
        unregister_mcp_app(request.app, server_id)

    await server_repo.delete_cascade(server_id)
    logger.info(f"Deleted server {server_id}")
    return {
        "status": "deleted",
        "server_id": str(server_id),
    }


@router.patch("/{server_id}", response_model=ServerListItem)
async def update_server(
    server_id: UUID, request: UpdateServerRequest
) -> ServerListItem:
    """
    Update an MCP server's name and description.
    """
    server_repo = Provider.mcp_server_repo()
    
    # Check if server exists
    server = await server_repo.get_by_uuid(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")
        
    # Prepare update data
    from infrastructure.repositories.mcp_server import MCPServerUpdate

    update_data = MCPServerUpdate()
    if request.name is not None:
        update_data.name = request.name
    if request.description is not None:
        update_data.description = request.description
        
    await server_repo.update(server_id, update_data)
    
    # Fetch full details to return consistent response format
    server_details = await server_repo.get_with_full_details(server_id)
    
    return ServerListItem.model_validate(server_details)
