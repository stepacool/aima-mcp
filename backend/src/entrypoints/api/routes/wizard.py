"""Wizard routes for MCP server creation with DB persistence."""

from enum import Enum
from typing import Any
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from loguru import logger
from pydantic import BaseModel

from core.services.tier_service import FREE_TIER_MAX_TOOLS
from core.services.wizard_steps_services import WizardStepsService
from infrastructure.models.mcp_server import MCPServerSetupStatus
from infrastructure.repositories.repo_provider import Provider

router = APIRouter()


class StartWizardRequest(BaseModel):
    customer_id: UUID
    description: str
    technical_details: list[str] | None = None


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
    code: str | None


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


class WizardStep(str, Enum):
    TOOLS = "tools"
    ENV_VARS = "env_vars"
    AUTH = "auth"
    DEPLOY = "deploy"
    COMPLETE = "complete"


class WizardStateResponse(BaseModel):
    server_id: UUID
    customer_id: UUID
    setup_status: MCPServerSetupStatus
    wizard_step: str  # Mapped step for frontend (actions, env_vars, auth, etc.)
    processing_status: str  # idle, processing, or failed
    processing_error: str | None
    description: str | None
    tools: list[ToolResponse]
    selected_tool_ids: list[UUID]  # UUIDs of selected/remaining tools
    env_vars: list[EnvVarResponse]
    auth_type: str
    auth_config: dict[str, Any] | None
    bearer_token: str | None
    server_url: str | None
    has_auth: bool
    created_at: str
    updated_at: str


def map_setup_status_to_wizard_step(setup_status: MCPServerSetupStatus) -> WizardStep:
    """Map backend setup_status to frontend wizard_step."""
    mapping = {
        MCPServerSetupStatus.tools_generating: WizardStep.TOOLS,
        MCPServerSetupStatus.tools_selection: WizardStep.TOOLS,
        MCPServerSetupStatus.env_vars_generating: WizardStep.ENV_VARS,
        MCPServerSetupStatus.env_vars_setup: WizardStep.ENV_VARS,
        MCPServerSetupStatus.auth_selection: WizardStep.AUTH,
        MCPServerSetupStatus.code_generating: WizardStep.DEPLOY,
        MCPServerSetupStatus.code_gen: WizardStep.DEPLOY,
        MCPServerSetupStatus.deployment_selection: WizardStep.DEPLOY,
        MCPServerSetupStatus.ready: WizardStep.COMPLETE,
    }
    return mapping.get(setup_status, WizardStep.TOOLS)


def get_processing_status(setup_status: MCPServerSetupStatus) -> str:
    """Determine processing status from setup_status."""
    generating_states = {
        MCPServerSetupStatus.tools_generating,
        MCPServerSetupStatus.env_vars_generating,
        MCPServerSetupStatus.code_generating,
    }
    if setup_status in generating_states:
        return "processing"
    return "idle"


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
        # Prepare meta with technical details if provided
        meta = {}
        if request.technical_details:
            meta["technical_details"] = request.technical_details

        server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name=f"Server-{request.customer_id}",
                customer_id=request.customer_id,
                description=request.description,
                meta=meta if meta else None,
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
    background_tasks: BackgroundTasks,
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
            setup_status_override=MCPServerSetupStatus.env_vars_generating,
        )
        background_tasks.add_task(
            service.step_2a_suggest_environment_variables_for_mcp_server,
            mcp_server_id=server_id,
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
            code=tool.code,
        )
        for tool in tools
    ]


# TODO: right now suggest is never called on FE, I'll put it into submit tools
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


@router.post("/{server_id}/generate-code")
async def generate_code(
    server_id: UUID,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    """
    Step 4: Generate code for the tools and environment variables.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")
    try:
        service = get_wizard_service()
        background_tasks.add_task(
            service.step_4_generate_code_for_tools_and_env_vars,
            mcp_server_id=server_id,
        )

        return {
            "server_id": str(server_id),
            "status": "code_generated",
        }
    except Exception as e:
        logger.error(f"Error generating code: {e}")
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

    setup_status_value = server.setup_status.value
    wizard_step = map_setup_status_to_wizard_step(setup_status_value)
    processing_status = get_processing_status(setup_status_value)

    # Get processing error from meta if any
    processing_error = server.processing_error

    return WizardStateResponse(
        server_id=server_id,
        customer_id=server.customer_id,
        setup_status=setup_status_value,
        wizard_step=wizard_step,
        processing_status=processing_status,
        processing_error=processing_error,
        description=server.description,
        tools=[
            ToolResponse(
                id=tool.id,
                name=tool.name,
                description=tool.description,
                parameters=tool.parameters_schema,
                code=tool.code,
            )
            for tool in tools
        ],
        selected_tool_ids=[tool.id for tool in tools],
        env_vars=[
            EnvVarResponse(
                id=var.id,
                name=var.name,
                description=var.description,
                value=var.value,
            )
            for var in env_vars
        ],
        auth_type=server.auth_type,
        auth_config=server.auth_config,
        bearer_token=api_key.key if api_key else None,
        server_url=None,  # Will be set when deployed
        has_auth=api_key is not None,
        created_at=server.created_at.isoformat() if server.created_at else "",
        updated_at=server.updated_at.isoformat() if server.updated_at else "",
    )


class DeployToSharedResponse(BaseModel):
    server_url: str
    step: str = "complete"


@router.post("/{server_id}/deploy", response_model=DeployToSharedResponse)
async def deploy_to_shared(server_id: UUID, request: Request) -> DeployToSharedResponse:
    """
    Step 5: Deploy MCP server to shared runtime.

    Validates tools, compiles them, registers with shared runtime,
    and creates deployment record.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    # Validate server is in correct state (code_gen or deployment_selection)
    valid_states = {
        MCPServerSetupStatus.code_gen,
        MCPServerSetupStatus.deployment_selection,
    }
    if server.setup_status.value not in valid_states:
        raise HTTPException(
            status_code=400,
            detail=f"Server must be in code_gen or deployment_selection state. "
            f"Current state: {server.setup_status.value}",
        )

    # Get app and stack from request
    app = request.app
    stack = getattr(app.state, "mcp_stack", None)
    if not stack:
        logger.error("MCP stack not initialized in app state")
        raise HTTPException(status_code=500, detail="MCP runtime not initialized")

    try:
        service = get_wizard_service()
        endpoint_url = await service.step_5_deploy_to_shared(server_id, app, stack)

        return DeployToSharedResponse(server_url=endpoint_url, step="complete")
    except ValueError as e:
        logger.error(f"Deployment failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Deployment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
