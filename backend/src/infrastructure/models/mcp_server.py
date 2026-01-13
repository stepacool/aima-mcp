from enum import Enum
from typing import TYPE_CHECKING, Any, Optional
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.db import CustomBase

if TYPE_CHECKING:
    from infrastructure.models.customer import Customer


class MCPServerStatus(str, Enum):
    DRAFT = "draft"
    READY = "ready"
    DEPLOYED = "deployed"
    ACTIVE = "active"  # For free tier - running on shared runtime


class MCPServerTier(str, Enum):
    FREE = "free"
    PAID = "paid"


class MCPServer(CustomBase):
    """Represents a user-created MCP server configuration."""

    __tablename__ = "mcp_servers"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default=MCPServerStatus.DRAFT.value, nullable=False
    )
    tier: Mapped[str] = mapped_column(
        String(20), default=MCPServerTier.FREE.value, nullable=False
    )
    auth_type: Mapped[str] = mapped_column(String(50), default="none", nullable=False)
    auth_config: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    customer_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    tools: Mapped[list["MCPTool"]] = relationship(
        back_populates="server", cascade="all, delete-orphan"
    )

    prompts: Mapped[list["MCPPrompt"]] = relationship(
        back_populates="server", cascade="all, delete-orphan"
    )
    chat_sessions: Mapped[list["ChatSession"]] = relationship(
        back_populates="server", cascade="all, delete-orphan"
    )


class MCPTool(CustomBase):
    """Represents a tool in an MCP server."""

    __tablename__ = "mcp_tools"

    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    parameters_schema: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    is_validated: Mapped[bool] = mapped_column(default=False, nullable=False)
    validation_errors: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    server: Mapped["MCPServer"] = relationship(back_populates="tools")


class MCPPrompt(CustomBase):
    """Represents a prompt template in an MCP server."""

    __tablename__ = "mcp_prompts"

    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    template: Mapped[str] = mapped_column(Text, nullable=False)
    arguments: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    server: Mapped["MCPServer"] = relationship(back_populates="prompts")


class ChatSession(CustomBase):
    """Stores chat history for interactive MCP server creation."""

    __tablename__ = "chat_sessions"

    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    messages: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONB, default=list, nullable=False
    )

    server: Mapped["MCPServer"] = relationship(back_populates="chat_sessions")


class DeploymentArtifact(CustomBase):
    """Stores generated deployment artifacts for MCP servers."""

    __tablename__ = "deployment_artifacts"

    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    artifact_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # e.g., "modal", "cloudflare", "vercel"
    code: Mapped[str] = mapped_column(Text, nullable=False)
    config: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
