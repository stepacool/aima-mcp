# Coding Conventions

**Analysis Date:** 2026-02-18

## Naming Patterns

**Files:**
- Frontend TypeScript/React: `kebab-case.tsx` / `kebab-case.ts`
- Backend Python: `snake_case.py`
- Test files: `*.test.ts` / `*.spec.ts` (frontend), `test_*.py` (backend)
- Schemas: `[domain]-schemas.ts` (e.g., `auth-schemas.ts`, `organization-schemas.ts`)
- tRPC routers: `[scope]-[feature]-router.ts` (e.g., `organization-server-router.ts`)

**Functions:**
- Frontend: `camelCase` (e.g., `handleSubmit`, `getInitials`, `createTestTRPCContext`)
- Backend: `snake_case` (e.g., `get_tool_loader`, `compile_tool`, `ensure_test_user_in_db`)

**Variables:**
- Frontend: `camelCase`, use `const` by default, `let` only when reassignment needed
- Backend: `snake_case`

**Types/Interfaces:**
- Frontend: `PascalCase` (e.g., `SignInInput`, `CreateOrganizationInput`)
- Backend classes: `PascalCase` (e.g., `DynamicToolLoader`, `ToolCompilationError`)

**Constants:**
- `SCREAMING_SNAKE_CASE` for true constants
- Schema exports use `camelCase` (e.g., `signInSchema`, `createOrganizationSchema`)

## Code Style

**Formatting (Frontend):**
- Tool: Biome 2.3.10
- Config: `frontend/biome.jsonc`
- Run: `npm run format:write` or `npm run check:write`
- Tabs for indentation
- Import organization enabled with groups: `:NODE:` → `:PACKAGE:` → `@/**`

**Formatting (Backend):**
- Tool: Ruff
- Run: `uv run ruff format src`
- Line length: 120 characters (configured in format command)
- Fix: `uv run ruff check src --fix`

**Linting (Frontend):**
- Tool: Biome
- Run: `npm run lint` or `npm run lint:write`
- Many rules explicitly disabled for pragmatic development (e.g., `noExplicitAny: off`, `noNonNullAssertion: off`)
- Test files have relaxed rules

**Linting (Backend):**
- Tool: Ruff + Pyright
- Run: `make lint` (combines ruff check, format, and pyright)
- Type checking: `uv run pyright src`

## Import Organization

**Frontend Order:**
1. Node builtins (e.g., `import { useEffect } from "react"`)
2. External npm packages (e.g., `import { z } from "zod/v4"`)
3. Path aliases with `@/` (e.g., `import { Button } from "@/components/ui/button"`)

**Frontend Path Aliases:**
- `@/` maps to `frontend/` root
- Configured in `tsconfig.json` and `vitest.config.mts` via `vite-tsconfig-paths`

**Backend Order:**
1. Standard library (e.g., `from collections.abc import AsyncIterator`)
2. Third-party packages (e.g., `from fastapi import APIRouter`)
3. Local imports (e.g., `from infrastructure.repositories.base import BaseRepository`)

## Error Handling

**Frontend tRPC Procedures:**
```typescript
// Throw TRPCError with appropriate code
import { TRPCError } from "@trpc/server";

if (!item) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Item not found",
  });
}

// Authorization checks
if (ctx.membership.role !== "owner" && ctx.membership.role !== "admin") {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

**Frontend Client-Side:**
```typescript
// Use toast for user feedback, never console.log
import { toast } from "sonner";

try {
  await mutation.mutateAsync(data);
  toast.success("Saved successfully");
} catch (error) {
  logger.error({ error }, "Operation failed");
  toast.error("Something went wrong. Please try again.");
}
```

**Backend FastAPI:**
```python
from fastapi import HTTPException
from loguru import logger

if not server:
    raise HTTPException(status_code=404, detail=f"Server {server_id} not found")

try:
    # operation
except Exception as e:
    logger.error(f"Error in operation: {e}")
    raise HTTPException(status_code=500, detail=str(e))
```

## Logging

**Framework:** Pino (frontend), Loguru (backend)

**Frontend Pattern:**
```typescript
import { logger } from "@/lib/logger";

// Structured logging - object FIRST, message SECOND
logger.info({ userId, action }, "User performed action");
logger.error({ error, context }, "Operation failed");

// Never use console.log in production code
```

**Backend Pattern:**
```python
from loguru import logger

logger.info(f"Setting up test database: {db_name}")
logger.warning(f"Failed to generate server name: {e}")
logger.error(f"Error starting wizard: {e}")
```

## Comments

**When to Comment:**
- Public API functions/methods (required)
- Complex business logic explanations
- TODO/FIXME markers for future work
- Non-obvious workarounds or edge cases

**Docstrings (Backend):**
```python
def compile_tool(
    self,
    tool_id: str,
    name: str,
    description: str,
    parameters: list[dict[str, Any]],
    code: str,
    customer_id: UUID,
    tier: Tier = Tier.FREE,
    env_vars: dict[str, str] | None = None,
) -> FunctionTool:
    """
    Compile a tool from code and return a fastmcp FunctionTool.

    Args:
        tool_id: Unique identifier for the tool
        name: Tool name
        description: Tool description
        parameters: List of parameter definitions
        code: Python code for the tool implementation
        customer_id: Customer who owns this tool
        tier: Customer tier for validation
        env_vars: Environment variables from DB to inject into tool namespace

    Returns:
        Compiled fastmcp FunctionTool ready for injection
    """
```

**JSDoc/TSDoc (Frontend):**
- Not consistently used
- Prefer self-documenting code with clear naming
- Add comments for complex type definitions

## Function Design

**Size:** Functions should be focused and small. Extract helper functions when logic exceeds ~30 lines.

**Parameters:**
- Frontend: Use interfaces for component props, Zod schemas for API inputs
- Backend: Use Pydantic models for request/response bodies, typed function parameters

**Return Values:**
- Frontend async: Return Promises explicitly or use async/await
- Backend async: All async functions should be properly typed with return types

## Module Design

**Exports:**
- Frontend: Named exports preferred, `export default` for pages
- Backend: Explicit imports, `__all__` for package-level exports

**Barrel Files:**
- Used in `frontend/trpc/routers/` for re-exporting sub-routers
- Pattern: `index.ts` exports from sibling files

## Component Structure (Frontend)

```typescript
interface MyComponentProps {
  required: string;
  optional?: number;
  className?: string;
}

export function MyComponent({ required, optional, className }: MyComponentProps) {
  // 1. Hooks
  const router = useRouter();
  const { data } = trpc.example.useQuery();

  // 2. Derived state
  const isValid = Boolean(required);

  // 3. Event handlers
  const handleClick = () => { ... };

  // 4. Early returns
  if (!data) return <Skeleton />;

  // 5. Render
  return (
    <div className={cn("base-styles", className)}>
      {/* content */}
    </div>
  );
}
```

## TypeScript Guidelines

- Never use `any` - use `unknown` or proper types
- Use `const` by default, `let` only when needed
- Early returns to avoid nested conditionals
- Type inference preferred over explicit types when obvious
- Zod for runtime validation with `z.infer<typeof schema>` for types

## Python Guidelines

- Type hints required for all code
- Public APIs must have docstrings
- Follow PEP 8 exactly
- Use dataclasses/Pydantic models for structured data

---

*Convention analysis: 2026-02-18*
