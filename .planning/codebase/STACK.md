# Technology Stack

**Analysis Date:** 2026-02-18

## Languages

**Primary:**
- TypeScript 5.9.3 - Frontend Next.js application (`frontend/`)
- Python 3.13 - Backend FastAPI server (`backend/`)

**Secondary:**
- MDX - Documentation content (`frontend/content/docs/`)

## Runtime

**Frontend Environment:**
- Node.js 22.21.1 (specified in `frontend/package.json` engines)
- Package Manager: npm (lockfile present)
- Build: Next.js with Turbopack

**Backend Environment:**
- Python 3.13 (specified in `backend/pyproject.toml`)
- Package Manager: uv (modern Python package manager)
- Runtime: Uvicorn ASGI server

## Frameworks

**Frontend Core:**
- Next.js 16.1.1 - React framework with App Router
- React 19.2.3 - UI library
- tRPC 11.8.1 - End-to-end typesafe API layer
- Drizzle ORM 0.41.0 - TypeScript ORM

**Frontend UI:**
- Tailwind CSS 4.1.18 - Utility-first CSS
- Radix UI - Headless UI primitives (20+ components)
- Shadcn UI patterns - Component architecture
- Lucide React 0.562.0 - Icon library

**Backend Core:**
- FastAPI 0.128.0 - Python web framework
- FastMCP 2.0.0 - Model Context Protocol server framework
- SQLAlchemy 2.0.45 - Python ORM
- Alembic 1.18.0 - Database migrations

**Testing:**
- Vitest 4.0.16 - Unit testing (frontend)
- Playwright 1.57.0 - E2E testing (frontend)
- pytest 9.0.2 - Testing (backend)
- pytest-anyio - Async test support

**Build/Dev:**
- Biome 2.3.10 - Linting and formatting (frontend)
- Ruff 0.14.11 - Linting and formatting (backend)
- Pyright 1.1.408 - Type checking (backend)
- Husky 9.1.7 - Git hooks

## Key Dependencies

**Frontend Critical:**
- `better-auth` 1.4.7 - Authentication framework
- `stripe` 20.1.0 - Payment processing
- `@stripe/stripe-js` 8.6.0 - Stripe client SDK
- `@ai-sdk/openai` 3.0.0 - OpenAI integration via Vercel AI SDK
- `ai` 6.0.1 - Vercel AI SDK core
- `@tanstack/react-query` 5.90.12 - Server state management
- `@tanstack/react-table` 8.21.3 - Table components
- `resend` 6.6.0 - Transactional email service
- `@aws-sdk/client-s3` 3.957.0 - S3-compatible storage
- `zod` 4.2.1 - Schema validation

**Frontend Infrastructure:**
- `pg` 8.16.3 - PostgreSQL client
- `pino` 10.1.0 - Logging
- `sharp` 0.34.5 - Image processing
- `nanoid` 5.1.6 - ID generation
- `date-fns` 4.1.0 - Date utilities

**Backend Critical:**
- `asyncpg` 0.31.0 - Async PostgreSQL driver
- `openai` 2.15.0 - OpenAI SDK (used via OpenRouter)
- `httpx` 0.28.0 - HTTP client
- `pydantic` 2.12.5 - Data validation
- `pydantic-settings` 2.12.0 - Settings management
- `loguru` 0.7.3 - Logging
- `logfire` 4.17.0 - Observability (optional)

**Documentation:**
- `fumadocs-core` 16.3.2 - Documentation framework
- `fumadocs-mdx` 14.2.2 - MDX processing
- `fumadocs-ui` 16.3.2 - Documentation UI

## Configuration

**Frontend Environment:**
- Environment validation via `@t3-oss/env-nextjs`
- Schema defined in `frontend/lib/env.ts`
- Supports granular POSTGRES_* vars or DATABASE_URL
- SSL auto-detected (disabled for localhost)

**Backend Environment:**
- Pydantic Settings in `backend/src/settings.py`
- Composable settings classes (App, OAuth, LLM, Postgres, Monitoring)
- `.env` file support

**Build Configuration:**
- `frontend/next.config.ts` - Next.js configuration with Sentry, MDX, bundle analyzer
- `frontend/drizzle.config.ts` - Drizzle ORM configuration
- `frontend/vitest.config.mts` - Test configuration
- `frontend/playwright.config.ts` - E2E test configuration
- `backend/pyproject.toml` - Python project configuration

## Platform Requirements

**Development:**
- Docker Compose for local PostgreSQL databases
- Node.js 22.x and Python 3.13
- Stripe CLI for webhook forwarding (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)

**Production:**
- Frontend: Vercel deployment (auto-detected via `VERCEL_ENV`)
- Backend: Docker containerized deployment
- Databases: PostgreSQL (separate instances for frontend and backend)
- Storage: S3-compatible (Cloudflare R2 recommended)

---

*Stack analysis: 2026-02-18*
