from typing import Any
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from infrastructure.db import Database
from infrastructure.models.mcp_server import (
    MCPServer,
    MCPServerStatus,
    MCPTool,
    ProcessingStatus,
    WizardStep, MCPEnvironmentVariable,
)
from infrastructure.repositories.base import BaseCRUDRepo


class MCPServerCreate(BaseModel):
    name: str
    description: str | None = None
    customer_id: UUID
    auth_type: str = "none"
    auth_config: dict[str, Any] | None = None
    meta: dict[str, Any] | None = None


class MCPServerUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    auth_type: str | None = None
    auth_config: dict[str, Any] | None = None
    meta: dict[str, Any] | None = None


class MCPToolCreate(BaseModel):
    server_id: UUID
    name: str
    description: str
    parameters_schema: dict[str, Any]
    code: str = ""


class MCPToolUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    parameters_schema: dict[str, Any] | None = None
    code: str | None = None


class MCPServerRepo(BaseCRUDRepo[MCPServer, MCPServerCreate, MCPServerUpdate]):
    def __init__(self, db: Database):
        super().__init__(db, MCPServer)

    async def get_by_uuid(self, server_id: UUID) -> MCPServer | None:
        """Get server by UUID."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == server_id)
            )
            return result.scalars().first()

    async def get_with_tools(self, server_id: UUID) -> MCPServer | None:
        """Get server with eager-loaded tools."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model)
                .where(self.model.id == server_id)
                .options(
                    selectinload(self.model.tools),
                    selectinload(self.model.deployment),
                )
            )
            return result.scalars().first()

    async def get_with_deployment(self, server_id: UUID) -> MCPServer | None:
        """Get server with eager-loaded deployment."""
        from infrastructure.models.mcp_server import MCPServer

        async with self.db.session() as session:
            result = await session.execute(
                select(self.model)
                .where(self.model.id == server_id)
                .options(selectinload(MCPServer.deployment))
            )
            return result.scalars().first()

    async def get_by_customer(self, customer_id: UUID) -> list[MCPServer]:
        """Get all servers for a customer."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.customer_id == customer_id)
            )
            return list(result.scalars().all())

    async def get_by_customer_with_stats(self, customer_id: UUID) -> list[MCPServer]:
        """Get all servers for a customer with tool counts and deployment status."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model)
                .where(self.model.customer_id == customer_id)
                .options(
                    selectinload(self.model.tools),
                    selectinload(self.model.deployment),
                )
            )
            return list(result.scalars().all())

    async def update_status(self, server_id: UUID, status: MCPServerStatus) -> bool:
        """Update server status."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == server_id)
            )
            server = result.scalars().first()
            if server:
                server.status = status.value
                await session.commit()
                return True
            return False

    async def update_wizard_step(self, server_id: UUID, step: WizardStep) -> bool:
        """Update wizard step in server meta."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == server_id)
            )
            server = result.scalars().first()
            if server:
                # Update meta with wizard_step
                new_meta = {**(server.meta or {}), "wizard_step": step.value}
                server.meta = new_meta
                await session.commit()
                return True
            return False

    async def update_processing_status(
        self,
        server_id: UUID,
        status: ProcessingStatus,
        error: str | None = None,
    ) -> bool:
        """Update processing status in server meta."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == server_id)
            )
            server = result.scalars().first()
            if server:
                new_meta = {
                    **(server.meta or {}),
                    "processing_status": status.value,
                }
                # Clear error if not failed, set error if failed
                if status == ProcessingStatus.FAILED and error:
                    new_meta["processing_error"] = error
                elif status != ProcessingStatus.FAILED:
                    new_meta.pop("processing_error", None)
                server.meta = new_meta
                await session.commit()
                return True
            return False

    async def update_wizard_step_with_status(
        self,
        server_id: UUID,
        step: WizardStep,
        status: ProcessingStatus,
        error: str | None = None,
    ) -> bool:
        """Update both wizard step and processing status atomically."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == server_id)
            )
            server = result.scalars().first()
            if server:
                new_meta = {
                    **(server.meta or {}),
                    "wizard_step": step.value,
                    "processing_status": status.value,
                }
                # Clear error if not failed, set error if failed
                if status == ProcessingStatus.FAILED and error:
                    new_meta["processing_error"] = error
                elif status != ProcessingStatus.FAILED:
                    new_meta.pop("processing_error", None)
                server.meta = new_meta
                await session.commit()
                return True
            return False

    async def get_with_full_details(self, server_id: UUID) -> MCPServer | None:
        """Get server with all related data (tools, prompts, deployment)."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model)
                .where(self.model.id == server_id)
                .options(
                    selectinload(self.model.tools),
                    selectinload(self.model.prompts),
                    selectinload(self.model.deployment),
                )
            )
            return result.scalars().first()


class MCPToolRepo(BaseCRUDRepo[MCPTool, MCPToolCreate, MCPToolUpdate]):
    def __init__(self, db: Database):
        super().__init__(db, MCPTool)

    async def get_by_uuid(self, tool_id: UUID) -> MCPTool | None:
        """Get tool by UUID."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == tool_id)
            )
            return result.scalars().first()

    async def get_tools_for_server(self, server_id: UUID) -> list[MCPTool]:
        """Get all tools for a server."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            return list(result.scalars().all())

    async def delete_tools_for_server(self, server_id: UUID) -> int:
        """Delete all tools for a server. Returns count of deleted tools."""
        async with self.db.session() as session:
            tools = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            count = 0
            for tool in tools.scalars().all():
                await session.delete(tool)
                count += 1
            await session.commit()
            return count

    async def update_tool_code(
        self, tool_id: UUID, code: str, is_validated: bool = True
    ) -> bool:
        """Update tool with generated code."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == tool_id)
            )
            tool = result.scalars().first()
            if tool:
                tool.code = code
                tool.is_validated = is_validated
                tool.validation_errors = None
                await session.commit()
                return True
            return False


class MCPEnvironmentVariableCreate(BaseModel):
    server_id: UUID
    name: str
    description: str
    value: str | None = None


class MCPEnvironmentVariableUpdate(BaseModel):
    name: str
    description: str
    value: str


class MCPEnvironmentVariableRepo(
    BaseCRUDRepo[MCPEnvironmentVariable, MCPEnvironmentVariableCreate, MCPEnvironmentVariableUpdate]
):
    def __init__(self, db: Database):
        super().__init__(db, MCPEnvironmentVariable)
