"""add meta column to mcp servers

Revision ID: 9f3318dd3fc2
Revises: e9e98a17062e
Create Date: 2026-01-15 03:39:49.957143

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision: str = "9f3318dd3fc2"
down_revision: Union[str, Sequence[str], None] = "e9e98a17062e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add meta JSONB column with empty object as default
    op.add_column(
        "mcp_servers",
        sa.Column(
            "meta",
            JSONB,
            nullable=False,
            server_default="{}",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("mcp_servers", "meta")
