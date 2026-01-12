from infrastructure.db import create_database, Database
from infrastructure.repositories.mcp_server import MCPServerRepo, MCPToolRepo


class Provider:
    _db: None | Database = None
    _mcp_server_repo: None | MCPServerRepo = None
    _mcp_tool_repo: None | MCPToolRepo = None

    @classmethod
    def get_db(cls, **overrides):
        if cls._db is None:
            cls._db = create_database(**overrides)
        return cls._db

    @classmethod
    async def disconnect(cls):
        if cls._db is None:
            return
        await cls._db.disconnect()

    @classmethod
    def mcp_server_repo(cls) -> MCPServerRepo:
        if cls._mcp_server_repo is None:
            cls._mcp_server_repo = MCPServerRepo(cls.get_db())
        return cls._mcp_server_repo

    @classmethod
    def mcp_tool_repo(cls) -> MCPToolRepo:
        if cls._mcp_tool_repo is None:
            cls._mcp_tool_repo = MCPToolRepo(cls.get_db())
        return cls._mcp_tool_repo
