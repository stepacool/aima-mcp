from typing import TYPE_CHECKING, Any, Optional
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.db import CustomBase

if TYPE_CHECKING:
    pass


class Customer(CustomBase):
    __tablename__ = "customers"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meta: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    def __str__(self) -> str:
        return f"Customer(id={self.id}, name={self.name})"


class APIKey(CustomBase):
    __tablename__ = "api_keys"

    key: Mapped[str] = mapped_column(String, index=True, nullable=False)
    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    meta: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
