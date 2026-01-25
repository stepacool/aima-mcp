from typing import Any
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select

from infrastructure.db import Database
from infrastructure.models.customer import Customer, StaticAPIKey
from infrastructure.repositories.base import BaseCRUDRepo


class CustomerCreate(BaseModel):
    id: UUID | None = None
    name: str
    email: str | None = None
    meta: dict[str, Any] | None = None


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    meta: dict[str, Any] | None = None


class CustomerRepo(BaseCRUDRepo[Customer, CustomerCreate, CustomerUpdate]):
    def __init__(self, db: Database):
        super().__init__(db, Customer)

    async def get_by_name(self, name: str) -> Customer | None:
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.name == name)
            )
            return result.scalars().first()

    async def get_by_email(self, email: str) -> Customer | None:
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.email == email)
            )
            return result.scalars().first()


class StaticAPIKeyCreate(BaseModel):
    """Schema for creating a static API key."""

    key: str
    server_id: UUID
    meta: dict[str, Any] | None = None


class StaticAPIKeyUpdate(BaseModel):
    """Schema for updating a static API key."""

    key: str | None = None
    meta: dict[str, Any] | None = None


class StaticAPIKeyRepo(
    BaseCRUDRepo[StaticAPIKey, StaticAPIKeyCreate, StaticAPIKeyUpdate]
):
    """Repository for static API keys (backward compatibility)."""

    def __init__(self, db: Database):
        super().__init__(db, StaticAPIKey)

    async def create_for_server(self, server_id: UUID, key: str) -> StaticAPIKey:
        """Create a static API key for a server."""
        return await self.create(StaticAPIKeyCreate(key=key, server_id=server_id))

    async def get_by_server_id(self, server_id: UUID) -> StaticAPIKey | None:
        """Get static API key by server ID."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            return result.scalars().first()

    async def get_by_key(self, key: str) -> StaticAPIKey | None:
        """Get static API key by key string."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.key == key)
            )
            return result.scalars().first()

    async def delete_for_server(self, server_id: UUID) -> bool:
        """Delete static API key for a server."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            api_key = result.scalars().first()
            if api_key:
                await session.delete(api_key)
                await session.commit()
                return True
            return False
