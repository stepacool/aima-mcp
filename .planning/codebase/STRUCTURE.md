# Codebase Structure

**Analysis Date:** 2026-02-18

## Directory Layout

```
aima-mcp/
├── frontend/                    # Next.js 16 application
│   ├── app/                     # Next.js App Router pages
│   │   ├── (marketing)/         # Public marketing pages
│   │   ├── (saas)/              # Authenticated SaaS pages
│   │   │   ├── auth/            # Auth pages (sign-in, sign-up, etc.)
│   │   │   ├── dashboard/       # Main application
│   │   │   └── oauth/           # OAuth authorization pages
│   │   ├── api/                 # API route handlers
│   │   │   ├── ai/              # AI chat endpoints
│   │   │   ├── auth/            # Auth callback handlers
│   │   │   ├── oauth/           # OAuth endpoints
│   │   │   ├── trpc/            # tRPC handler
│   │   │   └── webhooks/        # Stripe webhooks
│   │   ├── docs/                # Documentation pages
│   │   └── storage/             # File storage proxy
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn UI primitives
│   │   ├── admin/               # Admin panel components
│   │   ├── auth/                # Authentication components
│   │   ├── billing/             # Billing components
│   │   ├── organization/        # Organization management
│   │   ├── wizard/              # MCP server wizard
│   │   └── ...                  # Other feature components
│   ├── config/                  # Application configuration
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Core libraries
│   │   ├── auth/                # Auth utilities
│   │   ├── billing/             # Billing logic
│   │   ├── db/                  # Database client and schema
│   │   ├── email/               # Email templates
│   │   ├── logger/              # Logging utilities
│   │   ├── mcp/                 # MCP utilities
│   │   ├── python-backend/      # Python API client
│   │   ├── storage/             # File storage
│   │   └── wizard/              # Wizard utilities
│   ├── schemas/                 # Zod validation schemas
│   ├── trpc/                    # tRPC configuration
│   │   ├── routers/             # tRPC routers
│   │   │   ├── admin/           # Admin procedures
│   │   │   ├── organization/    # Organization procedures
│   │   │   ├── user/            # User procedures
│   │   │   └── ...              # Other routers
│   │   ├── client.tsx           # tRPC React client
│   │   ├── context.ts           # Request context
│   │   └── init.ts              # Procedure definitions
│   └── tests/                   # Test files
│       ├── e2e/                 # Playwright E2E tests
│       ├── lib/                 # Test utilities
│       ├── support/             # Test support files
│       └── trpc/                # tRPC tests
├── backend/                     # Python FastAPI application
│   ├── src/                     # Source code
│   │   ├── core/                # Core business logic
│   │   │   ├── prompts/         # LLM prompts
│   │   │   └── services/        # Business services
│   │   ├── entrypoints/         # API and MCP entry points
│   │   │   ├── api/             # FastAPI routes
│   │   │   │   └── routes/      # Route modules
│   │   │   └── mcp/             # MCP server runtime
│   │   ├── infrastructure/      # Data layer
│   │   │   ├── models/          # SQLAlchemy models
│   │   │   └── repositories/    # Data repositories
│   │   └── settings.py          # Configuration
│   ├── migrations/              # Alembic migrations
│   └── tests/                   # pytest tests
├── .planning/                   # Planning documents
└── ...                          # Config files
```

## Directory Purposes

### `frontend/app/`
- Purpose: Next.js App Router pages and API routes
- Contains: Page components, layouts, route handlers
- Key files: `layout.tsx` (root layout), `api/trpc/[trpc]/route.ts` (tRPC handler)

### `frontend/components/`
- Purpose: Reusable React components
- Contains: UI primitives, feature components, layout components
- Key files: `ui/button.tsx`, `ui/form.tsx`, `organization/mcp-server-detail.tsx`

### `frontend/trpc/`
- Purpose: tRPC API layer
- Contains: Router definitions, procedure configurations, client setup
- Key files: `init.ts` (procedures), `routers/app.ts` (root router)

### `frontend/lib/db/`
- Purpose: Database layer
- Contains: Drizzle client, table schemas, relations
- Key files: `client.ts`, `schema/tables.ts`, `schema/relations.ts`

### `frontend/lib/python-backend/`
- Purpose: Integration with Python backend
- Contains: HTTP client, API wrappers
- Key files: `client.ts`, `wizard.ts`, `servers.ts`

### `frontend/schemas/`
- Purpose: Input validation schemas
- Contains: Zod schemas organized by domain
- Key files: `organization-lead-schemas.ts`, `wizard-schemas.ts`

### `backend/src/core/`
- Purpose: Core business logic
- Contains: Services for MCP operations, LLM prompts
- Key files: `services/tool_loader.py`, `services/wizard_steps_services.py`

### `backend/src/entrypoints/`
- Purpose: API and MCP entry points
- Contains: FastAPI routes, MCP server runtime
- Key files: `api/main.py`, `mcp/shared_runtime.py`

### `backend/src/infrastructure/`
- Purpose: Data persistence layer
- Contains: SQLAlchemy models, repository implementations
- Key files: `models/mcp_server.py`, `repositories/base.py`

## Key File Locations

### Entry Points
- `frontend/app/layout.tsx`: Root layout with providers
- `frontend/app/api/trpc/[trpc]/route.ts`: tRPC handler
- `backend/src/entrypoints/api/main.py`: FastAPI app entry

### Configuration
- `frontend/config/app.config.ts`: App name, URLs, features
- `frontend/config/billing.config.ts`: Plans, pricing, limits
- `frontend/config/auth.config.ts`: Auth providers, settings
- `backend/src/settings.py`: Backend configuration classes

### Core Logic
- `frontend/trpc/init.ts`: tRPC procedures and middleware
- `frontend/trpc/routers/app.ts`: Root router definition
- `backend/src/core/services/tool_loader.py`: MCP tool compilation
- `backend/src/entrypoints/mcp/shared_runtime.py`: MCP server lifecycle

### Database
- `frontend/lib/db/client.ts`: Drizzle client setup
- `frontend/lib/db/schema/tables.ts`: All table definitions
- `frontend/lib/db/schema/enums.ts`: Enum definitions
- `backend/src/infrastructure/db.py`: SQLAlchemy async session

### Authentication
- `frontend/lib/auth/server.ts`: Server-side auth utilities
- `frontend/components/session-provider.tsx`: Session context
- `frontend/hooks/use-session.tsx`: Session hook

### Testing
- `frontend/tests/trpc/`: tRPC procedure tests
- `frontend/tests/e2e/`: Playwright E2E tests
- `backend/tests/`: pytest tests

## Naming Conventions

### Files
- Components: `kebab-case.tsx` (e.g., `mcp-server-detail.tsx`)
- Utilities: `kebab-case.ts` (e.g., `use-session.tsx`)
- Schemas: `[domain]-schemas.ts` (e.g., `organization-lead-schemas.ts`)
- Routers: `[scope]-[feature]-router.ts` (e.g., `organization-lead-router.ts`)

### Directories
- Feature modules: `kebab-case` (e.g., `mcp-servers/`, `billing/`)
- Route groups: `(group-name)` (e.g., `(saas)/`, `(marketing)/`)
- UI components: Match Shadcn conventions

### Code
- Components: `PascalCase` (e.g., `McpServerDetail`)
- Functions/Variables: `camelCase` (e.g., `getActiveOrganization`)
- Types/Interfaces: `PascalCase` (e.g., `OrganizationMembership`)
- Database tables: `camelCaseTable` suffix (e.g., `userTable`, `organizationTable`)
- Python classes: `PascalCase` (e.g., `MCPServerRepo`)
- Python functions: `snake_case` (e.g., `get_tool_loader`)

## Where to Add New Code

### New Feature (Frontend)
- Schemas: `frontend/schemas/[domain]-schemas.ts`
- tRPC router: `frontend/trpc/routers/[scope]/[feature]-router.ts`
- Register in: `frontend/trpc/routers/[scope]/index.ts`
- Components: `frontend/components/[domain]/`
- Page: `frontend/app/(saas)/dashboard/(sidebar)/organization/[feature]/`

### New Database Table
- Table definition: `frontend/lib/db/schema/tables.ts`
- Enum definition: `frontend/lib/db/schema/enums.ts`
- Relations: `frontend/lib/db/schema/relations.ts`
- Generate migration: `npm run db:generate`
- Run migration: `npm run db:migrate`

### New Backend API Endpoint
- Route file: `backend/src/entrypoints/api/routes/[domain].py`
- Register in: `backend/src/entrypoints/api/routes/__init__.py`
- Service (if needed): `backend/src/core/services/[service].py`
- Repository (if needed): `backend/src/infrastructure/repositories/[repo].py`

### New tRPC Procedure
1. Add schema to `frontend/schemas/[domain]-schemas.ts`
2. Add procedure to appropriate router in `frontend/trpc/routers/`
3. Use correct procedure type based on auth requirements
4. Always filter by `organizationId` for tenant data

### New UI Component
- Reusable: `frontend/components/ui/[component].tsx`
- Feature-specific: `frontend/components/[domain]/[component].tsx`
- Use Shadcn CLI: `npx shadcn@latest add [component]`

### New React Hook
- Location: `frontend/hooks/use-[name].tsx`
- Export from: `frontend/hooks/` directory directly

## Special Directories

### `frontend/app/(saas)/`
- Purpose: Authenticated SaaS application pages
- Contains: Dashboard, organization management, settings
- Pattern: Route groups for layout separation

### `frontend/app/(marketing)/`
- Purpose: Public marketing pages
- Contains: Landing page, pricing, blog, about
- Pattern: No authentication required

### `frontend/components/ui/`
- Purpose: Shadcn UI component library
- Contains: Primitive UI components (Button, Dialog, Form, etc.)
- Generated: Yes, via Shadcn CLI

### `frontend/lib/db/migrations/`
- Purpose: Drizzle migration files
- Generated: Yes, by `drizzle-kit generate`
- Committed: Yes

### `backend/migrations/`
- Purpose: Alembic migration files
- Generated: Yes, by `alembic revision --autogenerate`
- Committed: Yes

### `frontend/.content-collections/`
- Purpose: Generated content types for blog/docs
- Generated: Yes, by content-collections
- Committed: Partially (generated types)

---

*Structure analysis: 2026-02-18*
