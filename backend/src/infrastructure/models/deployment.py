from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any, Optional
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.db import CustomBase

if TYPE_CHECKING:
    from infrastructure.models.mcp_server import MCPServer


class DeploymentTarget(str, Enum):
    """Target platform for MCP server deployment."""

    # Shared runtime (free tier) - multi-tenant at /mcp/{server_id}
    SHARED = "shared"

    # VPC/dedicated hosting (paid tier)
    MODAL = "modal"
    CLOUDFLARE = "cloudflare"
    VERCEL = "vercel"
    STANDALONE = "standalone"


class DeploymentStatus(str, Enum):
    """Status of a deployment."""

    PENDING = "pending"
    ACTIVE = "active"
    FAILED = "failed"
    DEACTIVATED = "deactivated"


class Deployment(CustomBase):
    """Tracks a deployment of an MCP server to a specific target."""

    __tablename__ = "deployments"

    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    target: Mapped[str] = mapped_column(String(50), nullable=False)

    status: Mapped[str] = mapped_column(
        String(50), default=DeploymentStatus.PENDING.value, nullable=False
    )

    endpoint_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    target_config: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB, nullable=True
    )

    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    deployed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    server: Mapped["MCPServer"] = relationship(back_populates="deployment")
    artifact: Mapped[Optional["DeploymentArtifact"]] = relationship(
        back_populates="deployment", uselist=False, cascade="all, delete-orphan"
    )


class DeploymentArtifact(CustomBase):
    """Stores generated deployment artifacts for a deployment."""

    __tablename__ = "deployment_artifacts"

    deployment_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("deployments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    artifact_type: Mapped[str] = mapped_column(String(50), nullable=False)

    files: Mapped[dict[str, str]] = mapped_column(JSONB, nullable=False)

    instructions: Mapped[str] = mapped_column(Text, nullable=False)

    # Legacy fields for backward compatibility
    code: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    config: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # Relationship
    deployment: Mapped["Deployment"] = relationship(back_populates="artifact")
