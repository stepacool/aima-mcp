"""Middleware for MCP server authentication and request processing."""

from typing import Any, override
from uuid import UUID

from core.services.request_context import request_customer_id, request_env_vars
from infrastructure.repositories.repo_provider import Provider
from loguru import logger
from settings import settings
from starlette import status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


def _build_www_authenticate_header(server_id: UUID | None = None) -> str:
    """Build WWW-Authenticate header per MCP Authorization spec."""
    if server_id:
        resource_url = f"{settings.OAUTH_ISSUER}/.well-known/oauth-protected-resource/mcp/{server_id}/mcp"
    else:
        resource_url = f"{settings.OAUTH_ISSUER}/.well-known/oauth-protected-resource"
    scope = settings.OAUTH_SCOPES
    return f'Bearer resource_metadata="{resource_url}", scope="{scope}"'


def _unauthorized_response(detail: str, server_id: UUID | None = None) -> JSONResponse:
    """Create a 401 response with WWW-Authenticate header."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": detail},
        headers={"WWW-Authenticate": _build_www_authenticate_header(server_id)},
    )


class MCPAccessMiddleware(BaseHTTPMiddleware):
    """
    Middleware for MCP endpoint authentication.

    Supports two authentication methods:
    1. OAuth 2.1 JWT access tokens (preferred)
    2. Static API keys (backward compatibility)

    Additionally handles /mcp/meta authentication via org API keys.

    On authentication failure, returns 401 with WWW-Authenticate header
    pointing to the OAuth protected resource metadata.
    """

    @override
    async def dispatch(self, request: Request, call_next: Any):
        path = request.url.path
        if not path.startswith("/mcp"):
            return await call_next(request)

        # Handle /mcp/meta paths – authenticated via org API keys
        if path.startswith("/mcp/meta"):
            return await self._handle_meta_auth(request, call_next)

        # Path is like "/mcp/b28b6193-7c5d-4af0-82e3-4e9b08817dfa/mcp"
        # Extract server_id from path segments
        path_segments = path.strip("/").split("/")
        if len(path_segments) < 2:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid MCP path"},
            )

        try:
            server_id = UUID(path_segments[1])
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid server ID format"},
            )

        # allow /oauth endpoints, for example /mcp/13ddb0a7-9049-49a8-961b-5804440cf709/oauth/register
        if path.startswith("/mcp/" + str(server_id) + "/oauth"):
            return await call_next(request)

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return _unauthorized_response("Missing Authorization header", server_id)

        if not auth_header.startswith("Bearer "):
            return _unauthorized_response(
                "Invalid Authorization header format", server_id
            )

        token = auth_header[7:]  # Strip "Bearer " prefix

        # Try OAuth JWT validation first (only if token looks like a JWT)
        if token.count(".") == 2:
            if await self._validate_oauth_token(token, server_id):
                return await call_next(request)

        # Fall back to static API key validation
        if await self._validate_static_api_key(token, server_id):
            return await call_next(request)

        # Both methods failed
        return _unauthorized_response("Invalid or expired token", server_id)

    async def _handle_meta_auth(self, request: Request, call_next: Any):
        """Authenticate /mcp/meta requests.

        Supports two authentication methods:
        1. OAuth JWT tokens (standard MCP auth flow)
        2. Org API keys (sets request_customer_id ContextVar for customer context)

        OAuth endpoints at /mcp/meta/oauth/* are passed through without auth
        (they handle their own authentication).
        """
        from entrypoints.api.routes.oauth import META_SERVER_ID

        path = request.url.path

        # Allow OAuth endpoints through (they handle their own auth)
        if path.startswith("/mcp/meta/oauth"):
            return await call_next(request)

        # Require auth for all other /mcp/meta paths
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return _unauthorized_response(
                "Missing Authorization header", META_SERVER_ID
            )

        if not auth_header.startswith("Bearer "):
            return _unauthorized_response(
                "Invalid Authorization header format", META_SERVER_ID
            )

        token = auth_header[7:]

        # Try OAuth JWT first (if token looks like a JWT)
        if token.count(".") == 2:
            payload = await self._validate_oauth_token(token, META_SERVER_ID)
            if payload is not None:
                # For meta server, sub is the customer_id (org_id) passed by frontend
                customer_id = payload.get("sub")
                if customer_id:
                    try:
                        org_uuid = UUID(str(customer_id))
                        ctx_token = request_customer_id.set(org_uuid)
                        request.state.mcp_customer_id = org_uuid
                        try:
                            return await call_next(request)
                        finally:
                            request_customer_id.reset(ctx_token)
                    except (ValueError, TypeError):
                        pass
                # OAuth valid but no usable customer_id – reject (security: never allow through without customer context)
                return _unauthorized_response(
                    "Invalid or expired token", META_SERVER_ID
                )

        # Try org API key – also sets customer context
        org_id = await Provider.org_api_key_repo().verify(token)
        if org_id is not None:
            ctx_token = request_customer_id.set(org_id)
            # BaseHTTPMiddleware loses ContextVars, so save to state
            request.state.mcp_customer_id = org_id
            try:
                return await call_next(request)
            finally:
                request_customer_id.reset(ctx_token)

        return _unauthorized_response("Invalid or expired token", META_SERVER_ID)

    async def _validate_oauth_token(self, token: str, server_id: UUID) -> dict | None:
        """Validate an OAuth JWT access token. Returns payload if valid, None otherwise."""
        try:
            from core.services.oauth_service import oauth_service

            payload = await oauth_service.validate_access_token(token, server_id)
            logger.debug(f"OAuth token validated for user {payload.get('sub')}")
            return payload

        except Exception as e:
            logger.debug(f"OAuth token validation failed: {e}")
            return None

    async def _validate_static_api_key(self, key: str, server_id: UUID) -> bool:
        """Validate a static API key (backward compatibility)."""
        try:
            api_key_record = await Provider.static_api_key_repo().get_by_key(key)
            if not api_key_record:
                return False

            if api_key_record.server_id != server_id:
                logger.warning(
                    f"Static API key {key[:8]}... not authorized for server {server_id}"
                )
                return False

            logger.debug(f"Static API key validated for server {server_id}")
            return True

        except Exception as e:
            logger.error(f"Static API key validation error: {e}")
            return False


class MCPEnvMiddleware(BaseHTTPMiddleware):
    """
    Middleware to extract ephemeral environment variables from request headers.

    Headers with the prefix "X-Env-" are extracted and made available to tools
    via the request_env_vars context variable.

    Example:
        Request header "X-Env-API-KEY: secret123" becomes {"API_KEY": "secret123"}
        in the tool's os.environ lookup.
    """

    @override
    async def dispatch(self, request: Request, call_next: Any):
        path = request.url.path
        if not path.startswith("/mcp/"):
            return await call_next(request)

        # Extract X-Env-* headers
        ephemeral_env: dict[str, str] = {}
        for header, value in request.headers.items():
            first_six_chars = header.lower()[:6]
            if first_six_chars.replace("-", "_") == "x_env_":
                # X-Env-FOO-BAR -> FOO_BAR (uppercase, hyphens to underscores)
                ephemeral_env[header[6:].upper().replace("-", "_")] = value
                logger.debug(f"EPHEMERAL_HEADER: {header}")

        # Set contextvar for this request
        token = request_env_vars.set(ephemeral_env)
        try:
            return await call_next(request)
        finally:
            request_env_vars.reset(token)
