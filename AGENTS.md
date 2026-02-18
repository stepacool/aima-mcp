# AGENTS.md

Guidelines for AI agents working with this codebase.

## Project Structure

```
/frontend    - Next.js 16 app with tRPC, Drizzle ORM, React
/backend     - Python FastAPI server with SQLAlchemy, MCP
```

## Essential Commands

### Frontend (Next.js)

```bash
cd frontend
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run lint             # Biome linter
npm run lint:write       # Fix lint issues
npm run check:write      # Fix lint + format + unsafe fixes
npm run typecheck        # TypeScript check
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:db          # Run tests with real PostgreSQL
npm run e2e              # Playwright E2E tests (UI mode)
npm run e2e:ci           # Playwright CI mode
npm run db:generate      # Generate Drizzle migration
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio
npm run docker:up        # Start PostgreSQL container
npm run docker:down      # Stop PostgreSQL
npm run stripe:listen    # Forward Stripe webhooks
npm run email:dev        # Preview emails (port 3001)

# Single test file
npx vitest run path/to/test.spec.ts
npx vitest run --testNamePattern "test name"
```

### Backend (Python/FastAPI)

```bash
cd backend
uv run pytest                          # Run all tests
uv run pytest tests/                   # Specific directory
uv run pytest tests/test_file.py       # Single file
uv run pytest tests/test_file.py::test_function  # Single test
uv run pytest -k "test_name"            # By pattern
uv run ruff check src --fix             # Lint + fix
uv run ruff format src                  # Format
uv run pyright src                     # Type check
make lint                              # Full lint pipeline
uv run alembic upgrade head            # Run migrations
uv run python -m src.main              # Run server
```

## Code Style

### Frontend (TypeScript/React)

**Core Principles:**
- Write concise, type-safe TypeScript
- Never use `any` - use `unknown` or proper types
- Use `const` by default, `let` only when needed
- Early returns, avoid nested conditionals

**Naming:**
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Functions/Variables: `camelCase`
- Types/Interfaces: `PascalCase`

**Component Structure:**
```typescript
interface Props {
  required: string;
  optional?: number;
  className?: string;
}

export function Component({ required, optional, className }: Props) {
  // 1. Hooks
  // 2. Derived state
  // 3. Event handlers
  // 4. Early returns
  // 5. Render
}
```

**Imports:** Use path aliases (`@/`)
```typescript
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
```

### Backend (Python)

**Core Principles:**
- Type hints required for all code
- Public APIs must have docstrings
- Functions must be focused and small
- Follow PEP 8 exactly

**Naming:**
- Functions/Variables: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

**Imports:**
```python
from collections.abc import AsyncIterator
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
```

**Error Handling:**
```python
# Raise specific exceptions
from fastapi import HTTPException

if not item:
    raise HTTPException(status_code=404, detail="Not found")

# Structured logging
from loguru import logger

logger.info("Operation completed", extra={"user_id": user.id})
logger.error("Failed", exc_info=True)
```

## Key Patterns

### Frontend tRPC
```typescript
// Procedures: publicProcedure, protectedProcedure, protectedOrganizationProcedure
export const router = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return db.query.table.findMany({
      where: eq(table.organizationId, ctx.organization.id),
    });
  }),
});
```

### Backend MCP Server
```python
from fastmcp import FastMCP

mcp = FastMCP("ServerName")

@mcp.tool()
async def tool_name(param: str) -> str:
    """Tool description."""
    return result
```

### Frontend Database Queries (Drizzle ORM)
```typescript
// Simple query
const user = await db.query.userTable.findFirst({
  where: eq(userTable.id, userId),
  with: { organizations: true },
});

// Complex query
const leads = await db
  .select()
  .from(leadTable)
  .where(
    and(eq(leadTable.organizationId, orgId), eq(leadTable.status, "qualified"))
  )
  .orderBy(desc(leadTable.createdAt))
  .limit(10);
```

### Frontend Authentication
```typescript
// Client-side
import { useSession } from "@/hooks/use-session";
const { user, isPending } = useSession();

// Server-side
import { getSession } from "@/lib/auth/server";
const session = await getSession();

// Organization context
import { useActiveOrganization } from "@/components/active-organization-provider";
const { organization } = useActiveOrganization();
```

### Frontend Forms (React Hook Form + Zod)
```typescript
import { useZodForm } from "@/hooks/use-zod-form";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

function MyForm() {
  const form = useZodForm({ schema, defaultValues: { name: "", email: "" } });

  const onSubmit = form.handleSubmit(async (data) => {
    await mutation.mutateAsync(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <FormField name="name" control={form.control} render={...} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
```

### Frontend Modals
```typescript
import NiceModal from "@ebay/nice-modal-react";
import { ConfirmationModal } from "@/components/confirmation-modal";

NiceModal.show(ConfirmationModal, {
  title: "Are you sure?",
  message: "This action cannot be undone.",
  confirmLabel: "Delete",
  destructive: true,
  onConfirm: async () => {
    await mutation.mutateAsync({ id });
  },
});
```

### Frontend Role System
Two-tier system:
1. **Platform Role** (`user.role`): `user` | `admin` - Controls admin panel access
2. **Organization Role** (`member.role`): `owner` | `admin` | `member` - Per-org permissions

```typescript
// Platform admin check
if (ctx.user.role !== "admin") { ... }

// Organization admin check
if (ctx.membership.role !== "owner" && ctx.membership.role !== "admin") { ... }
```

### Multi-Tenant Data (Frontend)
**ALWAYS filter by organization** for tenant data:
```typescript
// CORRECT
const leads = await db.query.leadTable.findMany({
  where: eq(leadTable.organizationId, ctx.organization.id),
});

// WRONG - Data leak across tenants
const leads = await db.query.leadTable.findMany();
```

## Testing Requirements

- Frontend: Vitest for unit, Playwright for E2E
- Backend: pytest with pytest-anyio for async
- New features require tests
- Bug fixes require regression tests

## Key Files

### Frontend
| File                       | Purpose                        |
| -------------------------- | ------------------------------ |
| `config/app.config.ts`     | App name, description, contact |
| `config/billing.config.ts` | Plans, pricing, limits         |
| `config/auth.config.ts`    | Auth settings                  |
| `lib/db/schema/tables.ts`  | Database tables                |
| `lib/db/schema/enums.ts`   | Database enums                 |
| `trpc/init.ts`             | tRPC procedures & middleware   |
| `trpc/routers/app.ts`      | Root router                    |

## Before Committing

1. Frontend: `npm run check:write && npm run typecheck && npm run test`
2. Backend: `make lint && uv run pytest`
3. Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`

## Never

- Commit `.env` files
- Use `--no-verify` to skip hooks
- Push directly to main
- Use `any` in TypeScript
- Skip type hints in Python
