"""Auth context and org-scoped access helpers."""

from dataclasses import dataclass
from uuid import UUID

from fastapi import HTTPException, Request
from infrastructure.repositories.repo_provider import Provider
from settings import settings
from starlette import status


@dataclass
class AuthContext:
    auth_type: str  # "admin" | "org"
    auth_org_id: UUID | None


def get_auth_context(request: Request) -> AuthContext:
    """Get auth context from request state (set by verify_api_key)."""
    auth_type = getattr(request.state, "auth_type", None)
    auth_org_id = getattr(request.state, "auth_org_id", None)
    if not auth_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return AuthContext(auth_type=auth_type, auth_org_id=auth_org_id)


async def require_org_access_to_server(server_id: UUID, request: Request) -> None:
    """Verify org auth has access to this server. No-op for admin auth or DEBUG."""
    if settings.DEBUG:
        return
    auth_type = getattr(request.state, "auth_type", None)
    auth_org_id = getattr(request.state, "auth_org_id", None)
    if auth_type == "admin":
        return
    if auth_type != "org" or not auth_org_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Organization access required",
        )
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found",
        )
    if server.customer_id != auth_org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this server",
        )


async def require_org_access_to_customer(customer_id: UUID, request: Request) -> None:
    """Verify org auth has access to this customer. No-op for admin auth or DEBUG."""
    if settings.DEBUG:
        return
    auth_type = getattr(request.state, "auth_type", None)
    auth_org_id = getattr(request.state, "auth_org_id", None)
    if auth_type == "admin":
        return
    if auth_type != "org" or not auth_org_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Organization access required",
        )
    if customer_id != auth_org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this organization",
        )
