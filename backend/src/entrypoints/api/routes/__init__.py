from fastapi import APIRouter

from entrypoints.api.routes.customers import router as customers_router
from entrypoints.api.routes.servers import router as servers_router
from entrypoints.api.routes.wizard import router as wizard_router

api_router = APIRouter(prefix="/api")

api_router.include_router(wizard_router, prefix="/wizard", tags=["wizard"])
api_router.include_router(servers_router, prefix="/servers", tags=["servers"])
api_router.include_router(customers_router, prefix="/customers", tags=["customers"])
