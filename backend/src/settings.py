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
    ACCESS_TOKEN_LIFETIME: int = 36000  # 1 hour in seconds
    REFRESH_TOKEN_LIFETIME: int = 604800  # 7 days in seconds
    AUTH_CODE_LIFETIME: int = 600  # 10 minutes in seconds
    JWT_PRIVATE_KEY: str = """
-----BEGIN RSA PRIVATE KEY-----
MIICWgIBAAKBgHYb4YNsgYXy6/I6eKL/ZTgAjiyqNiNaaJcwSN51THgSU8oDe4/U
AVfy94eraURmTtzAdvUwDAwMiFrMBiPSfKKLA6ENLQjaqB3pQK+mKEX6rD12rvnb
XaHLDuO0bEuUW74xikJqOY4pDecpBtLdwhW5rDDT1S5ips2oseJ4xy0lAgMBAAEC
gYAm5PuY2gy1XdARjuvXUZ+1l4k6cDsv3UAAOehlSd+K0w5AwnDYZoqiueKGDQ63
dbGWxNLn35C4DxCARhvnhBOCxD/Dp3KnKegA9HLI4Keho27qFwTNZOsK12L2OM96
Svd/UCZaDNdOVF84In/Fg68yz/deaDsElt7WptCwbc/V6QJBAOhotGZHTNH+Wy+S
mZ7r8WeKQyzSgT/jn+PKKObbuOTtpf+tJ2fbzUvK+sG6UPKVpOWqv/8BptNpV2hO
JCscfWMCQQCCGQQNeVvB4dUtQ41K9cwIlMHsHoMq503ohzUfuQIoFxLQURZSUmxj
iqg/0vjTwATBAEAJc6c7UC92/DMKaFXXAkBLB/KlyoMMkJeTxjp+SiIHkWWahONh
YvVtrwiBb5JDpk2fO6GrMBUZURCflq0nhBRWaUfO5hOb0Th83i1jFbGNAkANvzDz
b4hnk0JgVwv+CLz3hyh6l7rKdMiBso/Fe1oj/FQrmPXf2v/DAOrIW7WZQmf+MNWT
ahoYpV9uljWaeu3fAkB+17FxG7exzLoTZX2m2W/cLz0rwo6V9Q9qoaZnp157l4gj
8mCkAfBC0AysnwIeMXRGnSioGFKSpaYkAQKc9fh+
-----END RSA PRIVATE KEY-----
"""  # RSA private key for RS256 signing (PEM format)
    JWT_PUBLIC_KEY: str = """
-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHYb4YNsgYXy6/I6eKL/ZTgAjiyq
NiNaaJcwSN51THgSU8oDe4/UAVfy94eraURmTtzAdvUwDAwMiFrMBiPSfKKLA6EN
LQjaqB3pQK+mKEX6rD12rvnbXaHLDuO0bEuUW74xikJqOY4pDecpBtLdwhW5rDDT
1S5ips2oseJ4xy0lAgMBAAE=
-----END PUBLIC KEY-----
"""  # RSA public key for RS256 verification (PEM format)
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
