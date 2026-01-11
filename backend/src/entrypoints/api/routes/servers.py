from uuid import UUID

from fastapi import APIRouter, HTTPException
from loguru import logger

from entrypoints.api.routes.chat import get_session
from entrypoints.api.schemas import DeployRequest, DeployResponse, GenerateCodeResponse
from services.artifact_generator import DeploymentTarget, get_artifact_generator
from services.chat_service import MCPDesign
from services.mcp_generator import get_mcp_generator

router = APIRouter()

# In-memory storage for generated code
_generated_code: dict[UUID, str] = {}


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
    """Generate deployment artifacts."""
    session = get_session(request.session_id)

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
