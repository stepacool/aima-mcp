from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import APIKeyHeader
from starlette import status

from entrypoints.api.routes.customers import router as customers_router
from entrypoints.api.routes.servers import router as servers_router
from entrypoints.api.routes.wizard import router as wizard_router
from settings import settings

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)


async def verify_api_key(auth_header: str = Depends(api_key_header)):
    if not auth_header or auth_header != f"Bearer {settings.ADMIN_ROUTES_API_KEY}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return auth_header


if settings.DEBUG:
    dependencies = []
else:
    dependencies = [
        Depends(verify_api_key),
    ]


api_router = APIRouter(
    prefix="/api",
    dependencies=dependencies,
    include_in_schema=settings.DEBUG,
)

api_router.include_router(wizard_router, prefix="/wizard", tags=["wizard"])
api_router.include_router(servers_router, prefix="/servers", tags=["servers"])
api_router.include_router(customers_router, prefix="/customers", tags=["customers"])
