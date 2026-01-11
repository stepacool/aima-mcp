from contextlib import asynccontextmanager

import logfire
from fastapi import FastAPI
from loguru import logger

from infrastructure.repositories.repo_provider import Provider
from settings import settings
from opentelemetry.sdk.trace.sampling import (
    ALWAYS_OFF,
    ALWAYS_ON,
    ParentBased,
    Sampler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await Provider.disconnect()


TRACE_URIS = [
    "[SYSTEM]",
    "POST /api/admin/oauth/accounts",  # Can use METHOD url
    "/api/admin/oauth/whatsapp/callback",  # or just url
]
APPLICATION_NAME = "web-server"


class APIRouteSampler(Sampler):
    # https://logfire.pydantic.dev/docs/how-to-guides/sampling/#custom-head-sampling
    def should_sample(
        self,
        parent_context,
        trace_id,
        name,
        *args,
        **kwargs,
    ):
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

    def get_description(self):
        return "APIRouteSampler"


class Application:
    def setup(self) -> FastAPI:
        self.app = FastAPI(
            title="AIMA Labs API",
            description="AIMA Labs OpenAPI",
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
        pass
    def create_database_pool(self) -> None:
        Provider.get_db(
            connect_args={
                "server_settings": {"application_name": APPLICATION_NAME},
            },
        )

    def setup_instrumentation(self) -> None:
        if settings.LOGFIRE_TOKEN:
            logfire.configure(
                service_name=APPLICATION_NAME,
                environment="production",
                send_to_logfire="if-token-present",
                token=settings.LOGFIRE_TOKEN,
                sampling=logfire.SamplingOptions(head=ParentBased(APIRouteSampler())),
            )
            logger.configure(handlers=[logfire.loguru_handler()])
            logfire.instrument_fastapi(self.app)
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
