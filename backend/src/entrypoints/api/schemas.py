from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from core.services import ActionSpec, AuthType, FlowStep
from core.services import Tier


class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="User message")
    session_id: UUID | None = Field(None, description="Existing session ID")


class ChatMessageResponse(BaseModel):
    response: str
    session_id: UUID
    step: FlowStep
    actions_ready: bool = False
    design: dict[str, Any] | None = None


class DescribeSystemRequest(BaseModel):
    description: str = Field(..., description="System description")
    session_id: UUID | None = None


class ActionResponse(BaseModel):
    name: str
    description: str
    parameters: list[dict[str, Any]]
    auth_required: bool


class ActionsListResponse(BaseModel):
    session_id: UUID
    server_name: str
    server_description: str
    actions: list[ActionResponse]


class RefineActionsRequest(BaseModel):
    session_id: UUID
    feedback: str


class UpdateActionsRequest(BaseModel):
    session_id: UUID
    actions: list[ActionSpec]


class AuthConfigRequest(BaseModel):
    session_id: UUID
    auth_type: AuthType
    oauth_provider_url: str | None = None
    oauth_client_id: str | None = None
    oauth_scopes: list[str] | None = None


class AuthConfigResponse(BaseModel):
    session_id: UUID
    auth_type: AuthType
    auth_config: dict[str, Any]


class GenerateCodeRequest(BaseModel):
    session_id: UUID


class GenerateCodeResponse(BaseModel):
    session_id: UUID
    code: str


class DeployRequest(BaseModel):
    session_id: UUID
    target: str = Field(default="standalone")


class DeployResponse(BaseModel):
    session_id: UUID
    target: str
    files: dict[str, str]
    instructions: str


class SessionState(BaseModel):
    """Session state for the wizard flow."""

    id: UUID
    step: FlowStep = FlowStep.DESCRIBE_SYSTEM
    tier: Tier = Tier.FREE
    messages: list[dict[str, str]] = Field(default_factory=list)
    server_name: str = ""
    server_description: str = ""
    actions: list[ActionSpec] = Field(default_factory=list)
    auth_type: AuthType = AuthType.NONE
    auth_config: dict[str, Any] = Field(default_factory=dict)
    generated_code: str | None = None


class TierInfoResponse(BaseModel):
    """Information about tier limits."""

    tier: Tier
    max_tools: int
    can_deploy: bool
    curated_only: bool
    curated_libraries: list[str]


class ActivateRequest(BaseModel):
    """Request to activate tools on shared runtime (free tier)."""

    session_id: UUID


class ActivateResponse(BaseModel):
    """Response after activating tools on shared runtime."""

    session_id: UUID
    status: str
    mcp_endpoint: str
    tools_count: int
    customer_id: str


class ValidationErrorsResponse(BaseModel):
    """Response when code validation fails."""

    session_id: UUID
    errors: list[str]
    tool_name: str | None = None
