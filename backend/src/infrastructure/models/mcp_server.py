from enum import Enum
from typing import TYPE_CHECKING, Any, Optional
from uuid import UUID

from pydantic import ConfigDict
from sqlalchemy import ForeignKey, String, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.db import CustomBase

if TYPE_CHECKING:
    from infrastructure.models.deployment import Deployment


class MCPServerSetupStatus(str, Enum):
    # Tools step
    tools_generating = "tools_generating"  # LLM is generating/refining tools
    tools_selection = "tools_selection"  # User reviews and selects tools

    # Env vars step
    env_vars_generating = "env_vars_generating"  # LLM is generating/refining env vars
    env_vars_setup = "env_vars_setup"  # User reviews and fills env vars

    # Auth step
    auth_selection = "auth_selection"

    # Code generation step
    code_generating = "code_generating"  # LLM is generating code
    code_gen = "code_gen"  # Code is ready for review

    # Deployment step
    deployment_selection = "deployment_selection"
    ready = "ready"


class MCPServer(CustomBase):
    """Represents a user-created MCP server configuration."""

    __tablename__ = "mcp_servers"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    setup_status: Mapped[MCPServerSetupStatus]= mapped_column(
        SQLEnum(MCPServerSetupStatus),
        nullable=False,
        server_default="tools_selection",
        default=MCPServerSetupStatus.tools_selection,
    )

    auth_type: Mapped[str] = mapped_column(String(50), default="none", nullable=False)
    auth_config: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    customer_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    meta: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    @property
    def processing_error(self) -> str | None:
        """Get processing error from meta, if any."""
        return self.meta.get("processing_error") if self.meta is not None else None

    tools: Mapped[list["MCPTool"]] = relationship(
        back_populates="server", cascade="all, delete-orphan"
    )
    environment_variables: Mapped[list["MCPEnvironmentVariable"]] = relationship(
        back_populates="server", cascade="all, delete-orphan"
    )

    prompts: Mapped[list["MCPPrompt"]] = relationship(
        back_populates="server", cascade="all, delete-orphan"
    )
    deployment: Mapped[Optional["Deployment"]] = relationship(
        back_populates="server", uselist=False, cascade="all, delete-orphan"
    )

    @property
    def tier(self) -> str:
        """Derive tier from deployment target."""
        from infrastructure.models.deployment import DeploymentTarget

        if self.deployment and self.deployment.target != DeploymentTarget.SHARED.value:
            return "paid"
        return "free"

    @property
    def is_deployed(self) -> bool:
        """Check if server is actively deployed."""
        from infrastructure.models.deployment import DeploymentStatus

        return (
            self.deployment is not None
            and self.deployment.status == DeploymentStatus.ACTIVE.value
        )
    
    model_config = ConfigDict(from_attributes=True)


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
    parameters_schema: Mapped[list[dict]] = mapped_column(JSONB, nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    server: Mapped["MCPServer"] = relationship(back_populates="tools")

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class MCPEnvironmentVariable(CustomBase):
    __tablename__ = "mcp_environment_variables"

    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    value: Mapped[str] = mapped_column(Text, nullable=True)

    server: Mapped["MCPServer"] = relationship(back_populates="environment_variables")

    model_config = ConfigDict(from_attributes=True)