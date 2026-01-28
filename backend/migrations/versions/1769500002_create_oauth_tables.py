"""Create OAuth tables for OAuth 2.1 Authorization Code Grant flow

Revision ID: d9b2c3e4f5a6
Revises: c8a1b2d3e4f5
Create Date: 2026-01-26 10:00:02.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "d9b2c3e4f5a6"
down_revision: Union[str, Sequence[str], None] = "c8a1b2d3e4f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create OAuth tables."""
    # OAuth Clients table
    op.create_table(
        "oauth_clients",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column("client_id", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("client_secret_hash", sa.String(255), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("redirect_uris", postgresql.JSONB, nullable=False),
        sa.Column("scopes", postgresql.JSONB, nullable=False),
        sa.Column("grant_types", postgresql.JSONB, nullable=False),
        sa.Column("is_public", sa.Boolean, default=True, nullable=False),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("mcp_servers.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "registration_type",
            sa.String(50),
            default="dynamic",
            nullable=False,
        ),
        sa.Column("meta", postgresql.JSONB, nullable=True),
        sa.Column(
            "created_at", sa.DateTime, server_default=sa.func.now(), nullable=True
        ),
        sa.Column(
            "updated_at",
            sa.DateTime,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=True,
        ),
    )

    # OAuth Authorization Codes table
    op.create_table(
        "oauth_authorization_codes",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column("code", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column(
            "client_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("oauth_clients.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("user_id", sa.String(255), nullable=False, index=True),
        sa.Column("redirect_uri", sa.String(2048), nullable=False),
        sa.Column("scope", sa.String(1024), nullable=False),
        sa.Column("code_challenge", sa.String(255), nullable=False),
        sa.Column(
            "code_challenge_method", sa.String(10), default="S256", nullable=False
        ),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("mcp_servers.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("is_used", sa.Boolean, default=False, nullable=False),
        sa.Column("state", sa.String(255), nullable=True),
        sa.Column(
            "created_at", sa.DateTime, server_default=sa.func.now(), nullable=True
        ),
        sa.Column(
            "updated_at",
            sa.DateTime,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=True,
        ),
    )

    # OAuth Access Tokens table
    op.create_table(
        "oauth_access_tokens",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "token_hash", sa.String(255), unique=True, nullable=False, index=True
        ),
        sa.Column("jti", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column(
            "client_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("oauth_clients.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("user_id", sa.String(255), nullable=False, index=True),
        sa.Column("scope", sa.String(1024), nullable=False),
        sa.Column("audience", sa.String(2048), nullable=True),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("mcp_servers.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("is_revoked", sa.Boolean, default=False, nullable=False),
        sa.Column(
            "created_at", sa.DateTime, server_default=sa.func.now(), nullable=True
        ),
        sa.Column(
            "updated_at",
            sa.DateTime,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=True,
        ),
    )

    # OAuth Refresh Tokens table
    op.create_table(
        "oauth_refresh_tokens",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "token_hash", sa.String(255), unique=True, nullable=False, index=True
        ),
        sa.Column(
            "client_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("oauth_clients.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("user_id", sa.String(255), nullable=False, index=True),
        sa.Column(
            "access_token_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("oauth_access_tokens.id", ondelete="SET NULL"),
            nullable=True,
            index=True,
        ),
        sa.Column("scope", sa.String(1024), nullable=False),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("mcp_servers.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("rotation_counter", sa.Integer, default=0, nullable=False),
        sa.Column("is_revoked", sa.Boolean, default=False, nullable=False),
        sa.Column(
            "created_at", sa.DateTime, server_default=sa.func.now(), nullable=True
        ),
        sa.Column(
            "updated_at",
            sa.DateTime,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Drop OAuth tables."""
    op.drop_table("oauth_refresh_tokens")
    op.drop_table("oauth_access_tokens")
    op.drop_table("oauth_authorization_codes")
    op.drop_table("oauth_clients")
