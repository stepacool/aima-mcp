from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel, TypeAdapter

from infrastructure.repositories.customer import CustomerCreate
from infrastructure.repositories.repo_provider import Provider

router = APIRouter()


class CustomerDetail(BaseModel):
    id: UUID
    email: str | None
    name: str


@router.post("/", response_model=CustomerDetail, status_code=201)
async def create_customer(payload: CustomerCreate):
    response = await Provider.customer_repo().create(payload)
    return TypeAdapter(CustomerDetail).validate_python(response, from_attributes=True)
