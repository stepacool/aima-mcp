"""add deployment model

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2026-01-13 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6g7h8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6g7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add deployment model and migrate existing data."""
    # 1. Create deployments table
    op.create_table('deployments',
        sa.Column('server_id', sa.UUID(), nullable=False),
        sa.Column('target', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('endpoint_url', sa.String(length=500), nullable=True),
        sa.Column('target_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('deployed_at', sa.DateTime(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['server_id'], ['mcp_servers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('server_id')
    )
    op.create_index('ix_deployments_server_id', 'deployments', ['server_id'], unique=True)
    op.create_index('ix_deployments_status', 'deployments', ['status'], unique=False)

    # 2. Migrate existing ACTIVE servers to deployments (free tier -> SHARED)
    op.execute("""
        INSERT INTO deployments (id, server_id, target, status, endpoint_url, created_at, updated_at, deployed_at)
        SELECT
            gen_random_uuid(),
            id,
            'shared',
            'active',
            '/mcp/' || id::text,
            NOW(),
            NOW(),
            NOW()
        FROM mcp_servers
        WHERE status = 'active'
    """)

    # 3. Migrate DEPLOYED servers (paid tier)
    op.execute("""
        INSERT INTO deployments (id, server_id, target, status, created_at, updated_at, deployed_at)
        SELECT
            gen_random_uuid(),
            id,
            'standalone',
            'active',
            NOW(),
            NOW(),
            NOW()
        FROM mcp_servers
        WHERE status = 'deployed' AND id NOT IN (SELECT server_id FROM deployments)
    """)

    # 4. Add new columns to deployment_artifacts
    op.add_column('deployment_artifacts',
        sa.Column('deployment_id', sa.UUID(), nullable=True))
    op.add_column('deployment_artifacts',
        sa.Column('files', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('deployment_artifacts',
        sa.Column('instructions', sa.Text(), nullable=True))

    # 5. Link existing artifacts to deployments
    op.execute("""
        UPDATE deployment_artifacts da
        SET deployment_id = d.id
        FROM deployments d
        WHERE da.server_id = d.server_id
    """)

    # 6. Delete orphaned artifacts (those without a deployment)
    op.execute("""
        DELETE FROM deployment_artifacts WHERE deployment_id IS NULL
    """)

    # 7. Make deployment_id required and add FK constraint
    op.alter_column('deployment_artifacts', 'deployment_id', nullable=False)
    op.create_foreign_key(
        'fk_deployment_artifacts_deployment_id',
        'deployment_artifacts', 'deployments',
        ['deployment_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_index('ix_deployment_artifacts_deployment_id',
        'deployment_artifacts', ['deployment_id'], unique=True)

    # 8. Drop old server_id FK from deployment_artifacts
    op.drop_constraint('deployment_artifacts_server_id_fkey',
        'deployment_artifacts', type_='foreignkey')
    op.drop_index('ix_deployment_artifacts_server_id', table_name='deployment_artifacts')
    op.drop_column('deployment_artifacts', 'server_id')

    # 9. Update mcp_servers status values (active/deployed -> ready)
    op.execute("""
        UPDATE mcp_servers
        SET status = 'ready'
        WHERE status IN ('active', 'deployed')
    """)

    # 10. Remove tier column from mcp_servers
    op.drop_column('mcp_servers', 'tier')


def downgrade() -> None:
    """Reverse the deployment model migration."""
    # Add tier column back
    op.add_column('mcp_servers',
        sa.Column('tier', sa.String(length=20), nullable=False, server_default='free'))

    # Add server_id back to deployment_artifacts
    op.add_column('deployment_artifacts',
        sa.Column('server_id', sa.UUID(), nullable=True))

    # Restore server_id from deployments
    op.execute("""
        UPDATE deployment_artifacts da
        SET server_id = d.server_id
        FROM deployments d
        WHERE da.deployment_id = d.id
    """)

    # Restore mcp_servers status and tier from deployments
    op.execute("""
        UPDATE mcp_servers ms
        SET status = 'active', tier = 'free'
        FROM deployments d
        WHERE ms.id = d.server_id AND d.target = 'shared' AND d.status = 'active'
    """)

    op.execute("""
        UPDATE mcp_servers ms
        SET status = 'deployed', tier = 'paid'
        FROM deployments d
        WHERE ms.id = d.server_id AND d.target != 'shared' AND d.status = 'active'
    """)

    # Clean up deployment_artifacts FKs
    op.drop_index('ix_deployment_artifacts_deployment_id', table_name='deployment_artifacts')
    op.drop_constraint('fk_deployment_artifacts_deployment_id',
        'deployment_artifacts', type_='foreignkey')
    op.drop_column('deployment_artifacts', 'instructions')
    op.drop_column('deployment_artifacts', 'files')
    op.drop_column('deployment_artifacts', 'deployment_id')

    # Restore old server_id FK
    op.alter_column('deployment_artifacts', 'server_id', nullable=False)
    op.create_foreign_key(
        'deployment_artifacts_server_id_fkey',
        'deployment_artifacts', 'mcp_servers',
        ['server_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_index('ix_deployment_artifacts_server_id',
        'deployment_artifacts', ['server_id'], unique=False)

    # Drop deployments table
    op.drop_index('ix_deployments_status', table_name='deployments')
    op.drop_index('ix_deployments_server_id', table_name='deployments')
    op.drop_table('deployments')
