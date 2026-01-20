"""Wizard routes for MCP server creation with DB persistence."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, HTTPException
from loguru import logger
from pydantic import BaseModel

from core.services.tier_service import FREE_TIER_MAX_TOOLS
from core.services.wizard_steps_services import WizardStepsService
from infrastructure.repositories.repo_provider import Provider

router = APIRouter()


class StartWizardRequest(BaseModel):
    customer_id: UUID
    description: str


class StartWizardResponse(BaseModel):
    server_id: UUID
    status: str = "processing"


class RefineToolsRequest(BaseModel):
    feedback: str
    tool_ids: list[UUID] | None = None


class SubmitToolsRequest(BaseModel):
    selected_tool_ids: list[UUID]


class ToolResponse(BaseModel):
    id: UUID
    name: str
    description: str
    parameters: list[dict[str, Any]]


class RefineEnvVarsRequest(BaseModel):
    feedback: str


class SubmitEnvVarsRequest(BaseModel):
    values: dict[UUID, str]


class EnvVarResponse(BaseModel):
    id: UUID
    name: str
    description: str
    value: str | None


class AuthResponse(BaseModel):
    server_id: UUID
    bearer_token: str


class WizardStateResponse(BaseModel):
    server_id: UUID
    setup_status: str
    tools: list[ToolResponse]
    env_vars: list[EnvVarResponse]
    has_auth: bool


def get_wizard_service() -> WizardStepsService:
    """Get wizard steps service."""
    return WizardStepsService()


@router.post("/start", response_model=StartWizardResponse)
async def start_wizard(
    request: StartWizardRequest,
    background_tasks: BackgroundTasks,
) -> StartWizardResponse:
    """
    Step 1: Start wizard - describe system.

    Creates draft server and triggers background generation of tools.
    Returns immediately with status="processing".
    """
    from infrastructure.repositories.mcp_server import MCPServerCreate

    try:
        server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name=f"Server-{request.customer_id}",
                customer_id=request.customer_id,
                description=request.description,
            )
        )

        service = get_wizard_service()
        background_tasks.add_task(
            service.step_1a_suggest_tools_for_mcp_server,
            description=request.description,
            mcp_server_id=server.id,
        )

        return StartWizardResponse(
            server_id=server.id,
            status="processing",
        )
    except Exception as e:
        logger.error(f"Error starting wizard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/tools/refine")
async def refine_tools(
    server_id: UUID,
    request: RefineToolsRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    """
    Step 1b: Refine tools based on user feedback.

    Triggers LLM refinement in background and returns status.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    service = get_wizard_service()
    background_tasks.add_task(
        service.step_1b_refine_suggested_tools,
        mcp_server_id=server_id,
        feedback=request.feedback,
        tool_ids_for_refinement=request.tool_ids,
    )

    return {
        "server_id": str(server_id),
        "status": "refining",
    }


@router.post("/{server_id}/tools/submit")
async def submit_tools(
    server_id: UUID,
    request: SubmitToolsRequest,
) -> dict[str, Any]:
    """
    Step 1c: Submit selected tools.

    Validates free tier limit and removes unselected tools.
    Transitions to env_vars step.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    if len(request.selected_tool_ids) > FREE_TIER_MAX_TOOLS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Free tier allows max {FREE_TIER_MAX_TOOLS} tools. "
                f"You selected {len(request.selected_tool_ids)}. "
                "Upgrade to paid tier for more."
            ),
        )

    try:
        service = get_wizard_service()
        await service.step_1c_submit_selected_tools(
            mcp_server_id=server_id,
            selected_tool_ids=request.selected_tool_ids,
        )

        return {
            "server_id": str(server_id),
            "status": "tools_submitted",
            "tools_count": len(request.selected_tool_ids),
        }
    except Exception as e:
        logger.error(f"Error submitting tools: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{server_id}/tools", response_model=list[ToolResponse])
async def get_tools(server_id: UUID) -> list[ToolResponse]:
    """Get current tools for a server."""
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    tools = await Provider.mcp_tool_repo().get_tools_for_server(server_id)
    return [
        ToolResponse(
            id=tool.id,
            name=tool.name,
            description=tool.description,
            parameters=tool.parameters_schema,
        )
        for tool in tools
    ]


@router.post("/{server_id}/env-vars/suggest")
async def suggest_env_vars(
    server_id: UUID,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    """
    Step 2a: Suggest environment variables.

    Triggers LLM suggestion in background.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    service = get_wizard_service()
    background_tasks.add_task(
        service.step_2a_suggest_environment_variables_for_mcp_server,
        mcp_server_id=server_id,
    )

    return {
        "server_id": str(server_id),
        "status": "suggesting",
    }


@router.post("/{server_id}/env-vars/refine")
async def refine_env_vars(
    server_id: UUID,
    request: RefineEnvVarsRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    """
    Step 2b: Refine environment variables based on feedback.

    Triggers LLM refinement in background.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    service = get_wizard_service()
    background_tasks.add_task(
        service.step_2b_refine_suggested_environment_variables_for_mcp_server,
        mcp_server_id=server_id,
        feedback=request.feedback,
    )

    return {
        "server_id": str(server_id),
        "status": "refining",
    }


@router.post("/{server_id}/env-vars/submit")
async def submit_env_vars(
    server_id: UUID,
    request: SubmitEnvVarsRequest,
) -> dict[str, Any]:
    """
    Step 2c: Submit environment variable values.

    Saves the values and transitions to auth step.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    try:
        service = get_wizard_service()
        await service.step_2c_submit_variables(
            mcp_server_id=server_id,
            values=request.values,
        )

        return {
            "server_id": str(server_id),
            "status": "env_vars_submitted",
        }
    except Exception as e:
        logger.error(f"Error submitting env vars: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{server_id}/env-vars", response_model=list[EnvVarResponse])
async def get_env_vars(server_id: UUID) -> list[EnvVarResponse]:
    """Get current environment variables for a server."""
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    env_vars = await Provider.environment_variable_repo().get_vars_for_server(server_id)
    return [
        EnvVarResponse(
            id=var.id,
            name=var.name,
            description=var.description,
            value=var.value,
        )
        for var in env_vars
    ]


@router.post("/{server_id}/auth", response_model=AuthResponse)
async def set_auth(server_id: UUID) -> AuthResponse:
    """
    Step 3: Set header authentication.

    Generates a Bearer token and configures the server for auth.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    try:
        service = get_wizard_service()
        token = await service.step_3_set_header_auth(mcp_server_id=server_id)

        return AuthResponse(
            server_id=server_id,
            bearer_token=token,
        )
    except Exception as e:
        logger.error(f"Error setting auth: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{server_id}/state", response_model=WizardStateResponse)
async def get_wizard_state(server_id: UUID) -> WizardStateResponse:
    """Get current state of a server for the wizard UI."""
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    tools = await Provider.mcp_tool_repo().get_tools_for_server(server_id)
    env_vars = await Provider.environment_variable_repo().get_vars_for_server(server_id)
    api_key = await Provider.api_key_repo().get_by_server_id(server_id)

    return WizardStateResponse(
        server_id=server_id,
        setup_status=server.setup_status.value,
        tools=[
            ToolResponse(
                id=tool.id,
                name=tool.name,
                description=tool.description,
                parameters=tool.parameters_schema,
            )
            for tool in tools
        ],
        env_vars=[
            EnvVarResponse(
                id=var.id,
                name=var.name,
                description=var.description,
                value=var.value,
            )
            for var in env_vars
        ],
        has_auth=api_key is not None,
    )
