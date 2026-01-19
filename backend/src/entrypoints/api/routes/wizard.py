"""Wizard routes for MCP server creation with DB persistence."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, BackgroundTasks
from loguru import logger
from pydantic import BaseModel

from core.services.tier_service import FREE_TIER_MAX_TOOLS
from core.services.wizard_service import WizardService
from infrastructure.repositories.repo_provider import Provider

router = APIRouter()


class StartWizardRequest(BaseModel):
    customer_id: UUID
    description: str
    openapi_schema: str | None = None


class StartWizardResponse(BaseModel):
    server_id: UUID
    server_name: str
    description: str
    status: str = "processing"
    actions: list[dict[str, Any]] = []


class RefineActionsRequest(BaseModel):
    feedback: str
    description: str | None = None


class SelectToolsRequest(BaseModel):
    selected_tool_names: list[str]


class ConfigureAuthRequest(BaseModel):
    auth_type: str  # "none", "oauth", "ephemeral"
    auth_config: dict[str, Any] | None = None


def get_wizard_service() -> WizardService:
    """Get wizard service with repos from provider."""
    return WizardService(
        server_repo=Provider.mcp_server_repo(),
        tool_repo=Provider.mcp_tool_repo(),
    )


@router.post("/start", response_model=StartWizardResponse)
async def start_wizard(
    request: StartWizardRequest,
    background_tasks: BackgroundTasks,
) -> StartWizardResponse:
    """
    Step 1: Start wizard - describe system.

    Creates draft server and triggers background generation of actions.
    Returns immediately with status="processing".
    """
    service = get_wizard_service()

    try:
        # Create draft server immediately
        result = await service.create_server_draft(
            customer_id=request.customer_id,
            description=request.description,
            openapi_schema=request.openapi_schema,
        )

        # Schedule heavy LLM work in background
        background_tasks.add_task(
            service.process_wizard_start,
            server_id=result.server_id,
            description=request.description,
            openapi_schema=request.openapi_schema,
        )

        return StartWizardResponse(
            server_id=result.server_id,
            server_name=result.server_name,
            description=result.description,
            status="processing",
            actions=[],
        )
    except Exception as e:
        logger.error(f"Error starting wizard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/refine")
async def refine_actions(server_id: UUID, request: RefineActionsRequest) -> dict:
    """
    Step 2: Refine actions based on user feedback.

    Updates tools in the database and generates code for each.
    """
    service = get_wizard_service()

    try:
        actions = await service.refine_actions(
            server_id=server_id,
            feedback=request.feedback,
            description=request.description,
        )

        return {
            "server_id": str(server_id),
            "actions": [
                {
                    "name": a.name,
                    "description": a.description,
                    "parameters": a.parameters,
                    "auth_required": a.auth_required,
                }
                for a in actions
            ],
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error refining actions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/tools/select")
async def select_tools(server_id: UUID, request: SelectToolsRequest) -> dict:
    """
    Step 2b: Select which tools to keep.

    Validates free tier limit (max 3 tools) and removes unselected tools.
    Transitions to AUTH step (handled in service layer).
    """
    # Validate free tier limit
    if len(request.selected_tool_names) > FREE_TIER_MAX_TOOLS:
        raise HTTPException(
            status_code=400,
            detail=f"Free tier allows max {FREE_TIER_MAX_TOOLS} tools. "
            f"You selected {len(request.selected_tool_names)}. "
            "Upgrade to paid tier for more.",
        )

    service = get_wizard_service()

    try:
        # confirm_actions now handles the AUTH transition internally
        await service.confirm_actions(server_id, request.selected_tool_names)

        return {
            "server_id": str(server_id),
            "status": "confirmed",
            "tools_count": len(request.selected_tool_names),
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error selecting tools: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/generate-code")
async def generate_tool_codes(server_id: UUID) -> dict:
    """
    Generate code for all tools in the server.

    Call this before activating if tools don't have code yet.
    """
    service = get_wizard_service()

    try:
        tools = await service.generate_tool_codes(server_id)

        return {
            "server_id": str(server_id),
            "tools": [
                {
                    "id": str(t.id),
                    "name": t.name,
                    "description": t.description,
                    "code": t.code or "",
                }
                for t in tools
            ],
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating code: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/auth")
async def configure_auth(server_id: UUID, request: ConfigureAuthRequest) -> dict:
    """
    Step 3: Configure authentication.

    Updates the server's auth configuration in the database.
    Transitions to DEPLOY step (handled in service layer).
    """
    service = get_wizard_service()

    try:
        # configure_auth now handles the DEPLOY transition internally
        await service.configure_auth(
            server_id=server_id,
            auth_type=request.auth_type,
            auth_config=request.auth_config,
        )

        return {
            "server_id": str(server_id),
            "auth_type": request.auth_type,
            "status": "configured",
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error configuring auth: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{server_id}")
async def get_server_state(server_id: UUID) -> dict:
    """Get current state of a server for the wizard UI."""
    service = get_wizard_service()

    try:
        return await service.get_server_state(server_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting server state: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/retry")
async def retry_tool_generation(
    server_id: UUID,
    background_tasks: BackgroundTasks,
) -> dict:
    """
    Retry tool generation after a failure.

    Resets processing status and re-triggers the background generation task.
    Only works if the server is in a FAILED processing state.
    """
    service = get_wizard_service()

    try:
        # Reset state and get info for background task
        result = await service.retry_tool_generation(server_id)

        # Schedule the background task again
        background_tasks.add_task(
            service.process_wizard_start,
            server_id=server_id,
            description=result["description"],
            openapi_schema=result.get("openapi_schema"),
        )

        return {
            "server_id": str(server_id),
            "status": "retrying",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error retrying tool generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
