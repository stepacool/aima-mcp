from contextlib import AsyncExitStack, asynccontextmanager
from typing import Any, override

import logfire
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.repositories.repo_provider import Provider
from loguru import logger
from opentelemetry.sdk.trace.sampling import ALWAYS_OFF, ALWAYS_ON, ParentBased, Sampler
from settings import settings

from entrypoints.api.middleware import MCPAccessMiddleware, MCPEnvMiddleware
from entrypoints.api.routes import api_router
from entrypoints.api.routes.oauth import mcp_oauth_router, well_known_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the ExitStack to manage dynamic sub-app lifespans
    async with AsyncExitStack() as stack:
        app.state.mcp_stack = stack

        # Store app/stack refs for the meta MCP server deploy tool
        from entrypoints.mcp.meta_server import meta_mcp, set_app_refs

        set_app_refs(app, stack)

        # On startup: Initialize Meta MCP server lifespan
        try:
            # We must use exactly the same instance that was mounted in main.py
            meta_app = getattr(app.state, "meta_mcp_app", None)
            if not meta_app:
                meta_app = meta_mcp.http_app()
                logger.warning(
                    "meta_mcp_app not found on state; initializing a new instance for lifespan"
                )

            _ = await stack.enter_async_context(meta_app.lifespan(app))
            logger.info("Initialized Meta MCP Server lifespan")
        except Exception as e:
            logger.error(f"Failed to initialize Meta MCP Server lifespan: {e}")

        # On startup: load all active MCP servers from DB
        from entrypoints.mcp.shared_runtime import load_and_register_all_mcp_servers

        try:
            # Pass the stack to the loader
            _ = await load_and_register_all_mcp_servers(app, stack)
            logger.info("Loaded MCP servers on startup")
        except Exception as e:
            logger.error(f"Failed to load MCP servers on startup: {e}")

        # Ensure META Server dummy records exist for OAuth client registrations
        from infrastructure.models.customer import Customer
        from infrastructure.models.mcp_server import MCPServer
        from sqlalchemy import select

        from entrypoints.api.routes.oauth import META_SERVER_ID

        try:
            db = Provider.get_db()
            async with db.session() as session:
                # 1. Customer
                result = await session.execute(
                    select(Customer).filter_by(id=META_SERVER_ID)
                )
                customer = result.scalar_one_or_none()
                if not customer:
                    customer = Customer(id=META_SERVER_ID, name="Meta System Customer")
                    session.add(customer)
                    await session.commit()

                # 2. MCP Server
                result = await session.execute(
                    select(MCPServer).filter_by(id=META_SERVER_ID)
                )
                server = result.scalar_one_or_none()
                if not server:
                    server = MCPServer(
                        id=META_SERVER_ID,
                        name="Meta MCP Server",
                        customer_id=META_SERVER_ID,
                        setup_status="ready",
                        auth_type="oauth",
                    )
                    session.add(server)
                    await session.commit()
            logger.info("Initialized Meta MCP Server database records")
        except Exception as e:
            logger.error(f"Failed to initialize Meta MCP Server records: {e}")

        # Yield control back to FastAPI.
        # The 'stack' keeps all MCP lifespans active while the app runs.
        yield

        # On shutdown:
        # 1. The 'async with stack' block ends automatically here,
        #    gracefully shutting down all MCP servers in reverse order.

        # 2. Then disconnect DB
        await Provider.disconnect()


TRACE_URIS = [
    "[SYSTEM]",
    "POST /api/admin/oauth/accounts",  # Can use METHOD url
    "/api/admin/oauth/whatsapp/callback",  # or just url
]
APPLICATION_NAME = "web-server"


class APIRouteSampler(Sampler):
    # https://logfire.pydantic.dev/docs/how-to-guides/sampling/#custom-head-sampling
    @override
    def should_sample(
        self,
        parent_context: Any,
        trace_id: Any,
        name: Any,
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        sampler = ALWAYS_OFF
        if any(included in name for included in TRACE_URIS):
            sampler = ALWAYS_ON

        return sampler.should_sample(
            parent_context,
            trace_id,
            name,
            *args,
            **kwargs,
        )

    @override
    def get_description(self) -> str:
        return "APIRouteSampler"


class Application:
    app: FastAPI  # type: ignore[reportUninitializedInstanceVariable]

    def setup(self) -> FastAPI:
        self.app = FastAPI(
            title="MCP Hero API",
            description="MCP Hero OpenAPI",
            debug=settings.DEBUG,
            lifespan=lifespan,
            redirect_slashes=False,
        )
        self.app.state.config = settings
        self.register_urls()
        self.create_database_pool()
        self.setup_exception_handlers()

        self.setup_instrumentation()
        return self.app

    def register_urls(self) -> None:
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        self.app.add_middleware(MCPAccessMiddleware)
        # MCPEnvMiddleware must be added after MCPAccessMiddleware
        # so it runs first (sets context before auth and handlers)
        self.app.add_middleware(MCPEnvMiddleware)

        self.app.include_router(api_router)

        # Meta MCP server OAuth routes at /mcp/meta/oauth/* MUST be included
        # before the dynamic {server_id} routes to prevent 422 conflicts.
        from entrypoints.api.routes.oauth import meta_oauth_router

        self.app.include_router(meta_oauth_router, prefix="/mcp/meta")

        # Per-MCP-server OAuth routes at /mcp/{server_id}/.well-known/* and /mcp/{server_id}/oauth/*
        self.app.include_router(mcp_oauth_router, prefix="/mcp/{server_id}")
        self.app.include_router(well_known_router)

        # Mount the Meta MCP server (always available at /mcp/meta)
        from entrypoints.mcp.meta_server import meta_mcp

        meta_app = meta_mcp.http_app()
        self.app.state.meta_mcp_app = meta_app

        # Defense-in-depth: reject any request that reaches meta app without customer context
        # (parent MCPAccessMiddleware should have set this; this guards against scope/state bugs)
        # OAuth paths (/oauth/*) are excluded – they handle their own auth
        from starlette.middleware.base import BaseHTTPMiddleware

        class MetaAuthGuardMiddleware(BaseHTTPMiddleware):
            async def dispatch(self, request, call_next):
                path = request.scope.get("path", "")
                if path.startswith("/oauth"):
                    logger.info(
                        "MCP_AUTH: meta guard – oauth path, pass path={path}",
                        path=path,
                    )
                    return await call_next(request)
                customer_id = getattr(request.state, "mcp_customer_id", None)
                if not customer_id:
                    logger.warning(
                        "MCP_AUTH: meta guard REJECT – missing mcp_customer_id path={path}",
                        path=path,
                    )
                    from starlette.responses import JSONResponse

                    return JSONResponse(
                        status_code=403,
                        content={
                            "detail": "Not authenticated – missing customer context"
                        },
                    )
                logger.info(
                    "MCP_AUTH: meta guard ALLOW path={path} customer_id={cid}",
                    path=path,
                    cid=str(customer_id),
                )
                return await call_next(request)

        meta_app.add_middleware(MetaAuthGuardMiddleware)
        self.app.mount("/mcp/meta", meta_app)

        # Note: The lifespan for the meta_mcp app MUST be started in the lifespan event below.

    def create_database_pool(self) -> None:
        _ = Provider.get_db(
            connect_args={
                "server_settings": {"application_name": APPLICATION_NAME},
            },
        )

    def setup_instrumentation(self) -> None:
        if settings.LOGFIRE_TOKEN:
            _ = logfire.configure(
                service_name=APPLICATION_NAME,
                environment="production",
                send_to_logfire="if-token-present",
                token=settings.LOGFIRE_TOKEN,
                sampling=logfire.SamplingOptions(head=ParentBased(APIRouteSampler())),
            )
            _ = logger.configure(handlers=[logfire.loguru_handler()])
            _ = logfire.instrument_fastapi(self.app)
            logger.info("[SYSTEM] Configured logger for FastAPI server")

    def setup_exception_handlers(self) -> None:
        return
        # self.app.add_exception_handler(BaseApplicationException, application_exception_handler)


def get_app() -> FastAPI:
    return Application().setup()


if __name__ == "__main__":
    import uvicorn

    app = get_app()
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=settings.PORT,
    )
