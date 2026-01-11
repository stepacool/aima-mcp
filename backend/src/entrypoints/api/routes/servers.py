from uuid import UUID

from fastapi import APIRouter, HTTPException
from loguru import logger

from entrypoints.api.routes.chat import get_session
from entrypoints.api.schemas import DeployRequest, DeployResponse, GenerateCodeResponse
from services.artifact_generator import DeploymentTarget, get_artifact_generator
from services.chat_service import MCPDesign
from services.mcp_generator import get_mcp_generator

router = APIRouter()

# In-memory storage for generated servers (replace with database in production)
_generated_servers: dict[UUID, dict] = {}


@router.post("/generate/{session_id}", response_model=GenerateCodeResponse)
async def generate_server_code(session_id: UUID) -> GenerateCodeResponse:
    """Generate MCP server code from a confirmed design."""
    session = get_session(session_id)

    if not session.design:
        raise HTTPException(
            status_code=400,
            detail="No design available. Complete the chat first.",
        )

    generator = get_mcp_generator()

    try:
        design = MCPDesign(**session.design)
        code = await generator.generate_full_server(design)

        _generated_servers[session_id] = {
            "design": session.design,
            "code": code,
        }

        return GenerateCodeResponse(
            code=code,
            server_id=session_id,
        )
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/code/{session_id}")
async def get_server_code(session_id: UUID) -> dict:
    """Get the generated code for a server."""
    if session_id not in _generated_servers:
        raise HTTPException(
            status_code=404,
            detail="No generated code found. Generate code first.",
        )

    return _generated_servers[session_id]


@router.post("/deploy", response_model=DeployResponse)
async def deploy_server(request: DeployRequest) -> DeployResponse:
    """Generate deployment artifacts for an MCP server."""
    if request.server_id not in _generated_servers:
        raise HTTPException(
            status_code=404,
            detail="No generated code found. Generate code first.",
        )

    server_data = _generated_servers[request.server_id]
    design = server_data["design"]
    code = server_data["code"]

    try:
        target = DeploymentTarget(request.target)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid target. Valid options: {[t.value for t in DeploymentTarget]}",
        )

    artifact_gen = get_artifact_generator()

    try:
        artifact = artifact_gen.generate(
            server_code=code,
            server_name=design.get("server_name", "mcp_server"),
            target=target,
        )

        return DeployResponse(
            server_id=request.server_id,
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
