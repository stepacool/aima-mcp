# Testing Patterns

**Analysis Date:** 2026-02-18

## Test Framework

### Frontend

**Runner:**
- Vitest 4.0.16
- Config: `frontend/vitest.config.mts`
- Coverage provider: v8

**Assertion Library:**
- Vitest built-in (`expect`, `describe`, `it`, `beforeEach`, etc.)

**Run Commands:**
```bash
npm run test                 # Run unit tests
npm run test:watch           # Watch mode
npm run test:coverage        # With coverage
npm run test:db              # Run tests with real PostgreSQL (Docker required)

# Single test file
npx vitest run path/to/test.spec.ts

# By pattern
npx vitest run --testNamePattern "test name"
```

### Backend

**Runner:**
- pytest 9.0.2+
- pytest-anyio for async tests
- Config: `backend/pyproject.toml`

**Assertion Library:**
- pytest built-in assertions

**Run Commands:**
```bash
uv run pytest                              # Run all tests
uv run pytest tests/                       # Specific directory
uv run pytest tests/test_file.py           # Single file
uv run pytest tests/test_file.py::test_fn  # Single test
uv run pytest -k "test_name"               # By pattern
```

## Test File Organization

### Frontend

**Location:**
- Co-located in `tests/` directory at project root
- Pattern: `tests/**/*.{test,spec}.{ts,tsx}`

**Naming:**
- Unit tests: `*.test.ts` (e.g., `utils.test.ts`)
- E2E tests: `*.spec.ts` (e.g., `auth.spec.ts`)

**Structure:**
```
frontend/tests/
├── e2e/                    # Playwright E2E tests
│   └── auth.spec.ts
├── lib/                    # Unit tests for lib/
│   └── utils.test.ts
├── trpc/routers/           # Integration tests for tRPC routers
│   └── organization.test.ts
└── support/                # Test utilities and setup
    ├── setup-env.ts
    ├── setup-shared-db.ts
    ├── setup-global.ts
    ├── setup-db.ts
    ├── mock-env-constants.ts
    └── trpc-utils.ts
```

### Backend

**Location:**
- Co-located in `tests/` directory
- Pattern: `tests/test_*.py`

**Naming:**
- `test_<module>.py` mirrors source file name
- Test functions: `test_<description>`

**Structure:**
```
backend/tests/
├── conftest.py             # Pytest fixtures and configuration
├── fixtures.py             # Reusable test fixtures
├── test_shared_mcp_runtime.py
├── test_wizard_api.py
└── test_http_tools.py
```

## Test Structure

### Frontend Unit Tests

```typescript
import { describe, expect, it } from "vitest";
import { capitalize, getInitials } from "@/lib/utils";

describe("capitalize", () => {
  it("capitalizes the first letter of a word", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("returns empty string if input is empty", () => {
    expect(capitalize("")).toBe("");
  });
});
```

### Frontend tRPC Integration Tests

```typescript
import { describe, expect, it, vi } from "vitest";
import { createTestTRPCContext } from "@/tests/support/trpc-utils";
import { createCallerFactory } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/app";

// Mock next/headers for test environment
vi.mock("next/headers", () => ({
  headers: () => new Headers(),
}));

// Mock auth module
vi.mock("@/lib/auth/server", () => ({
  getSession: async () => ({
    user: testUser,
    session: { /* session data */ },
  }),
}));

describe("organizationRouter", () => {
  describe("getAll", () => {
    it("returns all organizations for the user", async () => {
      const ctx = createTestTRPCContext(testUser);
      const caller = createCallerFactory(appRouter)(ctx);
      const result = await caller.organization.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
```

### Backend Test Classes

```python
import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.anyio  # Mark all tests in file as async


class TestStartWizard:
    """Tests for POST /wizard/start endpoint."""

    @pytest.mark.anyio
    async def test_start_wizard_creates_server(
        self, api_client: AsyncClient, customer: Customer, provider: Type[Provider]
    ) -> None:
        """Test that starting wizard creates a server."""
        with patch("core.services.wizard_steps_services.WizardStepsService.step_1a_suggest_tools") as mock:
            mock.return_value = []
            response = await api_client.post("/api/wizard/start", json={...})

        assert response.status_code == 200
        data = response.json()
        assert "server_id" in data
```

## Mocking

### Frontend

**Framework:** Vitest `vi`

**Patterns:**
```typescript
// Mock environment
vi.stubEnv("NODE_ENV", "test");

// Mock module
vi.mock("next/headers", () => ({
  headers: () => new Headers(),
}));

// Mock with original import
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    auth: { ...actual.auth, api: { ...actual.auth.api, listOrganizations: async () => [] } },
  };
});

// Mock server-only module
vi.mock("server-only", () => ({}));

// Reset after tests
afterAll(() => {
  vi.resetAllMocks();
});
```

**What to Mock:**
- External dependencies (Next.js headers, auth sessions)
- Network requests
- File system operations
- Environment variables

**What NOT to Mock:**
- Code under test
- Database queries (use real DB with test:db command)

### Backend

**Framework:** `unittest.mock.patch`

**Patterns:**
```python
from unittest.mock import patch

# Mock external service
with patch("core.services.wizard_steps_services.WizardStepsService.step_1a_suggest_tools") as mock_suggest:
    mock_suggest.return_value = []
    response = await api_client.post("/api/wizard/start", json={...})

# Mock at decorator level
@pytest.fixture
async def api_client(app: FastAPI) -> AsyncClient:
    """Generic API client for testing admin endpoints."""
    transport = ASGITransport(app=app, client=("1.2.3.4", 123))
    headers = {"C-Authorization": "TEST TOKEN"}
    return AsyncClient(transport=transport, base_url="http://test", headers=headers)
```

## Fixtures and Factories

### Frontend

**Test Data:**
```typescript
// Define consistent test user
const testUser = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "test@example.com",
  name: "Test User",
  role: "user",
  emailVerified: true,
  // ... other fields
};

// Helper function for ensuring data exists
async function ensureTestUserInDb() {
  const userByEmail = await db.query.userTable.findFirst({
    where: (u, { eq }) => eq(u.email, testUser.email),
  });
  if (!userByEmail) {
    await db.insert(userTable).values(testUser);
  }
}
```

**Location:**
- Test utilities in `tests/support/`
- Test data defined inline or in test files

### Backend

**Test Data (fixtures.py):**
```python
@pytest.fixture
async def customer(provider: Type[Provider]) -> Customer:
    customer = await Provider.customer_repo().create(
        CustomerCreate(
            name="test customer",
            email="test@aimalabs.io",
            meta={"eggs": "spam"},
        )
    )
    return customer


@pytest.fixture
async def mcp_server(provider: Type[Provider], customer: Customer) -> MCPServer:
    """Create an MCP server in DRAFT status."""
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="test_server",
            description="Test MCP Server",
            customer_id=str(customer.id),
            auth_type="none",
        )
    )
    return server


def make_simple_tool_code(return_value: str) -> str:
    """Helper to create simple tool code."""
    return f'return "{return_value}"'
```

**Location:**
- Fixtures in `tests/fixtures.py`
- Fixtures imported in `tests/conftest.py` for availability

## Coverage

**Requirements:** No explicit target enforced

**View Coverage (Frontend):**
```bash
npm run test:coverage
```

**View Coverage (Backend):**
```bash
uv run pytest --cov=src
```

## Test Types

### Unit Tests (Frontend)
- **Scope:** Pure functions, utility functions, isolated logic
- **Approach:** Direct imports, no mocking unless external deps
- **Examples:** `tests/lib/utils.test.ts`

### Integration Tests (Frontend)
- **Scope:** tRPC routers with database
- **Approach:** Mock auth/session, use real or isolated database
- **Requires:** `npm run test:db` for database tests

### Integration Tests (Backend)
- **Scope:** API endpoints, MCP server operations
- **Approach:** Use fixtures for data, testcontainers for isolated DB
- **Examples:** `tests/test_wizard_api.py`, `tests/test_http_tools.py`

### E2E Tests (Frontend)
- **Framework:** Playwright 1.57.0
- **Config:** `frontend/playwright.config.ts`
- **Location:** `tests/e2e/*.spec.ts`

```typescript
import { expect, test } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test("sign-in page loads correctly", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page).toHaveTitle(/Sign in/);
    await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  });
});
```

**Run E2E:**
```bash
npm run e2e           # UI mode (development)
npm run e2e:ci        # CI mode
```

## Common Patterns

### Async Testing (Frontend)
```typescript
it("handles async operations", async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

### Async Testing (Backend)
```python
@pytest.mark.anyio
async def test_async_operation(api_client: AsyncClient) -> None:
    response = await api_client.get("/api/endpoint")
    assert response.status_code == 200
```

### Error Testing
```typescript
// Frontend
it("throws on invalid input", async () => {
  await expect(async () => {
    await caller.organization.create({ invalid: "data" });
  }).rejects.toThrow();
});
```

```python
# Backend
async def test_returns_404_for_missing_resource(api_client: AsyncClient) -> None:
    response = await api_client.get(f"/api/wizard/{uuid4()}/tools")
    assert response.status_code == 404
```

## Database Testing

### Frontend
- Uses testcontainers with PostgreSQL
- Isolated schemas per test worker
- Setup files: `tests/support/setup-global.ts`, `tests/support/setup-shared-db.ts`
- Environment: `tests/support/mock-env-constants.ts`

### Backend
- Uses real PostgreSQL database
- Safety checks: database name must start with `test`
- Database created/reset for each test function
- Configuration: `tests/conftest.py` reads `tests/.env.test`

```python
# Safety validation in conftest.py
def _validate_test_database():
    if not settings.POSTGRES_DB.startswith("test"):
        raise RuntimeError(
            f"FATAL: Test database name must start with 'test', got: {settings.POSTGRES_DB!r}"
        )
```

---

*Testing analysis: 2026-02-18*
