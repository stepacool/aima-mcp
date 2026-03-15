"""create_org_api_key_table

Revision ID: 43fca34e84af
Revises: d9b2c3e4f5a6
Create Date: 2026-03-15 17:46:54.951392

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "43fca34e84af"
down_revision: str | Sequence[str] | None = "d9b2c3e4f5a6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create api_key table in backend DB."""
    _ = op.create_table(
        "api_key",
        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("description", sa.String(length=70), nullable=False),
        sa.Column("hashed_key", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["customers.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_api_key_hashed_key"), "api_key", ["hashed_key"], unique=True
    )
    op.create_index(
        op.f("ix_api_key_organization_id"),
        "api_key",
        ["organization_id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop api_key table."""
    op.drop_index(op.f("ix_api_key_organization_id"), table_name="api_key")
    op.drop_index(op.f("ix_api_key_hashed_key"), table_name="api_key")
    op.drop_table("api_key")
