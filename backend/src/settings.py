from pathlib import Path

from pydantic import AnyUrl, field_validator
from pydantic_core.core_schema import ValidationInfo, FieldValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR: Path = Path(__file__).resolve().parent


class AppSettings(BaseSettings):
    DEBUG: bool = True
    PORT: int = 8000
    ADMIN_ROUTES_API_KEY: str = "API_KEY_SECURITY"


class OAuthSettings(BaseSettings):
    """OAuth 2.1 configuration settings."""

    OAUTH_ISSUER: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    ACCESS_TOKEN_LIFETIME: int = 3600  # 1 hour in seconds
    REFRESH_TOKEN_LIFETIME: int = 604800  # 7 days in seconds
    AUTH_CODE_LIFETIME: int = 600  # 10 minutes in seconds
    JWT_PRIVATE_KEY: str = ""  # RSA private key for RS256 signing (PEM format)
    JWT_PUBLIC_KEY: str = ""  # RSA public key for RS256 verification (PEM format)
    JWT_ALGORITHM: str = "RS256"
    OAUTH_SCOPES: str = "mcp:access"  # Space-separated scopes


class MonitoringSettings(BaseSettings):
    LOGFIRE_TOKEN: str = ""


class LLMSettings(BaseSettings):
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    DEFAULT_MODEL: str = "google/gemini-3-pro-preview"


class PostgresSettings(BaseSettings):
    """
    docker run --name postgres-test -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=test_aimalabs_database -p 5432:5432 -d postgres:latest
    """

    POSTGRES_HOST: str = "0.0.0.0"
    POSTGRES_PORT: int = 5433
    POSTGRES_USER: str = "myuser"
    POSTGRES_PASSWORD: str = "mypassword"
    POSTGRES_DB: str = "test_aimalabs_database"

    ASYNC_DB_DSN: AnyUrl | str | None = None
    SYNC_DB_DSN: AnyUrl | str | None = None

    @staticmethod
    def _make_db_uri(
        scheme: str, value: str | None, values: ValidationInfo
    ) -> AnyUrl | str:
        if isinstance(value, str):
            return value
        return AnyUrl.build(
            scheme=scheme,
            username=values.data.get("POSTGRES_USER"),
            password=values.data.get("POSTGRES_PASSWORD"),
            host=values.data.get("POSTGRES_HOST"),  # type: ignore[arg-type]
            port=values.data.get("POSTGRES_PORT"),
            path=f"{values.data.get('POSTGRES_DB') or ''}",
        )

    @field_validator("ASYNC_DB_DSN", mode="before")
    @classmethod
    def async_postgres_dsn(
        cls, v: str | None, values: FieldValidationInfo
    ) -> AnyUrl | str:
        return cls._make_db_uri(scheme="postgresql+asyncpg", value=v, values=values)

    @field_validator("SYNC_DB_DSN", mode="before")
    @classmethod
    def sync_postgres_dsn(
        cls, v: str | None, values: FieldValidationInfo
    ) -> AnyUrl | str:
        return cls._make_db_uri(scheme="postgresql", value=v, values=values)


class Settings(
    AppSettings,
    OAuthSettings,
    MonitoringSettings,
    LLMSettings,
    PostgresSettings,
    BaseSettings,
):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR.parent / ".env"),
        env_file_encoding="utf-8",
        extra="allow",
    )


settings = Settings()
