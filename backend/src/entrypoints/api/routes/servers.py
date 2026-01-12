from uuid import UUID

from fastapi import APIRouter, HTTPException
from loguru import logger

from entrypoints.api.routes.chat import get_session
from entrypoints.api.schemas import (
    ActivateResponse,
    DeployRequest,
    DeployResponse,
    GenerateCodeResponse,
    TierInfoResponse,
)
from entrypoints.mcp.shared_runtime import register_customer_tools
from core.services.artifact_generator import DeploymentTarget, get_artifact_generator
from core.services import MCPDesign
from core.services.mcp_generator import get_mcp_generator
from core.services import (
    CURATED_LIBRARIES,
    FREE_TIER_MAX_TOOLS,
    CodeValidator,
    Tier,
    get_tier_limits,
)
from core.services.tool_loader import ToolCompilationError, get_tool_loader

router = APIRouter()

# In-memory storage for generated code
_generated_code: dict[UUID, str] = {}


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


@router.post("/validate/{session_id}")
async def validate_tools(session_id: UUID) -> dict:
    """Validate tool code for free tier (curated libraries only)."""
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


@router.post("/activate/{session_id}", response_model=ActivateResponse)
async def activate_on_shared_runtime(session_id: UUID) -> ActivateResponse:
    """
    Activate tools on the shared MCP runtime (free tier).

    This registers the customer's tools for dynamic injection.
    """
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

    # Create tool specs for registration
    # Use session_id as customer_id for now (in production, use real customer ID)
    customer_id = session_id

    tool_specs = []
    for i, action in enumerate(session.actions):
        # Generate individual tool code
        loader = get_tool_loader()
        try:
            # Simple code extraction - in production, generate per-tool
            tool_code = f"""
# Tool: {action.name}
return {{"status": "executed", "tool": "{action.name}"}}
"""
            tool_specs.append({
                "id": f"{session_id}_{i}",
                "name": action.name,
                "description": action.description,
                "parameters": action.parameters,
                "code": tool_code,
                "tier": "free",
            })
        except ToolCompilationError as e:
            raise HTTPException(400, f"Failed to compile {action.name}: {e}")

    # Register with shared runtime
    register_customer_tools(customer_id, tool_specs)

    return ActivateResponse(
        session_id=session_id,
        status="active",
        mcp_endpoint=f"http://localhost:8001/mcp",
        tools_count=len(tool_specs),
        customer_id=str(customer_id),
    )


@router.post("/generate/{session_id}", response_model=GenerateCodeResponse)
async def generate_server_code(session_id: UUID) -> GenerateCodeResponse:
    """Generate MCP server code from the session's design."""
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

        code = await generator.generate_full_server(design)
        session.generated_code = code
        _generated_code[session_id] = code

        return GenerateCodeResponse(session_id=session_id, code=code)
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/code/{session_id}")
async def get_server_code(session_id: UUID) -> dict:
    """Get the generated code for a session."""
    session = get_session(session_id)

    if not session.generated_code:
        raise HTTPException(
            status_code=404, detail="No generated code. Generate first."
        )

    return {
        "session_id": session_id,
        "code": session.generated_code,
        "server_name": session.server_name,
    }


@router.post("/deploy", response_model=DeployResponse)
async def deploy_server(request: DeployRequest) -> DeployResponse:
    """Generate deployment artifacts (paid tier only)."""
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
            session_id=request.session_id,
            target=artifact.target.value,
            files=artifact.files,
            instructions=artifact.instructions,
        )
    except Exception as e:
        logger.error(f"Deployment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/targets")
async def list_deployment_targets() -> dict:
    """List available deployment targets."""
    return {
        "targets": [
            {"id": t.value, "name": t.value.title(), "description": _get_target_desc(t)}
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
