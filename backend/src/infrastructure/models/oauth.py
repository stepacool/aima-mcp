"""OAuth 2.1 models for Authorization Code Grant flow."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.db import CustomBase


class OAuthClient(CustomBase):
    """OAuth 2.1 client registration."""

    __tablename__ = "oauth_clients"

    client_id: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    client_secret_hash: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    redirect_uris: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    scopes: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    grant_types: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    registration_type: Mapped[str] = mapped_column(
        String(50), default="dynamic", nullable=False
    )
    meta: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # Relationships
    authorization_codes: Mapped[list["OAuthAuthorizationCode"]] = relationship(
        "OAuthAuthorizationCode", back_populates="client", cascade="all, delete-orphan"
    )
    access_tokens: Mapped[list["OAuthAccessToken"]] = relationship(
        "OAuthAccessToken", back_populates="client", cascade="all, delete-orphan"
    )
    refresh_tokens: Mapped[list["OAuthRefreshToken"]] = relationship(
        "OAuthRefreshToken", back_populates="client", cascade="all, delete-orphan"
    )

    def __str__(self) -> str:
        return f"OAuthClient(client_id={self.client_id}, name={self.name})"


class OAuthAuthorizationCode(CustomBase):
    """OAuth 2.1 authorization code."""

    __tablename__ = "oauth_authorization_codes"

    code: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    client_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("oauth_clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    redirect_uri: Mapped[str] = mapped_column(String(2048), nullable=False)
    scope: Mapped[str] = mapped_column(String(1024), nullable=False)
    code_challenge: Mapped[str] = mapped_column(String(255), nullable=False)
    code_challenge_method: Mapped[str] = mapped_column(
        String(10), default="S256", nullable=False
    )
    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    state: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    client: Mapped["OAuthClient"] = relationship(
        "OAuthClient", back_populates="authorization_codes"
    )

    def __str__(self) -> str:
        return (
            f"OAuthAuthorizationCode(code={self.code[:8]}..., user_id={self.user_id})"
        )

    @property
    def is_expired(self) -> bool:
        """Check if the authorization code is expired."""
        return datetime.utcnow() > self.expires_at


class OAuthAccessToken(CustomBase):
    """OAuth 2.1 access token metadata (actual JWT is not stored)."""

    __tablename__ = "oauth_access_tokens"

    token_hash: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    jti: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    client_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("oauth_clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    scope: Mapped[str] = mapped_column(String(1024), nullable=False)
    audience: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    client: Mapped["OAuthClient"] = relationship(
        "OAuthClient", back_populates="access_tokens"
    )
    refresh_token: Mapped[Optional["OAuthRefreshToken"]] = relationship(
        "OAuthRefreshToken", back_populates="access_token", uselist=False
    )

    def __str__(self) -> str:
        return f"OAuthAccessToken(jti={self.jti}, user_id={self.user_id})"

    @property
    def is_expired(self) -> bool:
        """Check if the access token is expired."""
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Check if the access token is valid (not expired and not revoked)."""
        return not self.is_expired and not self.is_revoked


class OAuthRefreshToken(CustomBase):
    """OAuth 2.1 refresh token."""

    __tablename__ = "oauth_refresh_tokens"

    token_hash: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    client_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("oauth_clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    access_token_id: Mapped[Optional[UUID]] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("oauth_access_tokens.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    scope: Mapped[str] = mapped_column(String(1024), nullable=False)
    server_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("mcp_servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    rotation_counter: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    client: Mapped["OAuthClient"] = relationship(
        "OAuthClient", back_populates="refresh_tokens"
    )
    access_token: Mapped[Optional["OAuthAccessToken"]] = relationship(
        "OAuthAccessToken", back_populates="refresh_token"
    )

    def __str__(self) -> str:
        return f"OAuthRefreshToken(user_id={self.user_id}, rotation={self.rotation_counter})"

    @property
    def is_expired(self) -> bool:
        """Check if the refresh token is expired."""
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Check if the refresh token is valid (not expired and not revoked)."""
        return not self.is_expired and not self.is_revoked
