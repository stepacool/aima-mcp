"""Middleware for MCP server authentication and request processing."""

from uuid import UUID

from loguru import logger
from starlette import status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from core.services.request_context import request_env_vars
from infrastructure.repositories.repo_provider import Provider
from settings import settings


def _build_www_authenticate_header(server_id: UUID | None = None) -> str:
    """Build WWW-Authenticate header per MCP Authorization spec."""
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

    On authentication failure, returns 401 with WWW-Authenticate header
    pointing to the OAuth protected resource metadata.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if not path.startswith("/mcp"):
            return await call_next(request)

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

        # Try OAuth JWT validation first
        if await self._validate_oauth_token(token, server_id):
            return await call_next(request)

        # Fall back to static API key validation
        if await self._validate_static_api_key(token, server_id):
            return await call_next(request)

        # Both methods failed
        return _unauthorized_response("Invalid or expired token", server_id)

    async def _validate_oauth_token(self, token: str, server_id: UUID) -> bool:
        """Validate an OAuth JWT access token."""
        try:
            from core.services.oauth_service import oauth_service

            # validate_access_token will raise OAuthError if invalid
            payload = await oauth_service.validate_access_token(token, server_id)

            # Token is valid - could store user info in request.state here
            # request.state.user_id = payload.get("sub")
            # request.state.scope = payload.get("scope")
            logger.debug(f"OAuth token validated for user {payload.get('sub')}")
            return True

        except Exception as e:
            # JWT validation failed - could be a static API key
            logger.debug(f"OAuth token validation failed: {e}")
            return False

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

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if not path.startswith("/mcp/"):
            return await call_next(request)

        # Extract X-Env-* headers
        ephemeral_env: dict[str, str] = {}
        for header, value in request.headers.items():
            if header.lower().startswith("x-env-"):
                # X-Env-FOO-BAR -> FOO_BAR (uppercase, hyphens to underscores)
                ephemeral_env[header[6:].upper().replace("-", "_")] = value

        # Set contextvar for this request
        token = request_env_vars.set(ephemeral_env)
        try:
            return await call_next(request)
        finally:
            request_env_vars.reset(token)
