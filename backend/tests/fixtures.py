from typing import Type

import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from entrypoints.api.main import get_app
from infrastructure.models import Customer
from infrastructure.repositories.customer import CustomerCreate
from infrastructure.repositories.repo_provider import Provider


@pytest.fixture
async def customer(provider: Type[Provider]) -> Customer:
    customer = await Provider.customer_repo().create(
        CustomerCreate(
            name="test customer",
            email="test@aimalabs.io",
            meta={"eggs": "spam"},
        )
    )
    return customer


@pytest.fixture()
def app(provider: Provider) -> FastAPI:
    return get_app()


@pytest.fixture()
async def api_client(
    app: FastAPI,
) -> AsyncClient:
    """Generic API client for testing admin endpoints."""
    transport = ASGITransport(app=app, client=("1.2.3.4", 123))
    headers = {"C-Authorization": "TEST TOKEN"}
    return AsyncClient(transport=transport, base_url="http://test", headers=headers)
