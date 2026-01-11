from asyncio import current_task
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from loguru import logger
from sqlalchemy import DateTime, func, literal, select
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_scoped_session,
    async_sessionmaker,
    create_async_engine,
)
from uuid import UUID, uuid4

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase, declarative_base, mapped_column, Mapped

from settings import settings


class CustomBase(AsyncAttrs, DeclarativeBase):
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now(), nullable=True)


Base = declarative_base(cls=CustomBase)


@dataclass
class Database:
    CONNECT_KWARGS = {
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "echo_pool": True,
    }

    def __init__(
        self,
        db_connect_url: str,
        db_alias: str,
        connect_kwargs: dict[str, Any],
        connect_args: dict[str, Any] | None = None,
        debug: bool = True,
    ) -> None:
        self._engine = create_async_engine(
            url=db_connect_url,
            echo=debug,
            **connect_kwargs,
            connect_args=connect_args or {},
        )
        logger.info(f"Database pool: {self._engine.pool}")
        self._db_alias = db_alias
        self._async_session = async_scoped_session(
            async_sessionmaker(
                autocommit=False,
                autoflush=False,
                class_=AsyncSession,
                expire_on_commit=False,
                bind=self._engine,
            ),
            scopefunc=current_task,
        )

    async def get_status(self) -> dict[str, str]:
        async with self.session() as session:
            db_status = await session.execute(
                select(  # type: ignore[call-overload,unused-ignore]
                    [
                        literal("ready").label("status"),
                        literal(self._db_alias).label("name"),
                    ],
                ),
            )
            return db_status.first()._asdict()  # type: ignore[union-attr,unused-ignore]

    @asynccontextmanager
    async def session(self, commit=True) -> AsyncGenerator[AsyncSession, None]:
        async with self._async_session() as session:
            try:
                yield session
                if commit:
                    await session.commit()
            except Exception as e:
                logger.warning(f"Session rollback because of exception {e}")
                await session.rollback()
                raise
            finally:
                await session.close()
                await self._async_session.remove()

    async def disconnect(self) -> None:
        await self._engine.dispose()


def create_database(**overrides) -> Database:
    kwargs = dict(
        db_connect_url=str(settings.ASYNC_DB_DSN),
        db_alias=settings.POSTGRES_DB,
        connect_kwargs=Database.CONNECT_KWARGS,
        connect_args={
            "server_settings": {"application_name": "my_app"},
        },
        debug=False,
    )
    kwargs.update(overrides)
    logger.info("Connected to the database")
    return Database(**kwargs)
