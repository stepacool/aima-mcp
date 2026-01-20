"""Server routes for activation and deployment."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Request
from loguru import logger
from pydantic import BaseModel

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
                parameters=tool.parameters_schema.get("parameters", []),
                code=tool.code,
                customer_id=server.customer_id,
                tier=Tier.FREE,
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


class ServerListItem(BaseModel):
    """Summary of a server for list view."""

    id: UUID
    name: str
    description: str | None
    status: str
    wizard_step: str
    tools_count: int
    is_deployed: bool
    mcp_endpoint: str | None
    created_at: str


class ServerListResponse(BaseModel):
    servers: list[ServerListItem]


class ServerDetailsResponse(BaseModel):
    """Full server details including tools and deployment."""

    id: UUID
    name: str
    description: str | None
    status: str
    wizard_step: str
    auth_type: str
    auth_config: dict | None
    tier: str
    is_deployed: bool
    mcp_endpoint: str | None
    tools: list[dict]
    created_at: str
    updated_at: str


@router.get("/list/{customer_id}", response_model=ServerListResponse)
async def list_servers(customer_id: UUID) -> ServerListResponse:
    """
    List all MCP servers for a customer.

    Returns both drafts and completed servers with basic info.
    """
    server_repo = Provider.mcp_server_repo()

    # Use optimized query with eager loading
    servers = await server_repo.get_by_customer_with_stats(customer_id)

    items = []
    for server in servers:
        # Data is already loaded
        deployment = server.deployment
        is_deployed = bool(
            deployment and deployment.status == DeploymentStatus.ACTIVE.value
        )
        mcp_endpoint = deployment.endpoint_url if is_deployed and deployment else None

        tools_count = len(server.tools)

        items.append(
            ServerListItem(
                id=server.id,
                name=server.name,
                description=server.description,
                status=server.status,
                wizard_step=server.wizard_step,
                tools_count=tools_count,
                is_deployed=is_deployed,
                mcp_endpoint=mcp_endpoint,
                created_at=server.created_at.isoformat() if server.created_at else "",
            )
        )

    return ServerListResponse(servers=items)


@router.get("/{server_id}/details", response_model=ServerDetailsResponse)
async def get_server_details(server_id: UUID) -> ServerDetailsResponse:
    """
    Get full details of a server including tools and deployment info.
    """
    server_repo = Provider.mcp_server_repo()
    deployment_repo = Provider.deployment_repo()

    server = await server_repo.get_with_full_details(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    # Get deployment info
    deployment = await deployment_repo.get_by_server_id(server_id)
    is_deployed = bool(
        deployment and deployment.status == DeploymentStatus.ACTIVE.value
    )
    mcp_endpoint = deployment.endpoint_url if is_deployed and deployment else None

    # Format tools
    tools = [
        {
            "id": str(t.id),
            "name": t.name,
            "description": t.description,
            "parameters": t.parameters_schema.get("parameters", []),
            "has_code": bool(t.code),
        }
        for t in server.tools
    ]

    return ServerDetailsResponse(
        id=server.id,
        name=server.name,
        description=server.description,
        status=server.status,
        wizard_step=server.wizard_step,
        auth_type=server.auth_type,
        auth_config=server.auth_config,
        tier=server.tier,
        is_deployed=is_deployed,
        mcp_endpoint=mcp_endpoint,
        tools=tools,
        created_at=server.created_at.isoformat() if server.created_at else "",
        updated_at=server.updated_at.isoformat() if server.updated_at else "",
    )


@router.delete("/{server_id}")
async def delete_server(server_id: UUID, request: Request) -> dict:
    """
    Delete an MCP server.

    This will:
    1. Unmount the MCP app from FastAPI if currently deployed
    2. Delete the deployment record
    3. Delete the server and all related data (tools, prompts cascade)
    """
    server_repo = Provider.mcp_server_repo()
    deployment_repo = Provider.deployment_repo()

    # Check server exists
    server = await server_repo.get_by_uuid(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    # Check if deployed and unmount from FastAPI
    deployment = await deployment_repo.get_by_server_id(server_id)
    if deployment and deployment.status == DeploymentStatus.ACTIVE.value:
        # Unmount from FastAPI app
        unregister_mcp_app(request.app, server_id)

    # Delete deployment record if exists
    if deployment:
        await deployment_repo.delete(deployment.id)

    # Delete server (cascades to tools, prompts, etc.)
    await server_repo.delete(server_id)

    logger.info(f"Deleted server {server_id}")

    return {
        "status": "deleted",
        "server_id": str(server_id),
    }
