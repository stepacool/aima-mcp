"""Rename api_keys table to static_api_keys for backward compatibility

Revision ID: c8a1b2d3e4f5
Revises: f2feae715014
Create Date: 2026-01-26 10:00:01.000000

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c8a1b2d3e4f5"
down_revision: Union[str, Sequence[str], None] = "f2feae715014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.rename_table("api_keys", "static_api_keys")
    # Rename index to match new table name
    op.execute("ALTER INDEX IF EXISTS ix_api_keys_key RENAME TO ix_static_api_keys_key")
    op.execute(
        "ALTER INDEX IF EXISTS ix_api_keys_server_id "
        "RENAME TO ix_static_api_keys_server_id"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.rename_table("static_api_keys", "api_keys")
    op.execute("ALTER INDEX IF EXISTS ix_static_api_keys_key RENAME TO ix_api_keys_key")
    op.execute(
        "ALTER INDEX IF EXISTS ix_static_api_keys_server_id "
        "RENAME TO ix_api_keys_server_id"
    )
