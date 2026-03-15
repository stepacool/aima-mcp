"""Repository for organization API keys."""

import hashlib
import secrets
from datetime import datetime, timezone
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select, update

from infrastructure.db import Database
from infrastructure.models.org_api_key import OrgApiKey
from infrastructure.repositories.base import BaseRepo

API_KEY_PREFIX = "api_"
API_KEY_RANDOM_SIZE = 16


def _generate_api_key() -> str:
    """Generate a new API key (api_ + 32 hex chars)."""
    return f"{API_KEY_PREFIX}{secrets.token_hex(API_KEY_RANDOM_SIZE)}"


def _hash_api_key(plain_key: str) -> str:
    """Hash API key with SHA-256 (matches frontend format)."""
    return hashlib.sha256(plain_key.encode()).hexdigest()


class OrgApiKeyCreate(BaseModel):
    organization_id: UUID
    description: str
    expires_at: datetime | None = None


class OrgApiKeyUpdate(BaseModel):
    description: str | None = None
    expires_at: datetime | None = None


class OrgApiKeyRepo(BaseRepo):
    """Repository for organization API keys."""

    def __init__(self, db: Database):
        super().__init__(db)

    async def create(
        self,
        organization_id: UUID,
        description: str,
        expires_at: datetime | None = None,
    ) -> tuple[OrgApiKey, str]:
        """Create a new API key. Returns (record, plain_key). Plain key shown only once."""
        plain_key = _generate_api_key()
        hashed_key = _hash_api_key(plain_key)
        record = OrgApiKey(
            organization_id=organization_id,
            description=description,
            hashed_key=hashed_key,
            expires_at=expires_at,
        )
        async with self.db.session() as session:
            session.add(record)
            await session.commit()
            await session.refresh(record)
        return record, plain_key

    async def list_by_organization(
        self, organization_id: UUID
    ) -> list[dict[str, object]]:
        """List API keys for an organization (metadata only, no hashed_key)."""
        async with self.db.session() as session:
            result = await session.execute(
                select(OrgApiKey)
                .where(OrgApiKey.organization_id == organization_id)
                .order_by(OrgApiKey.created_at.asc())
            )
            keys = list(result.scalars().all())
        return [
            {
                "id": str(k.id),
                "description": k.description,
                "last_used_at": k.last_used_at,
                "expires_at": k.expires_at,
            }
            for k in keys
        ]

    async def get_by_id(self, key_id: UUID) -> OrgApiKey | None:
        """Get API key by ID."""
        async with self.db.session() as session:
            result = await session.execute(
                select(OrgApiKey).where(OrgApiKey.id == key_id)
            )
            return result.scalars().first()

    async def update(
        self,
        key_id: UUID,
        organization_id: UUID,
        description: str | None = None,
        expires_at: datetime | None = None,
    ) -> bool:
        """Update an API key. Returns True if updated, False if not found or wrong org."""
        async with self.db.session() as session:
            result = await session.execute(
                select(OrgApiKey).where(
                    OrgApiKey.id == key_id,
                    OrgApiKey.organization_id == organization_id,
                )
            )
            record = result.scalars().first()
            if not record:
                return False
            if description is not None:
                record.description = description
            if expires_at is not None:
                record.expires_at = expires_at
            await session.commit()
        return True

    async def delete(self, key_id: UUID, organization_id: UUID) -> bool:
        """Delete an API key. Returns True if deleted, False if not found or wrong org."""
        async with self.db.session() as session:
            result = await session.execute(
                select(OrgApiKey).where(
                    OrgApiKey.id == key_id,
                    OrgApiKey.organization_id == organization_id,
                )
            )
            record = result.scalars().first()
            if not record:
                return False
            await session.delete(record)
            await session.commit()
        return True

    async def verify(self, plain_key: str) -> UUID | None:
        """Verify an API key. Returns organization_id if valid, None otherwise."""
        hashed = _hash_api_key(plain_key)
        async with self.db.session() as session:
            result = await session.execute(
                select(OrgApiKey).where(OrgApiKey.hashed_key == hashed)
            )
            record = result.scalars().first()
            if not record:
                return None
            now = datetime.now(timezone.utc)
            if record.expires_at and record.expires_at < now:
                return None
            # Update last_used_at
            await session.execute(
                update(OrgApiKey)
                .where(OrgApiKey.id == record.id)
                .values(last_used_at=now)
            )
            await session.commit()
            return record.organization_id
