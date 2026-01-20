import asyncio
import sys
from pathlib import Path
from typing import AsyncGenerator, Type

import pytest
from dotenv import load_dotenv
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy_utils import create_database, database_exists

test_env_path = Path(__file__).parent / ".env.test"
load_dotenv(test_env_path, override=True)

if "settings" in sys.modules:
    del sys.modules["settings"]
# WARNING: imports from code strictly below (must be after settings reset)
from infrastructure.db import CustomBase, Database  # noqa: E402
from infrastructure.db import create_database as create_db_object  # noqa: E402
from infrastructure.repositories.repo_provider import Provider  # noqa: E402
from settings import Settings, settings  # noqa: E402

# Import fixtures from fixtures.py to make them available
from fixtures import (  # noqa: E402, F401
    api_client,
    app,
    customer,
    mcp_server,
    mcp_tool,
    active_mcp_server,
    active_mcp_tool,
)


def _validate_test_database():
    """Safety check that runs at import time."""
    if not settings.POSTGRES_DB.startswith("test"):
        raise RuntimeError(
            f"FATAL: Test database name must start with 'test', got: {settings.POSTGRES_DB!r}. "
            f"This is a safety check to prevent running tests against production/dev databases."
        )
    if "prod" in settings.POSTGRES_HOST.lower():
        raise RuntimeError(
            f"FATAL: Tests appear to be configured against production: {settings.POSTGRES_HOST}"
        )


_validate_test_database()


@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """Provide access to the test settings instance."""
    # Double-check at fixture time too
    assert settings.POSTGRES_DB.startswith("test"), "Database must start with 'test'"
    return settings


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def async_db_engine(test_settings: Settings) -> AsyncGenerator[AsyncEngine, None]:
    """Create a fresh database for each test function."""

    # Safety checks
    db_name = test_settings.POSTGRES_DB
    async_dsn = str(test_settings.ASYNC_DB_DSN)
    sync_dsn = str(test_settings.SYNC_DB_DSN)

    if not db_name.startswith("test"):
        raise ValueError(f"WRONG DATABASE: {db_name} doesn't start with 'test'")

    if "test" not in async_dsn:
        raise ValueError(f"WRONG DSN: {async_dsn} doesn't start with 'test'")

    logger.info(f"Setting up test database: {db_name} on {test_settings.POSTGRES_HOST}")

    connect_kwargs = {**Database.CONNECT_KWARGS, "pool_size": 10}
    async_engine = create_async_engine(url=async_dsn, **connect_kwargs)

    # Create or reset database
    if database_exists(sync_dsn):
        logger.warning(f"Test database {db_name} exists, dropping tables")
        async with async_engine.begin() as conn:
            await conn.run_sync(CustomBase.metadata.drop_all)
    else:
        logger.info(f"Creating test database {db_name}")
        create_database(sync_dsn)

    async with async_engine.begin() as conn:
        await conn.run_sync(CustomBase.metadata.create_all)

    yield async_engine

    # Cleanup
    async with async_engine.begin() as conn:
        await conn.run_sync(CustomBase.metadata.drop_all)
    await async_engine.dispose()


@pytest.fixture
async def test_db(
    async_db_engine: AsyncEngine, test_settings: Settings
) -> AsyncGenerator[Database, None]:
    """Provide a Database instance connected to the test database."""
    db = create_db_object(
        db_connect_url=str(test_settings.ASYNC_DB_DSN),
        db_alias=test_settings.POSTGRES_DB,
    )
    yield db
    await db.disconnect()


@pytest.fixture
async def provider(
    async_db_engine: AsyncEngine,
) -> AsyncGenerator[Type[Provider], None]:
    Provider.get_db()
    yield Provider
    await Provider.disconnect()
