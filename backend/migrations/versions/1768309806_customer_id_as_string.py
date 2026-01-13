"""customer_id as string

Revision ID: e9e98a17062e
Revises: b2c3d4e5f6g7
Create Date: 2026-01-13 21:10:06.018582

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e9e98a17062e"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6g7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Drop FK constraint safely (if exists)
    op.execute(
        "ALTER TABLE mcp_servers DROP CONSTRAINT IF EXISTS mcp_servers_customer_id_fkey"
    )

    # 2. Alter column type from UUID to String
    # handling the cast safely
    op.execute(
        "ALTER TABLE mcp_servers ALTER COLUMN customer_id TYPE VARCHAR(255) USING customer_id::text"
    )


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Alter column back to UUID
    op.execute(
        "ALTER TABLE mcp_servers ALTER COLUMN customer_id TYPE UUID USING customer_id::uuid"
    )

    # 2. Recreate FK constraint
    op.create_foreign_key(
        "mcp_servers_customer_id_fkey",
        "mcp_servers",
        "customers",
        ["customer_id"],
        ["id"],
        ondelete="CASCADE",
    )
