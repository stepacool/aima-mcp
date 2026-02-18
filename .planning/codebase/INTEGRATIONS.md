# External Integrations

**Analysis Date:** 2026-02-18

## APIs & External Services

**Payment Processing:**
- Stripe - Subscription billing, one-time payments, credit purchases
  - SDK: `stripe` (server), `@stripe/stripe-js` (client)
  - Auth: `STRIPE_SECRET_KEY` (server), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client)
  - Webhook secret: `STRIPE_WEBHOOK_SECRET`
  - Price IDs: `NEXT_PUBLIC_STRIPE_PRICE_*` for plans and credit packages
  - Implementation: `frontend/lib/billing/stripe.ts`

**AI/LLM Services:**
- OpenAI - AI chat and content generation
  - SDK: `@ai-sdk/openai`, `ai` (Vercel AI SDK)
  - Auth: `OPENAI_API_KEY`
  - Models: GPT-4o-mini, GPT-4o, GPT-4-turbo, o1-mini
  - Implementation: `frontend/app/api/ai/chat/route.ts`, `frontend/app/api/ai/wizard-chat/route.ts`

- OpenRouter - LLM proxy for backend generation
  - Base URL: `https://openrouter.ai/api/v1`
  - Auth: `OPENROUTER_API_KEY`
  - Models: Gemini 2.5 Flash (default for code generation)
  - Implementation: `backend/src/settings.py` (LLMSettings)

**Bot Protection:**
- Cloudflare Turnstile - CAPTCHA alternative
  - SDK: `@marsidev/react-turnstile`
  - Auth: `TURNSTILE_SECRET_KEY` (server), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client)
  - Optional - can be disabled by leaving keys empty

## Data Storage

**Databases:**
- PostgreSQL (Frontend) - Primary application data
  - Connection: `DATABASE_URL` or granular `POSTGRES_*` vars
  - Port: 5434 (local dev)
  - Client: Drizzle ORM with `pg` driver
  - Schema: `frontend/lib/db/schema/tables.ts`
  - Migrations: Drizzle Kit

- PostgreSQL (Backend) - MCP server configuration
  - Connection: `POSTGRES_*` vars
  - Port: 5433 (local dev)
  - Client: SQLAlchemy with asyncpg
  - Migrations: Alembic

**File Storage:**
- S3-compatible storage (Cloudflare R2 recommended)
  - SDK: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
  - Auth: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
  - Endpoint: `S3_ENDPOINT` (e.g., `https://<account>.r2.cloudflarestorage.com`)
  - Region: `S3_REGION` (defaults to "auto" for R2)
  - Bucket: `NEXT_PUBLIC_IMAGES_BUCKET_NAME`
  - Implementation: `frontend/lib/storage/s3.ts`

**Caching:**
- None configured - relies on database queries

## Authentication & Identity

**Auth Provider:**
- better-auth - Custom authentication
  - Implementation: `frontend/lib/auth/`
  - Secret: `BETTER_AUTH_SECRET`
  - Session: 30-day cookie expiry
  - Features: Email/password, organization membership

**OAuth Providers:**
- Google OAuth - Social login
  - Credentials: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Callback: `/api/auth/callback/google`
  - Optional - can be disabled

**OAuth 2.1 Server (Backend):**
- Custom OAuth server for MCP authentication
  - RSA key pair for JWT signing (RS256)
  - Access token: 10 hour lifetime
  - Refresh token: 7 day lifetime
  - Implementation: `backend/src/settings.py` (OAuthSettings), `backend/src/entrypoints/api/routes/oauth.py`

## Email & Notifications

**Transactional Email:**
- Resend - Email delivery service
  - SDK: `resend`
  - Auth: `RESEND_API_KEY`
  - From address: `EMAIL_FROM`
  - Retry: 3 attempts with exponential backoff
  - Implementation: `frontend/lib/email/resend.ts`
  - Templates: `frontend/lib/email/templates/`

**Email Templates:**
- React Email - Template authoring
  - SDK: `@react-email/components`, `@react-email/render`
  - Dev preview: `npm run email:dev` (port 3001)

## Monitoring & Observability

**Error Tracking:**
- Sentry - Error monitoring and performance
  - SDK: `@sentry/nextjs`
  - Auth: `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`
  - Org/Project: `SENTRY_ORG`, `SENTRY_PROJECT`
  - Configured only in production Vercel deployments
  - Implementation: `frontend/next.config.ts`

**Analytics:**
- Vercel Analytics - Web analytics
  - SDK: `@vercel/analytics`, `@vercel/speed-insights`
  - Auto-configured on Vercel deployment
  - Requires manual enable in Vercel Dashboard

**Logging:**
- Frontend: Pino with structured logging
  - Log level: `NEXT_PUBLIC_LOG_LEVEL` (default: "info")
  - Implementation: `frontend/lib/logger/`

- Backend: Loguru with optional Logfire
  - Logfire token: `LOGFIRE_TOKEN` (optional)
  - Implementation: `backend/src/entrypoints/api/main.py`

## CI/CD & Deployment

**Hosting:**
- Vercel - Frontend hosting
  - Auto-detected via `VERCEL_ENV`
  - Output: standalone
  - Build command: `sh vercel.sh`

- Docker - Backend and full-stack deployment
  - Docker Compose for local development
  - Separate containers for frontend, backend, and databases
  - Configuration: `docker-compose.yml`

**CI Pipeline:**
- Not configured - No `.github/workflows/` directory

## Environment Configuration

**Required env vars (Frontend):**
```
# Auth
BETTER_AUTH_SECRET

# Database
DATABASE_URL or POSTGRES_* vars

# Stripe (required for billing)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PRICE_* (plan price IDs)

# Email (required for notifications)
RESEND_API_KEY
EMAIL_FROM

# Storage (required for file uploads)
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_ENDPOINT
NEXT_PUBLIC_IMAGES_BUCKET_NAME
```

**Required env vars (Backend):**
```
# Database
POSTGRES_HOST
POSTGRES_PORT
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB

# LLM
OPENROUTER_API_KEY

# Security
ADMIN_ROUTES_API_KEY
```

**Secrets location:**
- Development: `.env` files (not committed)
- Production: Vercel environment variables (frontend), Docker secrets or environment (backend)

## Webhooks & Callbacks

**Incoming:**
- Stripe Webhooks - `/api/webhooks/stripe`
  - Events: checkout.session.completed, customer.subscription.*, invoice.*, charge.*, refund.*, dispute.*
  - Verification: Stripe signature verification
  - Idempotency: Event ID tracking in database
  - Implementation: `frontend/app/api/webhooks/stripe/route.ts`

**Outgoing:**
- None configured - No external API callbacks

**OAuth Callbacks:**
- Google OAuth: `/api/auth/callback/google`
- MCP OAuth: `/mcp/{server_id}/oauth/callback`

## MCP (Model Context Protocol)

**MCP Server Framework:**
- FastMCP 2.0.0 - Dynamic MCP server creation
  - Runtime: Shared Python process with dynamic server registration
  - Endpoints: `/mcp/{server_id}/*`
  - OAuth integration: Per-server OAuth routes
  - Implementation: `backend/src/entrypoints/mcp/shared_runtime.py`

**Tool Execution:**
- Dynamic tool compilation from database
- Environment variable injection per-server
- Support for free tier (shared) and pro tier (dedicated) deployments

---

*Integration audit: 2026-02-18*
