"""add gathering_requirements to setup status

Revision ID: b5d9a7c1e234
Revises: 43fca34e84af
Create Date: 2026-03-16

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b5d9a7c1e234"
down_revision: str | Sequence[str] | None = "43fca34e84af"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add gathering_requirements to mcpserversetupstatus enum."""
    op.execute(
        "ALTER TYPE mcpserversetupstatus ADD VALUE IF NOT EXISTS 'gathering_requirements' BEFORE 'tools_generating'"
    )


def downgrade() -> None:
    """Remove gathering_requirements from mcpserversetupstatus enum.

    Note: PostgreSQL doesn't support removing enum values directly.
    """
    # drop enum and create new one without gathering_requirements
    op.execute("DROP TYPE mcpserversetupstatus")
    op.execute(
        "CREATE TYPE mcpserversetupstatus AS ENUM ('tools_generating', 'env_vars_generating', 'auth_selection', 'code_generating', 'code_gen', 'deployment_selection', 'ready')"
    )
    pass
