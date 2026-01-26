import datetime
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from infrastructure.db import CustomBase, Database

ModelType = TypeVar("ModelType", bound=CustomBase)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


def _utc_now() -> datetime.datetime:
    """Return current UTC time without timezone info (for DB storage)."""
    return datetime.datetime.now(datetime.UTC).replace(tzinfo=None)


class BaseRepo:
    def __init__(self, db: Database):
        self.db = db


class BaseCRUDRepo(BaseRepo, Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, db: Database, model: type[ModelType]):
        super().__init__(db)
        self.model = model

    def _prepare_payload(self, obj_in: CreateSchemaType) -> dict:
        payload = obj_in.model_dump()
        now = _utc_now()
        payload["created_at"] = now
        payload["updated_at"] = now
        return payload

    async def create(self, obj_in: CreateSchemaType) -> ModelType:
        async with self.db.session() as session:
            db_obj = self.model(**self._prepare_payload(obj_in))
            session.add(db_obj)
            await session.commit()
            await session.refresh(db_obj)
            return db_obj

    async def create_bulk(
        self,
        objs_in: list[CreateSchemaType],
        ignore_conflicts: bool = False,
    ) -> list[ModelType]:
        if not objs_in:
            return []

        async with self.db.session() as session:
            payloads = [self._prepare_payload(obj) for obj in objs_in]

            if ignore_conflicts:
                stmt = (
                    pg_insert(self.model)
                    .values(payloads)
                    .on_conflict_do_nothing()
                    .returning(self.model)
                )
                result = await session.execute(stmt)
                return list(result.scalars().all())

            db_objs = [self.model(**p) for p in payloads]
            session.add_all(db_objs)
            await session.commit()
            for db_obj in db_objs:
                await session.refresh(db_obj)
            return db_objs

    async def get(self, id: UUID) -> ModelType | None:
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == id)
            )
            return result.scalars().first()

    async def list(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by_created_desc: bool = False,
    ) -> list[ModelType]:
        async with self.db.session() as session:
            query = select(self.model).offset(skip).limit(limit)
            if order_by_created_desc:
                query = query.order_by(self.model.created_at.desc())
            result = await session.execute(query)
            return list(result.scalars().all())

    async def update(self, id: UUID, obj_in: UpdateSchemaType) -> ModelType | None:
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == id)
            )
            db_obj = result.scalars().first()
            if db_obj is None:
                return None

            for key, value in obj_in.model_dump(exclude_unset=True).items():
                setattr(db_obj, key, value)
            db_obj.updated_at = _utc_now()

            await session.commit()
            await session.refresh(db_obj)
            return db_obj

    async def delete(self, id: UUID) -> bool:
        async with self.db.session() as session:
            result = await session.execute(
                delete(self.model).where(self.model.id == id)
            )
            await session.commit()
            return result.rowcount > 0  # type: ignore[attr-defined]

    async def delete_cascade(self, id: UUID) -> bool:
        """Delete an object by ID with cascade deletes.

        This method loads the object first and deletes it through the ORM,
        which triggers cascade deletes defined in SQLAlchemy relationships
        (e.g., cascade="all, delete-orphan").
        """
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.id == id)
            )
            db_obj = result.scalars().first()
            if db_obj is None:
                return False

            # Delete through ORM to trigger cascade deletes
            await session.delete(db_obj)
            await session.commit()
            return True
