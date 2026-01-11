from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException
from loguru import logger

from entrypoints.api.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    SessionState,
)
from services.chat_service import get_chat_service

router = APIRouter()

# In-memory session storage (replace with database in production)
_sessions: dict[UUID, SessionState] = {}


def get_session(session_id: UUID) -> SessionState:
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return _sessions[session_id]


def create_session() -> SessionState:
    session = SessionState(id=uuid4())
    _sessions[session.id] = session
    return session


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest) -> ChatMessageResponse:
    """Send a message in a chat session for MCP server creation."""
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

        design_complete = design is not None
        if design:
            session.design = design.model_dump()

        return ChatMessageResponse(
            response=response_text,
            session_id=session.id,
            design_complete=design_complete,
            design=session.design if design_complete else None,
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}")
async def get_session_state(session_id: UUID) -> SessionState:
    """Get the current state of a chat session."""
    return get_session(session_id)


@router.delete("/session/{session_id}")
async def delete_session(session_id: UUID) -> dict:
    """Delete a chat session."""
    if session_id in _sessions:
        del _sessions[session_id]
    return {"status": "deleted"}


@router.post("/session/{session_id}/confirm-design")
async def confirm_design(session_id: UUID) -> dict:
    """Confirm the current design and prepare for code generation."""
    session = get_session(session_id)

    if not session.design:
        raise HTTPException(
            status_code=400,
            detail="No design available. Continue chatting to create a design.",
        )

    return {
        "status": "confirmed",
        "design": session.design,
        "message": "Design confirmed. You can now generate code or deploy.",
    }
