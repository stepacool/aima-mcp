from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException
from loguru import logger

from entrypoints.api.schemas import (
    ActionsListResponse,
    ActionResponse,
    AuthConfigRequest,
    AuthConfigResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    DescribeSystemRequest,
    RefineActionsRequest,
    SessionState,
    UpdateActionsRequest,
)
from services.chat_service import (
    AuthType,
    FlowStep,
    get_chat_service,
)

router = APIRouter()

# In-memory session storage
_sessions: dict[UUID, SessionState] = {}


def get_session(session_id: UUID) -> SessionState:
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return _sessions[session_id]


def create_session() -> SessionState:
    session = SessionState(id=uuid4())
    _sessions[session.id] = session
    return session


@router.post("/describe", response_model=ActionsListResponse)
async def describe_system(request: DescribeSystemRequest) -> ActionsListResponse:
    """Step 1: Describe the system and get suggested actions."""
    chat_service = get_chat_service()

    if request.session_id:
        session = get_session(request.session_id)
    else:
        session = create_session()

    session.messages.append({"role": "user", "content": request.description})

    try:
        response_text, design = await chat_service.suggest_actions(request.description)
        session.messages.append({"role": "assistant", "content": response_text})

        if design:
            session.server_name = design.server_name
            session.server_description = design.description
            session.actions = design.actions
            session.step = FlowStep.REFINE_ACTIONS

        return ActionsListResponse(
            session_id=session.id,
            server_name=session.server_name,
            server_description=session.server_description,
            actions=[
                ActionResponse(
                    name=a.name,
                    description=a.description,
                    parameters=a.parameters,
                    auth_required=a.auth_required,
                )
                for a in session.actions
            ],
        )
    except Exception as e:
        logger.error(f"Error describing system: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refine", response_model=ActionsListResponse)
async def refine_actions(request: RefineActionsRequest) -> ActionsListResponse:
    """Step 2: Refine actions based on user feedback."""
    session = get_session(request.session_id)
    chat_service = get_chat_service()

    try:
        response_text, updated_actions = await chat_service.refine_actions(
            session.actions, request.feedback
        )

        session.messages.append({"role": "user", "content": request.feedback})
        session.messages.append({"role": "assistant", "content": response_text})

        if updated_actions:
            session.actions = updated_actions

        return ActionsListResponse(
            session_id=session.id,
            server_name=session.server_name,
            server_description=session.server_description,
            actions=[
                ActionResponse(
                    name=a.name,
                    description=a.description,
                    parameters=a.parameters,
                    auth_required=a.auth_required,
                )
                for a in session.actions
            ],
        )
    except Exception as e:
        logger.error(f"Error refining actions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/actions/update", response_model=ActionsListResponse)
async def update_actions(request: UpdateActionsRequest) -> ActionsListResponse:
    """Directly update actions (add, remove, edit)."""
    session = get_session(request.session_id)
    session.actions = request.actions

    return ActionsListResponse(
        session_id=session.id,
        server_name=session.server_name,
        server_description=session.server_description,
        actions=[
            ActionResponse(
                name=a.name,
                description=a.description,
                parameters=a.parameters,
                auth_required=a.auth_required,
            )
            for a in session.actions
        ],
    )


@router.post("/actions/confirm")
async def confirm_actions(session_id: UUID) -> dict:
    """Confirm actions and move to auth configuration step."""
    session = get_session(session_id)

    if not session.actions:
        raise HTTPException(status_code=400, detail="No actions defined")

    session.step = FlowStep.CONFIGURE_AUTH
    return {
        "status": "confirmed",
        "session_id": session.id,
        "next_step": "configure_auth",
        "actions_count": len(session.actions),
        "requires_auth": any(a.auth_required for a in session.actions),
    }


@router.post("/auth/configure", response_model=AuthConfigResponse)
async def configure_auth(request: AuthConfigRequest) -> AuthConfigResponse:
    """Step 3: Configure authentication for actions."""
    session = get_session(request.session_id)

    session.auth_type = request.auth_type

    if request.auth_type == AuthType.OAUTH:
        session.auth_config = {
            "provider_url": request.oauth_provider_url,
            "client_id": request.oauth_client_id,
            "scopes": request.oauth_scopes or [],
        }
    elif request.auth_type == AuthType.EPHEMERAL:
        session.auth_config = {
            "method": "ephemeral",
            "description": "Credentials provided at runtime",
        }
    else:
        session.auth_config = {}

    session.step = FlowStep.REVIEW_AND_DEPLOY

    return AuthConfigResponse(
        session_id=session.id,
        auth_type=session.auth_type,
        auth_config=session.auth_config,
    )


@router.get("/session/{session_id}")
async def get_session_state(session_id: UUID) -> SessionState:
    """Get the current state of a session."""
    return get_session(session_id)


@router.delete("/session/{session_id}")
async def delete_session(session_id: UUID) -> dict:
    """Delete a session."""
    if session_id in _sessions:
        del _sessions[session_id]
    return {"status": "deleted"}


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest) -> ChatMessageResponse:
    """Send a free-form message (for general chat)."""
    chat_service = get_chat_service()

    if request.session_id:
        session = get_session(request.session_id)
    else:
        session = create_session()

    session.messages.append({"role": "user", "content": request.message})

    try:
        response_text, design = await chat_service.chat(
            request.message, history=session.messages[:-1]
        )

        session.messages.append({"role": "assistant", "content": response_text})

        if design and design.actions:
            session.server_name = design.server_name
            session.server_description = design.description
            session.actions = design.actions
            session.step = FlowStep.REFINE_ACTIONS

        return ChatMessageResponse(
            response=response_text,
            session_id=session.id,
            step=session.step,
            actions_ready=len(session.actions) > 0,
            design=design.model_dump() if design else None,
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
