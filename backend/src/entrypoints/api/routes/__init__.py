from fastapi import APIRouter

from entrypoints.api.routes.chat import router as chat_router
from entrypoints.api.routes.servers import router as servers_router

api_router = APIRouter(prefix="/api")

api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
api_router.include_router(servers_router, prefix="/servers", tags=["servers"])
