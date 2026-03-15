"""Organization API key CRUD routes (admin or org key; org key scoped to own org)."""

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Request
from infrastructure.repositories.repo_provider import Provider
from pydantic import BaseModel
from starlette import status

router = APIRouter()


def _require_org_access(organization_id: UUID, request: Request) -> None:
    """When org auth, organization_id must match auth_org_id."""
    auth_type = getattr(request.state, "auth_type", None)
    auth_org_id = getattr(request.state, "auth_org_id", None)
    if auth_type == "admin":
        return
    if auth_type == "org" and auth_org_id and organization_id == auth_org_id:
        return
    if auth_type == "org":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this organization",
        )


class CreateApiKeyRequest(BaseModel):
    organization_id: UUID
    description: str
    never_expires: bool = True
    expires_at: datetime | None = None


class CreateApiKeyResponse(BaseModel):
    api_key: str


class ApiKeyItem(BaseModel):
    id: str
    description: str
    last_used_at: datetime | None
    expires_at: datetime | None


class ListApiKeysResponse(BaseModel):
    api_keys: list[ApiKeyItem]


class UpdateApiKeyRequest(BaseModel):
    organization_id: UUID
    description: str
    never_expires: bool = True
    expires_at: datetime | None = None


@router.post("/", response_model=CreateApiKeyResponse, status_code=201)
async def create_api_key(
    body: CreateApiKeyRequest, request: Request
) -> CreateApiKeyResponse:
    _require_org_access(body.organization_id, request)
    """Create a new organization API key. Returns plain key once."""
    customer_repo = Provider.customer_repo()
    customer = await customer_repo.get(body.organization_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    expires_at = None if body.never_expires else body.expires_at
    _, plain_key = await Provider.org_api_key_repo().create(
        organization_id=body.organization_id,
        description=body.description,
        expires_at=expires_at,
    )
    return CreateApiKeyResponse(api_key=plain_key)


@router.get("/", response_model=ListApiKeysResponse)
async def list_api_keys(
    request: Request,
    organization_id: UUID = Query(..., description="Organization ID"),
) -> ListApiKeysResponse:
    _require_org_access(organization_id, request)
    """List API keys for an organization."""
    keys = await Provider.org_api_key_repo().list_by_organization(organization_id)
    return ListApiKeysResponse(
        api_keys=[
            ApiKeyItem(
                id=k["id"],
                description=k["description"],
                last_used_at=k["last_used_at"],
                expires_at=k["expires_at"],
            )
            for k in keys
        ]
    )


@router.patch("/{key_id}")
async def update_api_key(
    key_id: UUID,
    body: UpdateApiKeyRequest,
    request: Request,
) -> dict[str, str]:
    _require_org_access(body.organization_id, request)
    """Update an API key's description and expiry."""
    expires_at = None if body.never_expires else body.expires_at
    updated = await Provider.org_api_key_repo().update(
        key_id=key_id,
        organization_id=body.organization_id,
        description=body.description,
        expires_at=expires_at,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
    return {"status": "updated"}


@router.delete("/{key_id}")
async def revoke_api_key(
    request: Request,
    key_id: UUID,
    organization_id: UUID = Query(..., description="Organization ID"),
) -> dict[str, str]:
    _require_org_access(organization_id, request)
    """Revoke (delete) an API key."""
    deleted = await Provider.org_api_key_repo().delete(
        key_id=key_id,
        organization_id=organization_id,
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
    return {"status": "revoked"}
