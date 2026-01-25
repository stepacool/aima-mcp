"""OAuth 2.1 API routes for MCP server authentication."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import BaseModel

from core.services.oauth_service import (
    InvalidClientError,
    InvalidGrantError,
    InvalidRequestError,
    InvalidScopeError,
    OAuthError,
    UnauthorizedClientError,
    oauth_service,
)
from settings import settings

# Router for well-known endpoints (mounted at root level, no /api prefix)
well_known_router = APIRouter(tags=["oauth-metadata"])

# Router for OAuth endpoints (mounted at /oauth)
oauth_router = APIRouter(prefix="/oauth", tags=["oauth"])


# ============================================================================
# Request/Response Models
# ============================================================================


class ProtectedResourceMetadata(BaseModel):
    """RFC 9728 Protected Resource Metadata."""

    resource: str
    authorization_servers: list[str]
    scopes_supported: list[str]
    bearer_methods_supported: list[str]


class AuthorizationServerMetadata(BaseModel):
    """RFC 8414 Authorization Server Metadata."""

    issuer: str
    authorization_endpoint: str
    token_endpoint: str
    registration_endpoint: str
    scopes_supported: list[str]
    response_types_supported: list[str]
    grant_types_supported: list[str]
    code_challenge_methods_supported: list[str]
    token_endpoint_auth_methods_supported: list[str]


class ClientRegistrationRequest(BaseModel):
    """RFC 7591 Dynamic Client Registration Request."""

    redirect_uris: list[str]
    client_name: str
    grant_types: list[str] | None = None
    server_id: str  # MCP server ID to associate the client with


class ClientRegistrationResponse(BaseModel):
    """RFC 7591 Dynamic Client Registration Response."""

    client_id: str
    client_secret: str | None = None
    client_id_issued_at: int
    client_secret_expires_at: int
    redirect_uris: list[str]
    grant_types: list[str]
    token_endpoint_auth_method: str
    client_name: str


class TokenResponse(BaseModel):
    """OAuth Token Response."""

    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str | None = None
    scope: str


class TokenErrorResponse(BaseModel):
    """OAuth Token Error Response."""

    error: str
    error_description: str | None = None


class CreateCodeRequest(BaseModel):
    """Request to create an authorization code (internal API for frontend)."""

    client_id: str
    user_id: str
    redirect_uri: str
    scope: str
    code_challenge: str
    code_challenge_method: str
    server_id: str
    state: str | None = None


class CreateCodeResponse(BaseModel):
    """Response containing the authorization code."""

    code: str
    state: str | None = None


# ============================================================================
# Well-Known Endpoints (RFC 8414, RFC 9728)
# ============================================================================


@well_known_router.get(
    "/.well-known/oauth-protected-resource",
    response_model=ProtectedResourceMetadata,
)
async def get_protected_resource_metadata() -> ProtectedResourceMetadata:
    """
    RFC 9728 Protected Resource Metadata.

    Returns metadata about this protected resource (MCP server).
    """
    return ProtectedResourceMetadata(
        resource=settings.OAUTH_ISSUER,
        authorization_servers=[settings.OAUTH_ISSUER],
        scopes_supported=settings.OAUTH_SCOPES.split(),
        bearer_methods_supported=["header"],
    )


@well_known_router.get(
    "/.well-known/oauth-authorization-server",
    response_model=AuthorizationServerMetadata,
)
async def get_authorization_server_metadata() -> AuthorizationServerMetadata:
    """
    RFC 8414 Authorization Server Metadata.

    Returns metadata about the authorization server.
    """
    return AuthorizationServerMetadata(
        issuer=settings.OAUTH_ISSUER,
        authorization_endpoint=f"{settings.FRONTEND_URL}/oauth/authorize",
        token_endpoint=f"{settings.OAUTH_ISSUER}/oauth/token",
        registration_endpoint=f"{settings.OAUTH_ISSUER}/oauth/register",
        scopes_supported=settings.OAUTH_SCOPES.split(),
        response_types_supported=["code"],
        grant_types_supported=["authorization_code", "refresh_token"],
        code_challenge_methods_supported=["S256"],
        token_endpoint_auth_methods_supported=["none", "client_secret_post"],
    )


# ============================================================================
# OAuth Token Endpoint
# ============================================================================


@oauth_router.post("/token", response_model=TokenResponse)
async def token_endpoint(
    grant_type: str = Form(...),
    code: str | None = Form(None),
    redirect_uri: str | None = Form(None),
    client_id: str = Form(...),
    client_secret: str | None = Form(None),
    code_verifier: str | None = Form(None),
    refresh_token: str | None = Form(None),
    scope: str | None = Form(None),
) -> TokenResponse | JSONResponse:
    """
    OAuth 2.1 Token Endpoint.

    Supports:
    - authorization_code grant with PKCE
    - refresh_token grant
    """
    try:
        if grant_type == "authorization_code":
            # Validate required parameters
            if not code:
                raise InvalidRequestError("code is required")
            if not redirect_uri:
                raise InvalidRequestError("redirect_uri is required")
            if not code_verifier:
                raise InvalidRequestError("code_verifier is required for PKCE")

            result = await oauth_service.exchange_code_for_tokens(
                code=code,
                client_id=client_id,
                redirect_uri=redirect_uri,
                code_verifier=code_verifier,
                client_secret=client_secret,
            )

            return TokenResponse(
                access_token=result.access_token,
                token_type=result.token_type,
                expires_in=result.expires_in,
                refresh_token=result.refresh_token,
                scope=result.scope,
            )

        elif grant_type == "refresh_token":
            if not refresh_token:
                raise InvalidRequestError("refresh_token is required")

            result = await oauth_service.refresh_tokens(
                refresh_token=refresh_token,
                client_id=client_id,
                scope=scope,
                client_secret=client_secret,
            )

            return TokenResponse(
                access_token=result.access_token,
                token_type=result.token_type,
                expires_in=result.expires_in,
                refresh_token=result.refresh_token,
                scope=result.scope,
            )

        else:
            raise InvalidRequestError(f"Unsupported grant_type: {grant_type}")

    except OAuthError as e:
        logger.warning(f"OAuth token error: {e.error} - {e.description}")
        return JSONResponse(
            status_code=400,
            content={"error": e.error, "error_description": e.description},
        )


# ============================================================================
# Client Registration Endpoint (RFC 7591)
# ============================================================================


@oauth_router.post("/register", response_model=ClientRegistrationResponse)
async def register_client(
    request: ClientRegistrationRequest,
) -> ClientRegistrationResponse | JSONResponse:
    """
    RFC 7591 Dynamic Client Registration.

    Registers a new OAuth client for an MCP server.
    """
    try:
        server_id = UUID(request.server_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid server_id format")

    try:
        result = await oauth_service.register_client(
            server_id=server_id,
            redirect_uris=request.redirect_uris,
            client_name=request.client_name,
            grant_types=request.grant_types,
            is_public=True,  # MCP clients are typically public (CLI tools)
        )

        return ClientRegistrationResponse(
            client_id=result.client_id,
            client_secret=result.client_secret,
            client_id_issued_at=result.client_id_issued_at,
            client_secret_expires_at=result.client_secret_expires_at,
            redirect_uris=result.redirect_uris,
            grant_types=result.grant_types,
            token_endpoint_auth_method=result.token_endpoint_auth_method,
            client_name=result.client_name,
        )

    except OAuthError as e:
        logger.warning(f"OAuth registration error: {e.error} - {e.description}")
        return JSONResponse(
            status_code=400,
            content={"error": e.error, "error_description": e.description},
        )


# ============================================================================
# Authorization Code Creation (Internal API for Frontend)
# ============================================================================


@oauth_router.post("/authorize/create-code", response_model=CreateCodeResponse)
async def create_authorization_code(
    request: CreateCodeRequest,
) -> CreateCodeResponse | JSONResponse:
    """
    Internal API for frontend consent page.

    Creates an authorization code after user has given consent.
    This endpoint should be called by the frontend after the user approves.
    """
    try:
        server_id = UUID(request.server_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid server_id format")

    try:
        code = await oauth_service.create_authorization_code(
            client_id=request.client_id,
            user_id=request.user_id,
            redirect_uri=request.redirect_uri,
            scope=request.scope,
            code_challenge=request.code_challenge,
            code_challenge_method=request.code_challenge_method,
            server_id=server_id,
            state=request.state,
        )

        return CreateCodeResponse(code=code, state=request.state)

    except OAuthError as e:
        logger.warning(f"OAuth code creation error: {e.error} - {e.description}")
        return JSONResponse(
            status_code=400,
            content={"error": e.error, "error_description": e.description},
        )


# ============================================================================
# Client Info Endpoint (for frontend consent page)
# ============================================================================


class ClientInfoResponse(BaseModel):
    """Client information for consent display."""

    client_id: str
    client_name: str
    redirect_uris: list[str]
    scopes: list[str]
    server_id: str


@oauth_router.get("/client/{client_id}", response_model=ClientInfoResponse)
async def get_client_info(client_id: str) -> ClientInfoResponse:
    """
    Get client information for displaying on consent page.
    """
    from infrastructure.repositories.repo_provider import Provider

    client = await Provider.oauth_client_repo().get_by_client_id(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    return ClientInfoResponse(
        client_id=client.client_id,
        client_name=client.name,
        redirect_uris=client.redirect_uris,
        scopes=client.scopes,
        server_id=str(client.server_id),
    )


# ============================================================================
# Token Revocation Endpoint (RFC 7009)
# ============================================================================


@oauth_router.post("/revoke")
async def revoke_token(
    token: str = Form(...),
    token_type_hint: str | None = Form(None),
    client_id: str | None = Form(None),
) -> dict[str, Any]:
    """
    RFC 7009 Token Revocation.

    Revokes an access token or refresh token.
    """
    await oauth_service.revoke_token(
        token=token,
        token_type_hint=token_type_hint,
        client_id=client_id,
    )
    # Always return 200 OK per RFC 7009 (even if token not found)
    return {}
