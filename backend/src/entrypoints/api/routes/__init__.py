from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import APIKeyHeader
from infrastructure.repositories.repo_provider import Provider
from settings import settings
from starlette import status

from entrypoints.api.routes.api_keys import router as api_keys_router
from entrypoints.api.routes.customers import router as customers_router
from entrypoints.api.routes.servers import router as servers_router
from entrypoints.api.routes.wizard import router as wizard_router

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)


def _extract_bearer_token(auth_header: str | None) -> str | None:
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header[7:].strip() or None


async def verify_api_key(
    request: Request, auth_header: str | None = Depends(api_key_header)
):
    """Accept admin key or org API key. Sets request.state.auth_type and auth_org_id."""
    token = _extract_bearer_token(auth_header)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    if token == settings.ADMIN_ROUTES_API_KEY:
        request.state.auth_type = "admin"
        request.state.auth_org_id = None
        return
    org_id = await Provider.org_api_key_repo().verify(token)
    if org_id is not None:
        request.state.auth_type = "org"
        request.state.auth_org_id = org_id
        return
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API key",
    )


async def require_admin(request: Request):
    """Require admin auth. Use on api_keys routes."""
    auth_type = getattr(request.state, "auth_type", None)
    if auth_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin API key required",
        )


async def require_admin_or_org_api_keys(request: Request):
    """Allow admin or org key. Org key can only manage their own org's keys (enforced per-route)."""
    auth_type = getattr(request.state, "auth_type", None)
    if auth_type in ("admin", "org"):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin or organization API key required",
    )


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

api_router.include_router(
    api_keys_router,
    prefix="/api-keys",
    dependencies=[] if settings.DEBUG else [Depends(require_admin_or_org_api_keys)],
    tags=["api-keys"],
)
api_router.include_router(wizard_router, prefix="/wizard", tags=["wizard"])
api_router.include_router(servers_router, prefix="/servers", tags=["servers"])
api_router.include_router(customers_router, prefix="/customers", tags=["customers"])
