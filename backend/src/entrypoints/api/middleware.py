from uuid import UUID

from starlette import status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from infrastructure.repositories.repo_provider import Provider


class MCPAccessMiddleware(BaseHTTPMiddleware):
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

        # Extract API key from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing Authorization header"},
            )

        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid Authorization header format"},
            )

        api_key = auth_header[7:]  # Strip "Bearer " prefix

        # Look up the API key and verify it belongs to the requested server
        api_key_record = await Provider.api_key_repo().get_by_key(api_key)
        if not api_key_record:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid API key"},
            )

        if api_key_record.server_id != server_id:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "API key not authorized for this server"},
            )

        return await call_next(request)
