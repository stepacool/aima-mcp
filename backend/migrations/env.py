import asyncio
from logging.config import fileConfig

from sqlalchemy import engine_from_config, Connection
from sqlalchemy import pool

from alembic import context
from sqlalchemy.ext.asyncio import AsyncEngine
import sys

sys.path.append("src")
from infrastructure import (
    db,  # type: ignore
    models,  # noqa type: ignore
)
from settings import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = db.CustomBase.metadata


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection, target_metadata=target_metadata, compare_type=True
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = str(settings.ASYNC_DB_DSN)
    connectable = AsyncEngine(
        engine_from_config(
            configuration,
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
            future=True,
        ),
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)


asyncio.run(run_migrations_online())
