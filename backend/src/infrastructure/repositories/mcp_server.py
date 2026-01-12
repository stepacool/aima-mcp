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
)
from infrastructure.repositories.base import BaseCRUDRepo


class MCPServerCreate(BaseModel):
    name: str
    description: str | None = None
    customer_id: UUID
    tier: str = "free"
    auth_type: str = "none"
    auth_config: dict[str, Any] | None = None


class MCPServerUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    tier: str | None = None
    auth_type: str | None = None
    auth_config: dict[str, Any] | None = None


class MCPToolCreate(BaseModel):
    server_id: UUID
    name: str
    description: str
    parameters_schema: dict[str, Any]
    code: str = ""
    is_validated: bool = False
    validation_errors: list[str] | None = None


class MCPToolUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    parameters_schema: dict[str, Any] | None = None
    code: str | None = None
    is_validated: bool | None = None
    validation_errors: list[str] | None = None


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
                .options(selectinload(self.model.tools))
            )
            return result.scalars().first()

    async def get_all_active(self) -> list[MCPServer]:
        """Get all servers with status=ACTIVE (free tier deployed)."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model)
                .where(self.model.status == MCPServerStatus.ACTIVE.value)
                .options(selectinload(self.model.tools))
            )
            return list(result.scalars().all())

    async def get_by_customer(self, customer_id: UUID) -> list[MCPServer]:
        """Get all servers for a customer."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.customer_id == customer_id)
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
