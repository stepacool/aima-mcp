"""OAuth 2.1 repositories for managing OAuth clients, tokens, and codes."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select, update

from infrastructure.db import Database
from infrastructure.models.oauth import (
    OAuthAccessToken,
    OAuthAuthorizationCode,
    OAuthClient,
    OAuthRefreshToken,
)
from infrastructure.repositories.base import BaseCRUDRepo


# ============================================================================
# OAuth Client Schemas and Repository
# ============================================================================


class OAuthClientCreate(BaseModel):
    """Schema for creating an OAuth client."""

    client_id: str
    client_secret_hash: str | None = None
    name: str
    redirect_uris: list[str]
    scopes: list[str]
    grant_types: list[str]
    is_public: bool = True
    server_id: UUID
    registration_type: str = "dynamic"
    meta: dict[str, Any] | None = None


class OAuthClientUpdate(BaseModel):
    """Schema for updating an OAuth client."""

    name: str | None = None
    redirect_uris: list[str] | None = None
    scopes: list[str] | None = None
    grant_types: list[str] | None = None
    meta: dict[str, Any] | None = None


class OAuthClientRepo(BaseCRUDRepo[OAuthClient, OAuthClientCreate, OAuthClientUpdate]):
    """Repository for OAuth clients."""

    def __init__(self, db: Database):
        super().__init__(db, OAuthClient)

    async def get_by_client_id(self, client_id: str) -> OAuthClient | None:
        """Get OAuth client by client_id string."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.client_id == client_id)
            )
            return result.scalars().first()

    async def get_by_server_id(self, server_id: UUID) -> list[OAuthClient]:
        """Get all OAuth clients for a server."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            return list(result.scalars().all())

    async def validate_redirect_uri(
        self, client_id: str, redirect_uri: str
    ) -> bool:
        """Validate that a redirect URI is registered for the client."""
        client = await self.get_by_client_id(client_id)
        if not client:
            return False
        return redirect_uri in client.redirect_uris


# ============================================================================
# OAuth Authorization Code Schemas and Repository
# ============================================================================


class OAuthAuthorizationCodeCreate(BaseModel):
    """Schema for creating an OAuth authorization code."""

    code: str
    client_id: UUID  # This is the OAuthClient.id (UUID), not client_id string
    user_id: str
    redirect_uri: str
    scope: str
    code_challenge: str
    code_challenge_method: str = "S256"
    server_id: UUID
    expires_at: datetime
    state: str | None = None


class OAuthAuthorizationCodeUpdate(BaseModel):
    """Schema for updating an OAuth authorization code."""

    is_used: bool | None = None


class OAuthAuthorizationCodeRepo(
    BaseCRUDRepo[
        OAuthAuthorizationCode,
        OAuthAuthorizationCodeCreate,
        OAuthAuthorizationCodeUpdate,
    ]
):
    """Repository for OAuth authorization codes."""

    def __init__(self, db: Database):
        super().__init__(db, OAuthAuthorizationCode)

    async def get_by_code(self, code: str) -> OAuthAuthorizationCode | None:
        """Get authorization code by code string."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.code == code)
            )
            return result.scalars().first()

    async def mark_as_used(self, code: str) -> bool:
        """Mark an authorization code as used (one-time use)."""
        async with self.db.session() as session:
            result = await session.execute(
                update(self.model)
                .where(self.model.code == code, self.model.is_used.is_(False))
                .values(is_used=True)
            )
            await session.commit()
            return result.rowcount > 0

    async def get_valid_code(self, code: str) -> OAuthAuthorizationCode | None:
        """Get a valid (unused, unexpired) authorization code."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(
                    self.model.code == code,
                    self.model.is_used.is_(False),
                    self.model.expires_at > datetime.utcnow(),
                )
            )
            return result.scalars().first()

    async def delete_expired(self) -> int:
        """Delete all expired authorization codes."""
        from sqlalchemy import delete as sa_delete

        async with self.db.session() as session:
            result = await session.execute(
                sa_delete(self.model).where(
                    self.model.expires_at < datetime.utcnow()
                )
            )
            await session.commit()
            return result.rowcount


# ============================================================================
# OAuth Access Token Schemas and Repository
# ============================================================================


class OAuthAccessTokenCreate(BaseModel):
    """Schema for creating an OAuth access token record."""

    token_hash: str
    jti: str
    client_id: UUID  # This is the OAuthClient.id (UUID)
    user_id: str
    scope: str
    audience: str | None = None
    server_id: UUID
    expires_at: datetime


class OAuthAccessTokenUpdate(BaseModel):
    """Schema for updating an OAuth access token."""

    is_revoked: bool | None = None


class OAuthAccessTokenRepo(
    BaseCRUDRepo[OAuthAccessToken, OAuthAccessTokenCreate, OAuthAccessTokenUpdate]
):
    """Repository for OAuth access tokens."""

    def __init__(self, db: Database):
        super().__init__(db, OAuthAccessToken)

    async def get_by_jti(self, jti: str) -> OAuthAccessToken | None:
        """Get access token by JTI (JWT ID)."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.jti == jti)
            )
            return result.scalars().first()

    async def get_by_token_hash(self, token_hash: str) -> OAuthAccessToken | None:
        """Get access token by token hash."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.token_hash == token_hash)
            )
            return result.scalars().first()

    async def revoke(self, jti: str) -> bool:
        """Revoke an access token by JTI."""
        async with self.db.session() as session:
            result = await session.execute(
                update(self.model)
                .where(self.model.jti == jti)
                .values(is_revoked=True)
            )
            await session.commit()
            return result.rowcount > 0

    async def revoke_all_for_user(self, user_id: str, server_id: UUID) -> int:
        """Revoke all access tokens for a user on a server."""
        async with self.db.session() as session:
            result = await session.execute(
                update(self.model)
                .where(
                    self.model.user_id == user_id,
                    self.model.server_id == server_id,
                    self.model.is_revoked.is_(False),
                )
                .values(is_revoked=True)
            )
            await session.commit()
            return result.rowcount

    async def is_token_valid(self, jti: str) -> bool:
        """Check if a token is valid (exists, not revoked, not expired)."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(
                    self.model.jti == jti,
                    self.model.is_revoked.is_(False),
                    self.model.expires_at > datetime.utcnow(),
                )
            )
            return result.scalars().first() is not None


# ============================================================================
# OAuth Refresh Token Schemas and Repository
# ============================================================================


class OAuthRefreshTokenCreate(BaseModel):
    """Schema for creating an OAuth refresh token."""

    token_hash: str
    client_id: UUID  # This is the OAuthClient.id (UUID)
    user_id: str
    access_token_id: UUID | None = None
    scope: str
    server_id: UUID
    expires_at: datetime


class OAuthRefreshTokenUpdate(BaseModel):
    """Schema for updating an OAuth refresh token."""

    is_revoked: bool | None = None
    rotation_counter: int | None = None
    access_token_id: UUID | None = None


class OAuthRefreshTokenRepo(
    BaseCRUDRepo[OAuthRefreshToken, OAuthRefreshTokenCreate, OAuthRefreshTokenUpdate]
):
    """Repository for OAuth refresh tokens."""

    def __init__(self, db: Database):
        super().__init__(db, OAuthRefreshToken)

    async def get_by_token_hash(self, token_hash: str) -> OAuthRefreshToken | None:
        """Get refresh token by token hash."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.token_hash == token_hash)
            )
            return result.scalars().first()

    async def get_valid_token(self, token_hash: str) -> OAuthRefreshToken | None:
        """Get a valid (not revoked, not expired) refresh token."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(
                    self.model.token_hash == token_hash,
                    self.model.is_revoked.is_(False),
                    self.model.expires_at > datetime.utcnow(),
                )
            )
            return result.scalars().first()

    async def revoke(self, token_hash: str) -> bool:
        """Revoke a refresh token."""
        async with self.db.session() as session:
            result = await session.execute(
                update(self.model)
                .where(self.model.token_hash == token_hash)
                .values(is_revoked=True)
            )
            await session.commit()
            return result.rowcount > 0

    async def revoke_all_for_user(self, user_id: str, server_id: UUID) -> int:
        """Revoke all refresh tokens for a user on a server."""
        async with self.db.session() as session:
            result = await session.execute(
                update(self.model)
                .where(
                    self.model.user_id == user_id,
                    self.model.server_id == server_id,
                    self.model.is_revoked.is_(False),
                )
                .values(is_revoked=True)
            )
            await session.commit()
            return result.rowcount

    async def increment_rotation_counter(self, token_hash: str) -> bool:
        """Increment the rotation counter for refresh token rotation."""
        async with self.db.session() as session:
            result = await session.execute(
                update(self.model)
                .where(self.model.token_hash == token_hash)
                .values(rotation_counter=self.model.rotation_counter + 1)
            )
            await session.commit()
            return result.rowcount > 0
