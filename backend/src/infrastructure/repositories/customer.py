from typing import Any
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select

from infrastructure.db import Database
from infrastructure.models.customer import Customer
from infrastructure.repositories.base import BaseCRUDRepo


class CustomerCreate(BaseModel):
    id: UUID | None = None
    name: str
    email: str | None = None
    meta: dict[str, Any] | None = None


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    meta: dict[str, Any] | None = None


class CustomerRepo(BaseCRUDRepo[Customer, CustomerCreate, CustomerUpdate]):
    def __init__(self, db: Database):
        super().__init__(db, Customer)

    async def get_by_name(self, name: str) -> Customer | None:
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.name == name)
            )
            return result.scalars().first()

    async def get_by_email(self, email: str) -> Customer | None:
        async with self.db.session() as session:
            result = await session.execute(
                select(self.model).where(self.model.email == email)
            )
            return result.scalars().first()
