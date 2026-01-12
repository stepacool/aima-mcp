"""add tier and auth columns

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-01-12 21:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add tier and auth columns to mcp_servers, validation columns to mcp_tools."""
    # Add columns to mcp_servers
    op.add_column('mcp_servers', sa.Column('tier', sa.String(length=20), nullable=False, server_default='free'))
    op.add_column('mcp_servers', sa.Column('auth_type', sa.String(length=50), nullable=False, server_default='none'))
    op.add_column('mcp_servers', sa.Column('auth_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    # Add columns to mcp_tools
    op.add_column('mcp_tools', sa.Column('is_validated', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('mcp_tools', sa.Column('validation_errors', postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    """Remove tier and auth columns."""
    # Remove columns from mcp_tools
    op.drop_column('mcp_tools', 'validation_errors')
    op.drop_column('mcp_tools', 'is_validated')

    # Remove columns from mcp_servers
    op.drop_column('mcp_servers', 'auth_config')
    op.drop_column('mcp_servers', 'auth_type')
    op.drop_column('mcp_servers', 'tier')
