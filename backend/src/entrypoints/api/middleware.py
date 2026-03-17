"""Middleware for MCP server authentication and request processing."""

from typing import Any, override
from uuid import UUID

from core.services.request_context import request_customer_id, request_env_vars
from loguru import logger
from settings import settings
from starlette import status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


def _mask_token(token: str) -> str:
    """Mask token for safe logging (first 4 and last 4 chars, length)."""
    if not token:
        return "<empty>"
    if len(token) <= 12:
        return f"<len={len(token)}>"
    return f"{token[:4]}...{token[-4:]} (len={len(token)})"


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


def _forbidden_response(detail: str) -> JSONResponse:
    """Create a 403 response for invalid token (present but not valid)."""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": detail},
    )


class MCPAccessMiddleware(BaseHTTPMiddleware):
    """
    Middleware for MCP endpoint authentication.

    Uses OAuth 2.1 JWT access tokens only. Bearer/API token auth has been removed;
    all MCP access is via OAuth.

    On authentication failure, returns 401 with WWW-Authenticate header
    pointing to the OAuth protected resource metadata.
    """

    @override
    async def dispatch(self, request: Request, call_next: Any):
        path = request.url.path
        method = request.method
        auth_raw = request.headers.get("Authorization", "")
        auth_masked = (
            _mask_token(auth_raw[7:])
            if auth_raw.startswith("Bearer ")
            else ("<none>" if not auth_raw else "<non-bearer>")
        )

        if not path.startswith("/mcp"):
            return await call_next(request)

        logger.info(
            "MCP_AUTH: request path={path} method={method} auth={auth}",
            path=path,
            method=method,
            auth=auth_masked,
        )

        # Handle /mcp/meta paths – authenticated via org API keys
        if path.startswith("/mcp/meta"):
            return await self._handle_meta_auth(
                request, call_next, path, auth_raw, auth_masked
            )

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
        if not auth_raw:
            logger.warning(
                "MCP_AUTH: per-server reject – missing Authorization path={path} server_id={sid}",
                path=path,
                sid=str(server_id),
            )
            return _unauthorized_response("Missing Authorization header", server_id)

        if not auth_raw.startswith("Bearer "):
            logger.warning(
                "MCP_AUTH: per-server reject – invalid format path={path} auth={auth}",
                path=path,
                auth=auth_masked,
            )
            return _unauthorized_response(
                "Invalid Authorization header format", server_id
            )

        token = auth_raw[7:]  # Strip "Bearer " prefix

        # Allow internal calls from the Next.js server using the admin API key
        if token == settings.ADMIN_ROUTES_API_KEY:
            logger.info(
                "MCP_AUTH: per-server ALLOW – internal admin key path={path} server_id={sid}",
                path=path,
                sid=str(server_id),
            )
            response = await call_next(request)
            logger.info(
                "MCP_LIB: per-server response status={status} path={path} server_id={sid}",
                status=response.status_code,
                path=path,
                sid=str(server_id),
            )
            return response

        logger.info(
            "MCP_AUTH: per-server validating path={path} server_id={sid} token={token} dots={dots}",
            path=path,
            sid=str(server_id),
            token=auth_masked,
            dots=token.count("."),
        )

        # OAuth JWT only (token must look like a JWT)
        if token.count(".") != 2:
            logger.warning(
                "MCP_AUTH: per-server reject – token not a JWT path={path} server_id={sid} token={token}",
                path=path,
                sid=str(server_id),
                token=auth_masked,
            )
            return _forbidden_response("Invalid token format – OAuth JWT required")

        payload = await self._validate_oauth_token(token, server_id)
        if payload is not None:
            logger.info(
                "MCP_AUTH: per-server ALLOW – OAuth JWT valid path={path} server_id={sid}",
                path=path,
                sid=str(server_id),
            )
            response = await call_next(request)
            logger.info(
                "MCP_LIB: per-server response status={status} path={path} server_id={sid}",
                status=response.status_code,
                path=path,
                sid=str(server_id),
            )
            return response

        # OAuth validation failed
        logger.warning(
            "MCP_AUTH: per-server reject – OAuth JWT invalid path={path} server_id={sid} token={token}",
            path=path,
            sid=str(server_id),
            token=auth_masked,
        )
        return _forbidden_response("Invalid or expired token")

    async def _handle_meta_auth(
        self,
        request: Request,
        call_next: Any,
        path: str,
        auth_header: str,
        auth_masked: str,
    ):
        """Authenticate /mcp/meta requests via OAuth JWT only.

        OAuth endpoints at /mcp/meta/oauth/* are passed through without auth
        (they handle their own authentication).
        """
        from entrypoints.api.routes.oauth import META_SERVER_ID

        # Allow OAuth endpoints through (they handle their own auth)
        if path.startswith("/mcp/meta/oauth"):
            logger.info(
                "MCP_AUTH: meta oauth path – passing through (no Bearer auth required) path={path} auth={auth}",
                path=path,
                auth=auth_masked,
            )
            return await call_next(request)

        # Require auth for all other /mcp/meta paths
        if not auth_header:
            logger.warning(
                "MCP_AUTH: meta reject – missing Authorization header path={path}",
                path=path,
            )
            return _unauthorized_response(
                "Missing Authorization header", META_SERVER_ID
            )

        if not auth_header.startswith("Bearer "):
            logger.warning(
                "MCP_AUTH: meta reject – invalid Authorization format (not Bearer) path={path} auth={auth}",
                path=path,
                auth=auth_masked,
            )
            return _unauthorized_response(
                "Invalid Authorization header format", META_SERVER_ID
            )

        token = auth_header[7:]
        token_dot_count = token.count(".")
        logger.info(
            "MCP_AUTH: meta validating token path={path} token={token} dots={dots} looks_like_jwt={jwt}",
            path=path,
            token=auth_masked,
            dots=token_dot_count,
            jwt=token_dot_count == 2,
        )

        # OAuth JWT only for meta
        if token_dot_count != 2:
            logger.warning(
                "MCP_AUTH: meta reject – token not a JWT path={path} token={token}",
                path=path,
                token=auth_masked,
            )
            return _forbidden_response("Invalid token format – OAuth JWT required")

        payload = await self._validate_oauth_token(token, META_SERVER_ID)
        logger.info(
            "MCP_AUTH: meta OAuth JWT result path={path} token={token} valid={valid} sub={sub}",
            path=path,
            token=auth_masked,
            valid=payload is not None,
            sub=payload.get("sub") if payload else None,
        )
        if payload is None:
            logger.warning(
                "MCP_AUTH: meta reject – OAuth JWT invalid path={path} token={token}",
                path=path,
                token=auth_masked,
            )
            return _forbidden_response("Invalid or expired token")

        # For meta server, sub is the customer_id (org_id) passed by frontend
        customer_id = payload.get("sub")
        if not customer_id:
            logger.warning(
                "MCP_AUTH: meta reject – OAuth valid but no sub path={path}",
                path=path,
            )
            return _forbidden_response("Invalid or expired token")

        try:
            org_uuid = UUID(str(customer_id))
        except (ValueError, TypeError) as e:
            logger.warning(
                "MCP_AUTH: meta reject – OAuth sub not valid UUID path={path} sub={sub} err={err}",
                path=path,
                sub=customer_id,
                err=str(e),
            )
            return _forbidden_response("Invalid or expired token")

        ctx_token = request_customer_id.set(org_uuid)
        request.state.mcp_customer_id = org_uuid
        logger.info(
            "MCP_AUTH: meta ALLOW – OAuth JWT valid path={path} customer_id={cid}",
            path=path,
            cid=str(org_uuid),
        )
        try:
            return await call_next(request)
        finally:
            request_customer_id.reset(ctx_token)

    async def _validate_oauth_token(self, token: str, server_id: UUID) -> dict | None:
        """Validate an OAuth JWT access token. Returns payload if valid, None otherwise."""
        try:
            from core.services.oauth_service import oauth_service

            payload = await oauth_service.validate_access_token(token, server_id)
            logger.info(
                "MCP_AUTH: OAuth validate_access_token SUCCESS server_id={sid} sub={sub}",
                sid=str(server_id),
                sub=payload.get("sub"),
            )
            return payload

        except Exception as e:
            logger.info(
                "MCP_AUTH: OAuth validate_access_token FAILED server_id={sid} error={err}",
                sid=str(server_id),
                err=str(e),
            )
            return None


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
