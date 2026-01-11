from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="User message")
    session_id: UUID | None = Field(None, description="Existing session ID to continue")


class ChatMessageResponse(BaseModel):
    response: str
    session_id: UUID
    design_complete: bool = False
    design: dict[str, Any] | None = None


class MCPServerCreate(BaseModel):
    name: str
    description: str | None = None


class MCPServerResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    status: str

    class Config:
        from_attributes = True


class MCPToolCreate(BaseModel):
    name: str
    description: str
    parameters_schema: dict[str, Any]
    implementation: str


class MCPToolResponse(BaseModel):
    id: UUID
    name: str
    description: str
    parameters_schema: dict[str, Any]
    code: str

    class Config:
        from_attributes = True


class MCPPromptCreate(BaseModel):
    name: str
    description: str
    template: str
    arguments: dict[str, Any] | None = None


class MCPPromptResponse(BaseModel):
    id: UUID
    name: str
    description: str
    template: str
    arguments: dict[str, Any] | None

    class Config:
        from_attributes = True


class GenerateCodeRequest(BaseModel):
    server_id: UUID


class GenerateCodeResponse(BaseModel):
    code: str
    server_id: UUID


class DeployRequest(BaseModel):
    server_id: UUID
    target: str = Field(default="standalone", description="Deployment target")


class DeployResponse(BaseModel):
    server_id: UUID
    target: str
    files: dict[str, str]
    instructions: str


class SessionState(BaseModel):
    """In-memory session state for chat."""

    id: UUID
    server_id: UUID | None = None
    messages: list[dict[str, str]] = Field(default_factory=list)
    design: dict[str, Any] | None = None
