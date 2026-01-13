from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from infrastructure.db import Database
from infrastructure.models.deployment import (
    Deployment,
    DeploymentArtifact,
    DeploymentStatus,
    DeploymentTarget,
)
from infrastructure.repositories.base import BaseCRUDRepo


class DeploymentCreate(BaseModel):
    server_id: UUID
    target: str
    status: str = DeploymentStatus.PENDING.value
    endpoint_url: str | None = None
    target_config: dict[str, Any] | None = None


class DeploymentUpdate(BaseModel):
    status: str | None = None
    endpoint_url: str | None = None
    target_config: dict[str, Any] | None = None
    error_message: str | None = None
    deployed_at: datetime | None = None


class DeploymentArtifactCreate(BaseModel):
    deployment_id: UUID
    artifact_type: str
    files: dict[str, str]
    instructions: str
    code: str | None = None
    config: dict[str, Any] | None = None


class DeploymentArtifactUpdate(BaseModel):
    files: dict[str, str] | None = None
    instructions: str | None = None
    code: str | None = None
    config: dict[str, Any] | None = None


class DeploymentRepo(BaseCRUDRepo[Deployment, DeploymentCreate, DeploymentUpdate]):
    def __init__(self, db: Database):
        super().__init__(db, Deployment)

    async def get_by_uuid(self, deployment_id: UUID) -> Deployment | None:
        """Get deployment by UUID."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == deployment_id)
            )
            return result.scalars().first()

    async def get_by_server_id(self, server_id: UUID) -> Deployment | None:
        """Get deployment for a server."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            return result.scalars().first()

    async def get_active_shared_deployments(self) -> list[Deployment]:
        """Get all active SHARED deployments (for startup loading)."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model)
                .where(self.model.target == DeploymentTarget.SHARED.value)
                .where(self.model.status == DeploymentStatus.ACTIVE.value)
                .options(selectinload(self.model.server))
            )
            return list(result.scalars().all())

    async def get_with_server_and_tools(self, deployment_id: UUID) -> Deployment | None:
        """Get deployment with eager-loaded server and tools."""
        async with self.db.session() as session:
            from infrastructure.models.mcp_server import MCPServer

            result = await session.execute(
                select(self.model)
                .where(self.model.id == deployment_id)
                .options(selectinload(self.model.server).selectinload(MCPServer.tools))
            )
            return result.scalars().first()

    async def activate(
        self, deployment_id: UUID, endpoint_url: str | None = None
    ) -> bool:
        """Set deployment status to ACTIVE."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == deployment_id)
            )
            deployment = result.scalars().first()
            if deployment:
                deployment.status = DeploymentStatus.ACTIVE.value
                deployment.deployed_at = datetime.utcnow()
                if endpoint_url:
                    deployment.endpoint_url = endpoint_url
                await session.commit()
                return True
            return False

    async def deactivate(self, deployment_id: UUID) -> bool:
        """Set deployment status to DEACTIVATED."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == deployment_id)
            )
            deployment = result.scalars().first()
            if deployment:
                deployment.status = DeploymentStatus.DEACTIVATED.value
                await session.commit()
                return True
            return False

    async def mark_failed(self, deployment_id: UUID, error_message: str) -> bool:
        """Set deployment status to FAILED with error message."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == deployment_id)
            )
            deployment = result.scalars().first()
            if deployment:
                deployment.status = DeploymentStatus.FAILED.value
                deployment.error_message = error_message
                await session.commit()
                return True
            return False


class DeploymentArtifactRepo(
    BaseCRUDRepo[DeploymentArtifact, DeploymentArtifactCreate, DeploymentArtifactUpdate]
):
    def __init__(self, db: Database):
        super().__init__(db, DeploymentArtifact)

    async def get_by_deployment_id(
        self, deployment_id: UUID
    ) -> DeploymentArtifact | None:
        """Get artifact for a deployment."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.deployment_id == deployment_id)
            )
            return result.scalars().first()
