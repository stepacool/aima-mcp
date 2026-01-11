"""add mcp models

Revision ID: a1b2c3d4e5f6
Revises: 0e68f004f1ff
Create Date: 2026-01-11 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '0e68f004f1ff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # MCP Servers table
    op.create_table('mcp_servers',
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('customer_id', sa.UUID(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mcp_servers_customer_id'), 'mcp_servers', ['customer_id'], unique=False)

    # MCP Tools table
    op.create_table('mcp_tools',
        sa.Column('server_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('parameters_schema', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('code', sa.Text(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['server_id'], ['mcp_servers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mcp_tools_server_id'), 'mcp_tools', ['server_id'], unique=False)

    # MCP Prompts table
    op.create_table('mcp_prompts',
        sa.Column('server_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('template', sa.Text(), nullable=False),
        sa.Column('arguments', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['server_id'], ['mcp_servers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mcp_prompts_server_id'), 'mcp_prompts', ['server_id'], unique=False)

    # Chat Sessions table
    op.create_table('chat_sessions',
        sa.Column('server_id', sa.UUID(), nullable=False),
        sa.Column('messages', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['server_id'], ['mcp_servers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chat_sessions_server_id'), 'chat_sessions', ['server_id'], unique=False)

    # Deployment Artifacts table
    op.create_table('deployment_artifacts',
        sa.Column('server_id', sa.UUID(), nullable=False),
        sa.Column('artifact_type', sa.String(length=50), nullable=False),
        sa.Column('code', sa.Text(), nullable=False),
        sa.Column('config', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['server_id'], ['mcp_servers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_deployment_artifacts_server_id'), 'deployment_artifacts', ['server_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_deployment_artifacts_server_id'), table_name='deployment_artifacts')
    op.drop_table('deployment_artifacts')
    op.drop_index(op.f('ix_chat_sessions_server_id'), table_name='chat_sessions')
    op.drop_table('chat_sessions')
    op.drop_index(op.f('ix_mcp_prompts_server_id'), table_name='mcp_prompts')
    op.drop_table('mcp_prompts')
    op.drop_index(op.f('ix_mcp_tools_server_id'), table_name='mcp_tools')
    op.drop_table('mcp_tools')
    op.drop_index(op.f('ix_mcp_servers_customer_id'), table_name='mcp_servers')
    op.drop_table('mcp_servers')
