"""add generating states to setup status

Revision ID: a3c8f5e7b123
Revises: 7da67e5f4972
Create Date: 2026-01-21

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a3c8f5e7b123"
down_revision: Union[str, Sequence[str], None] = "7da67e5f4972"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add new generating states to mcpserversetupstatus enum."""
    # Add new enum values for generating states
    # PostgreSQL requires ALTER TYPE to add new enum values
    op.execute(
        "ALTER TYPE mcpserversetupstatus ADD VALUE IF NOT EXISTS "
        "'tools_generating' BEFORE 'tools_selection'"
    )
    op.execute(
        "ALTER TYPE mcpserversetupstatus ADD VALUE IF NOT EXISTS "
        "'env_vars_generating' BEFORE 'env_vars_setup'"
    )
    op.execute(
        "ALTER TYPE mcpserversetupstatus ADD VALUE IF NOT EXISTS "
        "'code_generating' BEFORE 'code_gen'"
    )


def downgrade() -> None:
    """Remove generating states from mcpserversetupstatus enum.

    Note: PostgreSQL doesn't support removing enum values directly.
    This would require recreating the enum type and updating all references.
    For simplicity, we leave the enum values in place during downgrade.
    """
    # Removing enum values in PostgreSQL is complex and requires:
    # 1. Creating a new enum without the values
    # 2. Updating the column to use the new enum
    # 3. Dropping the old enum
    # For safety, we skip this in downgrade
    pass
