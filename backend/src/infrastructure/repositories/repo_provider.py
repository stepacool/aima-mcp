from infrastructure.db import create_database, Database
from infrastructure.repositories.customer import CustomerRepo, StaticAPIKeyRepo
from infrastructure.repositories.deployment import (
    DeploymentArtifactRepo,
    DeploymentRepo,
)
from infrastructure.repositories.mcp_server import (
    MCPEnvironmentVariableRepo,
    MCPServerRepo,
    MCPToolRepo,
)
from infrastructure.repositories.oauth import (
    OAuthAccessTokenRepo,
    OAuthAuthorizationCodeRepo,
    OAuthClientRepo,
    OAuthRefreshTokenRepo,
)


class Provider:
    _db: None | Database = None
    _mcp_server_repo: None | MCPServerRepo = None
    _mcp_tool_repo: None | MCPToolRepo = None
    _customer_repo: None | CustomerRepo = None
    _deployment_repo: None | DeploymentRepo = None
    _deployment_artifact_repo: None | DeploymentArtifactRepo = None
    _environment_variable_repo: None | MCPEnvironmentVariableRepo = None
    _static_api_key_repo: None | StaticAPIKeyRepo = None
    _oauth_client_repo: None | OAuthClientRepo = None
    _oauth_authorization_code_repo: None | OAuthAuthorizationCodeRepo = None
    _oauth_access_token_repo: None | OAuthAccessTokenRepo = None
    _oauth_refresh_token_repo: None | OAuthRefreshTokenRepo = None

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

    @classmethod
    def customer_repo(cls) -> CustomerRepo:
        if cls._customer_repo is None:
            cls._customer_repo = CustomerRepo(cls.get_db())
        return cls._customer_repo

    @classmethod
    def deployment_repo(cls) -> DeploymentRepo:
        if cls._deployment_repo is None:
            cls._deployment_repo = DeploymentRepo(cls.get_db())
        return cls._deployment_repo

    @classmethod
    def deployment_artifact_repo(cls) -> DeploymentArtifactRepo:
        if cls._deployment_artifact_repo is None:
            cls._deployment_artifact_repo = DeploymentArtifactRepo(cls.get_db())
        return cls._deployment_artifact_repo

    @classmethod
    def environment_variable_repo(cls) -> MCPEnvironmentVariableRepo:
        if cls._environment_variable_repo is None:
            cls._environment_variable_repo = MCPEnvironmentVariableRepo(cls.get_db())
        return cls._environment_variable_repo

    @classmethod
    def static_api_key_repo(cls) -> StaticAPIKeyRepo:
        if cls._static_api_key_repo is None:
            cls._static_api_key_repo = StaticAPIKeyRepo(cls.get_db())
        return cls._static_api_key_repo

    @classmethod
    def oauth_client_repo(cls) -> OAuthClientRepo:
        if cls._oauth_client_repo is None:
            cls._oauth_client_repo = OAuthClientRepo(cls.get_db())
        return cls._oauth_client_repo

    @classmethod
    def oauth_authorization_code_repo(cls) -> OAuthAuthorizationCodeRepo:
        if cls._oauth_authorization_code_repo is None:
            cls._oauth_authorization_code_repo = OAuthAuthorizationCodeRepo(
                cls.get_db()
            )
        return cls._oauth_authorization_code_repo

    @classmethod
    def oauth_access_token_repo(cls) -> OAuthAccessTokenRepo:
        if cls._oauth_access_token_repo is None:
            cls._oauth_access_token_repo = OAuthAccessTokenRepo(cls.get_db())
        return cls._oauth_access_token_repo

    @classmethod
    def oauth_refresh_token_repo(cls) -> OAuthRefreshTokenRepo:
        if cls._oauth_refresh_token_repo is None:
            cls._oauth_refresh_token_repo = OAuthRefreshTokenRepo(cls.get_db())
        return cls._oauth_refresh_token_repo
