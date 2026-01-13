"""Wizard routes for MCP server creation with DB persistence."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException
from loguru import logger
from pydantic import BaseModel

from core.services.wizard_service import WizardService
from infrastructure.repositories.repo_provider import Provider

router = APIRouter()


class StartWizardRequest(BaseModel):
    customer_id: str
    description: str


class StartWizardResponse(BaseModel):
    server_id: UUID
    server_name: str
    description: str
    actions: list[dict[str, Any]]


class RefineActionsRequest(BaseModel):
    feedback: str


class ConfirmActionsRequest(BaseModel):
    selected_actions: list[str]


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
async def start_wizard(request: StartWizardRequest) -> StartWizardResponse:
    """
    Step 1: Start wizard - describe system and get suggested actions.

    Creates a new MCP server in the database and suggests actions.
    """
    service = get_wizard_service()

    try:
        result = await service.start_wizard(
            customer_id=request.customer_id,
            description=request.description,
        )

        return StartWizardResponse(
            server_id=result.server_id,
            server_name=result.server_name,
            description=result.description,
            actions=[
                {
                    "name": a.name,
                    "description": a.description,
                    "parameters": a.parameters,
                    "auth_required": a.auth_required,
                }
                for a in result.actions
            ],
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


@router.post("/{server_id}/actions/confirm")
async def confirm_actions(server_id: UUID, request: ConfirmActionsRequest) -> dict:
    """
    Step 2b: Confirm selected actions.

    Updates the server to keep only the selected actions.
    """
    service = get_wizard_service()

    try:
        # In a real impl, we would call service.update_actions(server_id, request.selected_actions)
        # For now, we'll assume the service has a method or we'll just implement a simple filter if service supports it
        # Since I cannot see WizardService method, I will assume I need to implement it or use what's available.
        # Let's check WizardService if possible. But assuming I can't check it easily right now,
        # I will mock the behavior or implement a basic repo update here if service doesn't have it.
        # Better: use repo directly if service is missing method.
        # But `get_wizard_service` returns a service.
        # I'll just return success for now if I can't update, OR better, I'll update the `wizard_service` signature in my thought process.
        # Wait, I don't have access to modify `wizard_service.py` yet (I listed `core` but didn't view it).
        # I should view `wizard_service.py` to see if I can add a method there.
        # For now I will just add the endpoint signature and logic placeholder.
        # Actually I should do it properly. I'll read `wizard_service.py` next.
        # For this tool call, I'll insert the endpoint.

        # NOTE: I am writing this assuming `update_actions` exists or I'll add it.
        # Let's blindly add the call and I'll fix the service next.
        await service.confirm_actions(server_id, request.selected_actions)

        return {
            "server_id": str(server_id),
            "status": "confirmed",
            "action_count": len(request.selected_actions),
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error confirming actions: {e}")
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
                    "has_code": bool(t.code),
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
    """
    service = get_wizard_service()

    try:
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
