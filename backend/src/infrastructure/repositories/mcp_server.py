from typing import Any
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from infrastructure.db import Database
from infrastructure.models.mcp_server import (
    MCPServer,
    MCPServerSetupStatus,
    MCPTool,
    MCPEnvironmentVariable,
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
    parameters_schema: list[dict]
    code: str = ""


class MCPToolUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    parameters_schema: list[dict] | None = None
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
                    selectinload(self.model.environment_variables),
                    selectinload(self.model.deployment),
                )
            )
            return list(result.scalars().all())

    async def update_setup_status(
        self, server_id: UUID, status: MCPServerSetupStatus
    ) -> bool:
        """Update server setup status."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == server_id)
            )
            server = result.scalars().first()
            if server:
                server.setup_status = status
                await session.commit()
                return True
            return False

    async def update_auth_type(self, server_id: UUID, auth_type: str) -> bool:
        """Update server auth type."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == server_id)
            )
            server = result.scalars().first()
            if server:
                server.auth_type = auth_type
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
                    selectinload(self.model.environment_variables),
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

    async def update_tool_code(self, tool_id: UUID, code: str) -> bool:
        """Update tool with generated code."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == tool_id)
            )
            tool = result.scalars().first()
            if tool:
                tool.code = code
                await session.commit()
                return True
            return False

    async def delete_tools_not_in_list(
        self, server_id: UUID, keep_tool_ids: list[UUID]
    ) -> int:
        """Delete all tools for server that are NOT in the keep list."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            count = 0
            for tool in result.scalars().all():
                if tool.id not in keep_tool_ids:
                    await session.delete(tool)
                    count += 1
            await session.commit()
            return count


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
    BaseCRUDRepo[
        MCPEnvironmentVariable,
        MCPEnvironmentVariableCreate,
        MCPEnvironmentVariableUpdate,
    ]
):
    def __init__(self, db: Database):
        super().__init__(db, MCPEnvironmentVariable)

    async def get_vars_for_server(
        self, server_id: UUID
    ) -> list[MCPEnvironmentVariable]:
        """Get all environment variables for a server."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            return list(result.scalars().all())

    async def update_value(self, var_id: UUID, value: str) -> bool:
        """Update the value of an environment variable."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == var_id)
            )
            var = result.scalars().first()
            if var:
                var.value = value
                await session.commit()
                return True
            return False

    async def delete_vars_for_server(self, server_id: UUID) -> int:
        """Delete all environment variables for a server."""
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.server_id == server_id)
            )
            count = 0
            for var in result.scalars().all():
                await session.delete(var)
                count += 1
            await session.commit()
            return count
