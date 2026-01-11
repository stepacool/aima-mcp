from typing import TYPE_CHECKING, Any, Optional
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.db import CustomBase

if TYPE_CHECKING:
    from infrastructure.models.mcp_server import MCPServer


class Customer(CustomBase):
    __tablename__ = "customers"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meta: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    api_keys: Mapped[list["APIKey"]] = relationship(back_populates="customer")
    mcp_servers: Mapped[list["MCPServer"]] = relationship(back_populates="customer")

    def __str__(self) -> str:
        return f"Customer(id={self.id}, name={self.name})"


class APIKey(CustomBase):
    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    key: Mapped[str] = mapped_column(String, index=True, nullable=False)
    customer_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    customer: Mapped["Customer"] = relationship(back_populates="api_keys")

    meta: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
