# Architecture

**Analysis Date:** 2026-02-18

## Pattern Overview

**Overall:** Full-stack monorepo with separated frontend (Next.js) and backend (FastAPI) services

**Key Characteristics:**
- Dual-language architecture: TypeScript frontend, Python backend
- tRPC for type-safe API layer on frontend
- FastAPI with FastMCP for Model Context Protocol server hosting
- Multi-tenant organization-based data isolation
- OAuth 2.1 authentication for MCP server access

## Layers

### Frontend Presentation Layer
- Purpose: User interface rendering and interaction
- Location: `frontend/app/`
- Contains: Next.js App Router pages, route groups, layouts
- Depends on: tRPC routers, React Query, auth context
- Used by: End users via browser

### Frontend API Layer
- Purpose: Type-safe client-server communication
- Location: `frontend/trpc/`
- Contains: tRPC routers, procedures, context setup
- Depends on: Drizzle ORM, better-auth, Zod schemas
- Used by: React components via hooks

### Frontend Data Access Layer
- Purpose: Database operations and schema management
- Location: `frontend/lib/db/`
- Contains: Drizzle ORM client, table schemas, relations
- Depends on: PostgreSQL, drizzle-orm
- Used by: tRPC procedures

### Backend API Layer
- Purpose: MCP server management and wizard operations
- Location: `backend/src/entrypoints/api/`
- Contains: FastAPI routes, request/response schemas
- Depends on: Core services, repositories
- Used by: Frontend via HTTP client

### Backend Core Services Layer
- Purpose: Business logic for MCP operations
- Location: `backend/src/core/services/`
- Contains: Tool loader, OAuth service, tier service, wizard steps
- Depends on: Infrastructure repositories
- Used by: API routes, MCP runtime

### Backend Infrastructure Layer
- Purpose: Data persistence and external integrations
- Location: `backend/src/infrastructure/`
- Contains: SQLAlchemy models, repositories, database client
- Depends on: PostgreSQL, asyncpg
- Used by: Core services

### MCP Runtime Layer
- Purpose: Dynamic MCP server hosting
- Location: `backend/src/entrypoints/mcp/`
- Contains: Shared runtime, tool compilation, server lifecycle
- Depends on: FastMCP, FastAPI, core services
- Used by: External MCP clients (Claude, ChatGPT, Cursor)

## Data Flow

### User Authentication Flow

1. User visits protected route in `frontend/app/(saas)/`
2. Server component calls `getSession()` from `frontend/lib/auth/server.ts`
3. Session validated via better-auth against PostgreSQL
4. Session context passed to `TRPCProvider` in root layout
5. `protectedProcedure` middleware enforces authentication in tRPC calls

### Organization Data Access Flow

1. tRPC procedure uses `protectedOrganizationProcedure`
2. Middleware calls `assertUserIsOrgMember()` to verify membership
3. Context enriched with `organization` and `membership`
4. Database queries filter by `organizationId` from context
5. Data returned to client, cached by React Query with org-scoped keys

### MCP Server Activation Flow

1. Frontend calls Python backend via `frontend/lib/python-backend/client.ts`
2. Request hits `/api/servers/{server_id}/activate` in `backend/src/entrypoints/api/routes/servers.py`
3. Server and tools loaded from database via repository
4. Tool code compiled using `ToolLoader` from `backend/src/core/services/tool_loader.py`
5. Compiled tools registered with FastMCP via `register_new_customer_app()`
6. MCP endpoint mounted at `/mcp/{server_id}/mcp`
7. Deployment record updated in database

### tRPC Request Flow

1. Client component calls `trpc.organization.lead.list.useQuery()`
2. Request goes to `/api/trpc/organization.lead.list`
3. `fetchRequestHandler` processes request in `frontend/app/api/trpc/[trpc]/route.ts`
4. Context created with request metadata (IP, user agent)
5. Logging middleware captures procedure call with timing
6. Procedure handler executes with validated context
7. Response transformed via superjson for type preservation

## Key Abstractions

### tRPC Procedures
- Purpose: Type-safe API endpoints with middleware chaining
- Examples: `frontend/trpc/init.ts`
- Pattern: Middleware composition for auth, logging, error handling

```typescript
// Procedure hierarchy
publicProcedure           // No auth
protectedProcedure        // Requires session
protectedAdminProcedure   // Requires admin role
protectedOrganizationProcedure  // Requires org membership
```

### Repository Pattern
- Purpose: Abstract database operations with typed CRUD methods
- Examples: `backend/src/infrastructure/repositories/base.py`, `mcp_server.py`
- Pattern: Generic base class with specialized implementations

```python
class BaseCRUDRepo(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    async def create(obj_in: CreateSchemaType) -> ModelType
    async def get(id: UUID) -> ModelType | None
    async def update(id: UUID, obj_in: UpdateSchemaType) -> ModelType | None
    async def delete(id: UUID) -> bool
```

### Drizzle ORM Queries
- Purpose: Type-safe SQL queries with relational data
- Examples: `frontend/trpc/routers/organization/organization-lead-router.ts`
- Pattern: Query builder with relations, filters, and pagination

```typescript
const leads = await db.query.leadTable.findMany({
  where: eq(leadTable.organizationId, ctx.organization.id),
  with: { assignedTo: true },
  orderBy: desc(leadTable.createdAt),
});
```

### Billing Guards
- Purpose: Enforce subscription requirements for features
- Examples: `frontend/lib/billing/guards.ts`
- Pattern: Async guards that throw TRPCError on failure

```typescript
await requirePaidPlan(ctx.organization.id);
const limits = await getOrganizationPlanLimits(ctx.organization.id);
```

## Entry Points

### Frontend HTTP Entry
- Location: `frontend/app/api/trpc/[trpc]/route.ts`
- Triggers: All tRPC requests to `/api/trpc/*`
- Responsibilities: Route to tRPC handler, create request context

### Frontend Page Entry
- Location: `frontend/app/layout.tsx`
- Triggers: All page requests
- Responsibilities: Root layout, session hydration, provider setup

### Backend HTTP Entry
- Location: `backend/src/entrypoints/api/main.py`
- Triggers: All backend API requests
- Responsibilities: FastAPI app setup, CORS, middleware, lifespan

### Backend MCP Entry
- Location: `backend/src/entrypoints/mcp/shared_runtime.py`
- Triggers: Application startup, server activation
- Responsibilities: Dynamic MCP server mounting, tool registration

## Error Handling

**Strategy:** Typed errors with proper HTTP status codes and user messages

**Frontend Patterns:**
- tRPC error formatter in `frontend/trpc/init.ts` transforms Zod errors
- TRPCError with appropriate codes (UNAUTHORIZED, FORBIDDEN, NOT_FOUND)
- Toast notifications via sonner for user feedback

**Backend Patterns:**
- HTTPException with status codes in FastAPI routes
- Loguru for structured logging with context
- Sentry integration for error tracking

```typescript
// Frontend error handling
if (!item) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Item not found",
  });
}
```

```python
# Backend error handling
if not server:
    raise HTTPException(404, f"Server {server_id} not found")
```

## Cross-Cutting Concerns

**Logging:**
- Frontend: Pino-based logger in `frontend/lib/logger/`
- Backend: Loguru with Logfire integration
- Structured logging with context objects

**Validation:**
- Zod schemas in `frontend/schemas/` for input validation
- Pydantic models in backend for request/response schemas
- Automatic type inference in tRPC

**Authentication:**
- better-auth for session management
- Two-tier roles: Platform (user/admin), Organization (owner/admin/member)
- OAuth 2.1 for MCP server access with JWT tokens

**Multi-Tenancy:**
- Organization-based data isolation
- tRPC cache keys scoped by organization ID
- Database queries always filter by `organizationId`

---

*Architecture analysis: 2026-02-18*
