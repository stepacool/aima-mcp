"""Wizard routes for MCP server creation with DB persistence."""

from enum import Enum
from typing import Any
from uuid import UUID

from core.services.tier_service import FREE_TIER_MAX_TOOLS
from core.services.wizard_steps_services import WizardStepsService, openai_client
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from fastapi.responses import StreamingResponse
from infrastructure.models.mcp_server import MCPServerSetupStatus
from infrastructure.repositories.mcp_server import MCPServerCreate, MCPServerUpdate
from infrastructure.repositories.repo_provider import Provider
from loguru import logger
from pydantic import BaseModel
from settings import settings

from entrypoints.api.deps import (
    require_org_access_to_customer,
    require_org_access_to_server,
    resolve_customer_id,
)

router = APIRouter()


class StartWizardRequest(BaseModel):
    customer_id: UUID | None = None  # Optional when using org API key
    server_id: UUID | None = (
        None  # If provided, use existing server from POST /sessions
    )
    description: str | None = None  # Optional: override description from chat
    technical_details: list[str] | None = (
        None  # Optional: override technical details from chat
    )


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


class DeploymentResponse(BaseModel):
    id: UUID | None
    target: str | None
    status: str | None
    endpoint_url: str | None
    error_message: str | None
    deployed_at: str | None


class AuthResponse(BaseModel):
    server_id: UUID
    bearer_token: str


class WizardStep(str, Enum):
    GATHERING_REQUIREMENTS = "gathering_requirements"
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
    deployment: DeploymentResponse | None
    created_at: str
    updated_at: str


def map_setup_status_to_wizard_step(setup_status: MCPServerSetupStatus) -> WizardStep:
    """Map backend setup_status to frontend wizard_step."""
    mapping = {
        MCPServerSetupStatus.gathering_requirements: WizardStep.GATHERING_REQUIREMENTS,
        MCPServerSetupStatus.tools_generating: WizardStep.TOOLS,
        MCPServerSetupStatus.tools_selection: WizardStep.TOOLS,
        MCPServerSetupStatus.env_vars_generating: WizardStep.ENV_VARS,
        MCPServerSetupStatus.env_vars_setup: WizardStep.ENV_VARS,
        # Auth step is skipped - auth_selection now maps to DEPLOY
        MCPServerSetupStatus.auth_selection: WizardStep.DEPLOY,
        MCPServerSetupStatus.code_generating: WizardStep.DEPLOY,
        MCPServerSetupStatus.code_gen: WizardStep.DEPLOY,
        MCPServerSetupStatus.deployment_selection: WizardStep.DEPLOY,
        MCPServerSetupStatus.ready: WizardStep.COMPLETE,
    }
    return mapping.get(setup_status, WizardStep.GATHERING_REQUIREMENTS)


def get_processing_status(setup_status: MCPServerSetupStatus) -> str:
    """Determine processing status from setup_status."""
    generating_states = {
        MCPServerSetupStatus.gathering_requirements,
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


class CreateSessionRequest(BaseModel):
    customer_id: UUID | None = None  # Optional when using org API key


class CreateSessionResponse(BaseModel):
    server_id: UUID


class WizardChatRequest(BaseModel):
    message: str
    stream: bool = True


class WizardChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    is_ready: bool = False


@router.post("/sessions", response_model=CreateSessionResponse)
async def create_session(
    request: CreateSessionRequest,
    req: Request,
) -> CreateSessionResponse:
    """
    Step 0: Create a new wizard session.

    Creates an MCPServer in gathering_requirements status
    with empty chat history. Used by frontend and CLI.
    """
    customer_id = resolve_customer_id(request.customer_id, req)
    await require_org_access_to_customer(customer_id, req)

    try:
        service = get_wizard_service()
        server = await service.start_wizard_session(customer_id=customer_id)
        return CreateSessionResponse(server_id=server.id)
    except Exception as e:
        logger.error(f"Error creating wizard session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/chat")
async def wizard_chat(
    server_id: UUID,
    request: WizardChatRequest,
    req: Request,
) -> StreamingResponse | WizardChatResponse:
    """
    Step 0: Send a message in the wizard chat.

    If stream=True (default), returns a StreamingResponse with Vercel AI SDK
    compatible text-stream chunks (0:"text"\\n).
    If stream=False, returns a JSON response with the full assistant message.
    """
    await require_org_access_to_server(server_id, req)

    # Validate server is in gathering_requirements status
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")
    if server.setup_status != MCPServerSetupStatus.gathering_requirements:
        raise HTTPException(
            status_code=400,
            detail="Server is not in gathering_requirements state. "
            + f"Current state: {server.setup_status.value}",
        )

    service = get_wizard_service()

    if request.stream:
        return StreamingResponse(  # pyright: ignore[reportUnknownVariableType]
            service.process_wizard_chat_message_stream(
                mcp_server_id=server_id,
                message=request.message,
            ),
            media_type="text/plain; charset=utf-8",
        )
    else:
        try:
            response_text: str = await service.process_wizard_chat_message(
                mcp_server_id=server_id,
                message=request.message,
            )
            return WizardChatResponse(
                content=response_text,
                is_ready=service.is_ready_to_start(response_text),
            )
        except Exception as e:
            logger.error(f"Error in wizard chat: {e}")
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/start", response_model=StartWizardResponse)
async def start_wizard(
    request: StartWizardRequest,
    background_tasks: BackgroundTasks,
    req: Request,
) -> StartWizardResponse:
    """
    Transition from Step 0 to Step 1: Start tool suggestion.

    Requires that the LLM has indicated readiness via READY_TO_START marker
    in the chat history. The server must already exist (created via POST /sessions).

    If description/technical_details are provided, they override what was
    extracted from the chat. Otherwise, the backend uses values already
    stored in the server's meta from the chat.
    """
    customer_id = resolve_customer_id(request.customer_id, req)
    await require_org_access_to_customer(customer_id, req)

    service = get_wizard_service()

    try:
        server = (
            await Provider.mcp_server_repo().get_by_uuid(request.server_id)
            if request.server_id
            else None
        )

        if server:
            # ── Existing server (created via POST /sessions) ──
            # Enforce readiness gate: check that chat history contains READY_TO_START
            chat_history: list[dict[str, str]] = (server.meta or {}).get(
                "step_zero_chat_history", []
            )
            has_ready_marker = any(
                service.is_ready_to_start(msg.get("content", ""))
                for msg in chat_history
                if msg.get("role") == "assistant"
            )
            if not has_ready_marker:
                raise HTTPException(
                    status_code=400,
                    detail="The specification is not ready to proceed. Continue the conversation until the AI indicates readiness.",
                )

            # Use provided values or fall back to what's in meta/description
            description: str = request.description or server.description or ""

            # Update server with final description and technical details
            update_payload: dict[str, Any] = {}
            if request.description:
                update_payload["description"] = request.description
            if request.technical_details:
                updated_meta: dict[str, Any] = dict(server.meta or {})
                updated_meta["technical_details"] = request.technical_details
                update_payload["meta"] = updated_meta

            if update_payload:
                _ = await Provider.mcp_server_repo().update(
                    server.id, MCPServerUpdate(**update_payload)
                )

            # Generate a descriptive name using LLM
            try:
                name_response = await openai_client.chat.completions.create(
                    model=settings.SERVER_DETAILS_GENERATION_MODEL,
                    messages=[
                        {
                            "role": "user",
                            "content": (
                                "Generate a short, descriptive name "
                                "(2-4 words) for an MCP server based "
                                "on this description: "
                                f"{description}. "
                                "Return only the name, nothing else."
                            ),
                        }
                    ],
                    max_tokens=30,
                    temperature=0.3,
                )
                generated_name = (
                    (name_response.choices[0].message.content or "")
                    .strip()
                    .strip('"')
                    .strip("'")
                )
                if generated_name:
                    _ = await Provider.mcp_server_repo().update(
                        server.id,
                        MCPServerUpdate(name=generated_name),
                    )
            except Exception as e:
                logger.warning(f"Failed to generate server name: {e}")

            background_tasks.add_task(
                service.step_1a_suggest_tools_for_mcp_server,
                description=description,
                mcp_server_id=server.id,
            )

            return StartWizardResponse(
                server_id=server.id,
                status="processing",
            )

        if not request.description:
            raise HTTPException(
                status_code=400,
                detail="description is required when creating a new server",
            )

        meta: dict[str, Any] = {}
        if request.technical_details:
            meta["technical_details"] = request.technical_details

        server = await Provider.mcp_server_repo().create(
            MCPServerCreate(
                name=f"Server-{customer_id}",
                customer_id=customer_id,
                description=request.description,
                meta=meta,
            )
        )

        # Generate a descriptive name using LLM
        try:
            name_response = await openai_client.chat.completions.create(
                model=settings.SERVER_DETAILS_GENERATION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            "Generate a short, descriptive name "
                            "(2-4 words) for an MCP server based "
                            "on this description: "
                            f"{request.description}. "
                            "Return only the name, nothing else."
                        ),
                    }
                ],
                max_tokens=30,
                temperature=0.3,
            )
            generated_name = (
                (name_response.choices[0].message.content or "")
                .strip()
                .strip('"')
                .strip("'")
            )
            if generated_name:
                _ = await Provider.mcp_server_repo().update(
                    server.id,
                    MCPServerUpdate(name=generated_name),
                )
        except Exception as e:
            logger.warning(f"Failed to generate server name: {e}")

        background_tasks.add_task(
            service.step_1a_suggest_tools_for_mcp_server,
            description=request.description,
            mcp_server_id=server.id,
        )

        return StartWizardResponse(
            server_id=server.id,
            status="processing",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting wizard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/tools/refine")
async def refine_tools(
    server_id: UUID,
    request: RefineToolsRequest,
    background_tasks: BackgroundTasks,
    req: Request,
) -> dict[str, Any]:
    await require_org_access_to_server(server_id, req)
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
    req: Request,
) -> dict[str, Any]:
    await require_org_access_to_server(server_id, req)
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
async def get_tools(server_id: UUID, request: Request) -> list[ToolResponse]:
    await require_org_access_to_server(server_id, request)
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
    request: Request,
) -> dict[str, Any]:
    await require_org_access_to_server(server_id, request)
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
    req: Request,
) -> dict[str, Any]:
    await require_org_access_to_server(server_id, req)
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
    req: Request,
) -> dict[str, Any]:
    """
    Step 2c: Submit environment variable values.

    Saves the values and transitions to auth step.
    """
    await require_org_access_to_server(server_id, req)
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
async def get_env_vars(server_id: UUID, request: Request) -> list[EnvVarResponse]:
    """Get current environment variables for a server."""
    await require_org_access_to_server(server_id, request)
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
async def set_auth(server_id: UUID, request: Request) -> AuthResponse:
    """
    Step 3: Set header authentication.

    Generates a Bearer token and configures the server for auth.
    """
    await require_org_access_to_server(server_id, request)
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


@router.post("/{server_id}/tools/{tool_id}/regenerate-code")
async def regenerate_tool_code(
    server_id: UUID,
    tool_id: UUID,
    request: Request,
) -> dict[str, Any]:
    await require_org_access_to_server(server_id, request)
    """
    Regenerate code for a single tool. Uses same LLM logic as generate-code.
    Returns the new code. Synchronous (waits for LLM).
    Remounts the server if deployed so the new code takes effect.
    """
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")
    try:
        service = get_wizard_service()
        code = await service.regenerate_code_for_tool(
            mcp_server_id=server_id,
            tool_id=tool_id,
        )
        # Remount if deployed so new code takes effect
        try:
            from entrypoints.mcp.shared_runtime import remount_mcp_server

            app = request.app
            stack = getattr(app.state, "mcp_stack", None)
            if stack:
                _ = await remount_mcp_server(app, server_id, stack)
        except Exception as e:
            logger.warning(
                f"Failed to remount server {server_id} after regenerate: {e}"
            )
        return {
            "server_id": str(server_id),
            "tool_id": str(tool_id),
            "code": code,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/generate-code")
async def generate_code(
    server_id: UUID,
    background_tasks: BackgroundTasks,
    request: Request,
) -> dict[str, Any]:
    await require_org_access_to_server(server_id, request)
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
async def get_wizard_state(server_id: UUID, request: Request) -> WizardStateResponse:
    await require_org_access_to_server(server_id, request)
    """Get current state of a server for the wizard UI."""
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

    tools = await Provider.mcp_tool_repo().get_tools_for_server(server_id)
    env_vars = await Provider.environment_variable_repo().get_vars_for_server(server_id)
    api_key = await Provider.static_api_key_repo().get_by_server_id(server_id)

    # Get deployment info if it exists
    deployment = await Provider.deployment_repo().get_by_server_id(server_id)
    deployment_response = None
    if deployment:
        deployment_response = DeploymentResponse(
            id=deployment.id,
            target=deployment.target,
            status=deployment.status,
            endpoint_url=deployment.endpoint_url,
            error_message=deployment.error_message,
            deployed_at=deployment.deployed_at.isoformat()
            if deployment.deployed_at
            else None,
        )

    setup_status = server.setup_status
    wizard_step = map_setup_status_to_wizard_step(setup_status)
    processing_status = get_processing_status(setup_status)

    # Get processing error from meta if any
    processing_error = server.processing_error

    # Use deployment endpoint_url if available, otherwise None
    server_url = deployment.endpoint_url if deployment else None

    return WizardStateResponse(
        server_id=server_id,
        customer_id=server.customer_id,
        setup_status=setup_status,
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
        server_url=server_url,
        has_auth=api_key is not None,
        deployment=deployment_response,
        created_at=server.created_at.isoformat() if server.created_at else "",
        updated_at=server.updated_at.isoformat() if server.updated_at else "",
    )


class DeployToSharedResponse(BaseModel):
    server_url: str
    bearer_token: str
    step: str = "complete"


@router.post("/{server_id}/deploy", response_model=DeployToSharedResponse)
async def deploy_to_shared(server_id: UUID, request: Request) -> DeployToSharedResponse:
    await require_org_access_to_server(server_id, request)
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
            detail="Server must be in code_gen or deployment_selection state. "
            + f"Current state: {server.setup_status.value}",
        )

    # Get app and stack from request
    app = request.app
    stack = getattr(app.state, "mcp_stack", None)
    if not stack:
        logger.error("MCP stack not initialized in app state")
        raise HTTPException(status_code=500, detail="MCP runtime not initialized")

    try:
        service = get_wizard_service()
        endpoint_url, bearer_token = await service.step_5_deploy_to_shared(
            server_id, app, stack
        )

        return DeployToSharedResponse(
            server_url=endpoint_url, bearer_token=bearer_token, step="complete"
        )
    except ValueError as e:
        logger.error(f"Deployment failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Deployment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
