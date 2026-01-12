"""Server routes for activation and deployment."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Request
from loguru import logger
from pydantic import BaseModel

from core.services.artifact_generator import DeploymentTarget, get_artifact_generator
from core.services.tier_service import (
    CURATED_LIBRARIES,
    FREE_TIER_MAX_TOOLS,
    CodeValidator,
    Tier,
    get_tier_limits,
)
from core.services.tool_loader import get_tool_loader
from core.services.mcp_generator import get_mcp_generator
from core.services.chat_service import MCPDesign
from entrypoints.api.routes.chat import get_session
from entrypoints.mcp.shared_runtime import register_new_customer_app
from infrastructure.models.mcp_server import MCPServerStatus
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
    server_id: UUID
    target: str = "standalone"


class DeployResponse(BaseModel):
    server_id: UUID
    target: str
    files: dict[str, str]
    instructions: str


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


@router.post("/{server_id}/activate", response_model=ActivateResponse)
async def activate_server(server_id: UUID, request: Request) -> ActivateResponse:
    """
    Activate an MCP server on the shared runtime (free tier).

    Loads tools from DB and registers with the FastAPI app.
    """
    server_repo = Provider.mcp_server_repo()

    # Load server with tools from DB
    server = await server_repo.get_with_tools(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

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
                f"Tool {tool.name} has no code. Generate code first via /wizard/{server_id}/generate-code",
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
    register_new_customer_app(app, server_id, compiled_tools)

    # Update server status to ACTIVE
    await server_repo.update_status(server_id, MCPServerStatus.ACTIVE)

    return ActivateResponse(
        server_id=server_id,
        status="active",
        mcp_endpoint=f"/mcp/{server_id}",
        tools_count=len(compiled_tools),
    )


@router.post("/{server_id}/deploy", response_model=DeployResponse)
async def deploy_server(server_id: UUID, request: DeployRequest) -> DeployResponse:
    """
    Generate deployment artifacts (paid tier only).

    Creates standalone, Modal, Vercel, or Cloudflare deployment packages.
    """
    server_repo = Provider.mcp_server_repo()

    server = await server_repo.get_with_tools(server_id)
    if not server:
        raise HTTPException(404, f"Server {server_id} not found")

    # Check tier
    if server.tier == "free":
        raise HTTPException(
            403,
            "Deployment requires paid tier. Use /activate for free tier shared runtime.",
        )

    # Generate full server code from tools
    tool_code_parts = []
    for tool in server.tools:
        if tool.code:
            # Wrap tool code with decorator
            tool_code_parts.append(f'''
@mcp.tool()
{tool.code}
''')

    full_server_code = f'''"""Generated MCP Server: {server.name}"""

from fastmcp import FastMCP

mcp = FastMCP("{server.name}")

{"".join(tool_code_parts)}

if __name__ == "__main__":
    mcp.run()
'''

    try:
        target = DeploymentTarget(request.target)
    except ValueError:
        valid = [t.value for t in DeploymentTarget]
        raise HTTPException(400, f"Invalid target. Valid: {valid}")

    artifact_gen = get_artifact_generator()

    try:
        artifact = artifact_gen.generate(
            server_code=full_server_code,
            server_name=server.name or "mcp_server",
            target=target,
        )

        # Update server status
        await server_repo.update_status(server_id, MCPServerStatus.DEPLOYED)

        return DeployResponse(
            server_id=server_id,
            target=artifact.target.value,
            files=artifact.files,
            instructions=artifact.instructions,
        )
    except Exception as e:
        logger.error(f"Deployment error: {e}")
        raise HTTPException(500, str(e))


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
            for t in DeploymentTarget
        ]
    }


def _get_target_desc(target: DeploymentTarget) -> str:
    descriptions = {
        DeploymentTarget.STANDALONE: "Standalone Python package for local execution",
        DeploymentTarget.MODAL: "Deploy to Modal for serverless execution",
        DeploymentTarget.CLOUDFLARE: "Deploy to Cloudflare Workers (beta)",
        DeploymentTarget.VERCEL: "Deploy to Vercel serverless functions",
    }
    return descriptions.get(target, "")


# =============================================================================
# Legacy endpoints for backward compatibility with existing frontend
# =============================================================================


class ToolCode(BaseModel):
    name: str
    description: str
    code: str


class GenerateCodeResponse(BaseModel):
    session_id: UUID
    code: str  # Full server code (legacy)
    tools: list[ToolCode] = []  # Per-tool code


class LegacyActivateResponse(BaseModel):
    session_id: UUID
    status: str
    mcp_endpoint: str
    tools_count: int
    customer_id: str


class LegacyDeployRequest(BaseModel):
    session_id: UUID
    target: str = "standalone"


@router.post("/generate/{session_id}", response_model=GenerateCodeResponse)
async def generate_server_code_legacy(session_id: UUID) -> GenerateCodeResponse:
    """Generate MCP server code from the session's design (legacy endpoint)."""
    session = get_session(session_id)

    if not session.actions:
        raise HTTPException(status_code=400, detail="No actions defined")

    generator = get_mcp_generator()

    try:
        design = MCPDesign(
            server_name=session.server_name,
            description=session.server_description,
            actions=session.actions,
            auth_type=session.auth_type,
            auth_config=session.auth_config,
        )

        # Generate per-tool code
        tools_code = []
        for action in session.actions:
            tool_code = await generator.generate_action_code(action, design.auth_type)
            tools_code.append(ToolCode(
                name=action.name,
                description=action.description,
                code=tool_code,
            ))

        # Also generate full server code for backward compatibility
        full_code = await generator.generate_full_server(design)
        session.generated_code = full_code

        return GenerateCodeResponse(
            session_id=session_id,
            code=full_code,
            tools=tools_code,
        )
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate/{session_id}")
async def validate_tools_legacy(session_id: UUID) -> dict:
    """Validate tool code for free tier (legacy endpoint)."""
    session = get_session(session_id)

    if not session.actions:
        raise HTTPException(400, "No actions defined")

    if len(session.actions) > FREE_TIER_MAX_TOOLS:
        return {
            "valid": False,
            "errors": [
                f"Free tier allows max {FREE_TIER_MAX_TOOLS} tools. You have {len(session.actions)}."
            ],
        }

    if not session.generated_code:
        # Generate code first
        generator = get_mcp_generator()
        design = MCPDesign(
            server_name=session.server_name,
            description=session.server_description,
            actions=session.actions,
            auth_type=session.auth_type,
            auth_config=session.auth_config,
        )
        session.generated_code = await generator.generate_full_server(design)

    validator = CodeValidator(Tier.FREE)
    errors = validator.validate(session.generated_code)

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "tools_count": len(session.actions),
    }


@router.post("/activate/{session_id}", response_model=LegacyActivateResponse)
async def activate_on_shared_runtime_legacy(
    session_id: UUID, request: Request
) -> LegacyActivateResponse:
    """Activate tools on shared runtime (legacy endpoint using session)."""
    session = get_session(session_id)

    if not session.actions:
        raise HTTPException(400, "No actions defined")

    if len(session.actions) > FREE_TIER_MAX_TOOLS:
        raise HTTPException(
            400,
            f"Free tier allows max {FREE_TIER_MAX_TOOLS} tools. Upgrade to paid for more.",
        )

    # Generate code if not already done
    if not session.generated_code:
        generator = get_mcp_generator()
        design = MCPDesign(
            server_name=session.server_name,
            description=session.server_description,
            actions=session.actions,
            auth_type=session.auth_type,
            auth_config=session.auth_config,
        )
        session.generated_code = await generator.generate_full_server(design)

    # Validate code
    validator = CodeValidator(Tier.FREE)
    errors = validator.validate(session.generated_code)
    if errors:
        raise HTTPException(400, f"Code validation failed: {errors}")

    # Compile tools
    tool_loader = get_tool_loader()
    compiled_tools = []

    for i, action in enumerate(session.actions):
        try:
            # Generate simple tool code
            tool_code = f'return {{"status": "executed", "tool": "{action.name}"}}'

            compiled = tool_loader.compile_tool(
                tool_id=f"{session_id}_{i}",
                name=action.name,
                description=action.description,
                parameters=action.parameters,
                code=tool_code,
                customer_id=session_id,
                tier=Tier.FREE,
            )
            compiled_tools.append(compiled)
        except Exception as e:
            raise HTTPException(400, f"Failed to compile {action.name}: {e}")

    # Register the MCP app
    app = request.app
    register_new_customer_app(app, session_id, compiled_tools)

    return LegacyActivateResponse(
        session_id=session_id,
        status="active",
        mcp_endpoint=f"/mcp/{session_id}",
        tools_count=len(compiled_tools),
        customer_id=str(session_id),
    )


@router.post("/deploy", response_model=DeployResponse)
async def deploy_server_legacy(request: LegacyDeployRequest) -> DeployResponse:
    """Generate deployment artifacts (legacy endpoint using session)."""
    session = get_session(request.session_id)

    # Check tier
    if session.tier == Tier.FREE:
        raise HTTPException(
            403,
            "Deployment requires paid tier. Use /activate for free tier shared runtime.",
        )

    if not session.generated_code:
        raise HTTPException(
            status_code=404, detail="No generated code. Generate first."
        )

    try:
        target = DeploymentTarget(request.target)
    except ValueError:
        valid = [t.value for t in DeploymentTarget]
        raise HTTPException(status_code=400, detail=f"Invalid target. Valid: {valid}")

    artifact_gen = get_artifact_generator()

    try:
        artifact = artifact_gen.generate(
            server_code=session.generated_code,
            server_name=session.server_name or "mcp_server",
            target=target,
        )

        return DeployResponse(
            server_id=request.session_id,
            target=artifact.target.value,
            files=artifact.files,
            instructions=artifact.instructions,
        )
    except Exception as e:
        logger.error(f"Deployment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
