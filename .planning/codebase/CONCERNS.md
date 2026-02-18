# Codebase Concerns

**Analysis Date:** 2026-02-18

## Tech Debt

### Hardcoded Tier in Multiple Locations
- Issue: `tier = Tier.FREE` is hardcoded in multiple files, ignoring customer's actual tier
- Files:
  - `backend/src/core/services/wizard_steps_services.py:526` - `tier = Tier.FREE` (commented out customer tier lookup)
  - `backend/src/core/services/wizard_steps_services.py:673` - `CodeValidator(Tier.FREE)`
  - `backend/src/entrypoints/mcp/shared_runtime.py:141` - `tier=Tier.FREE`
  - `backend/src/entrypoints/api/routes/servers.py:155` - `CodeValidator(Tier.FREE)`
- Impact: Paid tier customers don't get their entitled features (more tools, broader library access)
- Fix approach: Fetch customer tier from DB and pass through the call chain

### Missing create() Arguments
- Issue: `MCPServerRepo.create()` called without required arguments, relying on `# type: ignore`
- Files: `backend/src/core/services/wizard_steps_services.py:110`
- Impact: Runtime errors if schema changes; type safety compromised
- Fix approach: Pass proper `MCPServerCreate` object with required fields

### TODO Comments Indicating Incomplete Features
- Issue: Multiple TODOs indicate unfinished or workaround code
- Files:
  - `backend/src/core/services/oauth_service.py:466` - `# TODO: poshel naxui` (inappropriate comment)
  - `backend/src/core/services/wizard_steps_services.py:109` - Missing create arguments
  - `backend/src/core/services/wizard_steps_services.py:285` - Override that should be removed
  - `backend/src/entrypoints/api/routes/wizard.py:312` - Suggest endpoint never called from FE
- Impact: Code clarity issues; incomplete features in production
- Fix approach: Address each TODO systematically

### Large Service Files
- Issue: `wizard_steps_services.py` is 740 lines with multiple responsibilities
- Files: `backend/src/core/services/wizard_steps_services.py`
- Impact: Hard to maintain, test, and understand
- Fix approach: Split into focused service classes (ToolGenerationService, EnvVarService, CodeGenerationService)

## Security Considerations

### Dynamic Code Execution with exec()
- Risk: User-generated code executed via `exec()` in tool_loader.py
- Files:
  - `backend/src/core/services/tool_loader.py:288` - `exec(code, namespace)`
- Current mitigation:
  - `CodeValidator` AST-based validation
  - Restricted `__builtins__` (removes eval, exec, compile, open, etc.)
  - Guarded import function
  - Curated library whitelist
  - Mock os module with limited access
- Recommendations:
  - Add sandboxing (e.g., restrictedpython, containers)
  - Add resource limits (CPU, memory, timeouts)
  - Log all executed code with user context
  - Consider code signing for production

### Hardcoded JWT Keys in Settings
- Risk: RSA private key hardcoded in `settings.py` as default value
- Files: `backend/src/settings.py:24-48`
- Current mitigation: Keys can be overridden via environment variables
- Recommendations:
  - Remove default keys entirely (fail if not configured)
  - Add validation that JWT keys are from environment in production
  - Document key rotation procedure

### Default Admin API Key
- Risk: `ADMIN_ROUTES_API_KEY: str = "API_KEY_SECURITY"` is a weak default
- Files: `backend/src/settings.py:13`
- Current mitigation: Can be overridden via environment
- Recommendations:
  - Remove default or fail fast in production if not changed

### Environment Variables in Headers
- Risk: `MCPEnvMiddleware` extracts env vars from request headers (`X-Env-*`)
- Files: `backend/src/entrypoints/api/middleware.py:137-169`
- Current mitigation: Only applies to `/mcp/` paths
- Recommendations:
  - Validate env var names against whitelist
  - Add size limits to prevent header flooding
  - Log sensitive header access

### No Rate Limiting
- Risk: No rate limiting detected on API endpoints
- Files: No rate limiting implementation found
- Impact: Vulnerable to abuse, especially LLM endpoints
- Recommendations:
  - Add rate limiting middleware (e.g., slowapi, fastapi-limiter)
  - Rate limit wizard/LLM endpoints more aggressively
  - Consider per-customer quotas

## Performance Bottlenecks

### Concurrent LLM Calls Without Limits
- Problem: `asyncio.gather(*tasks)` spawns unlimited concurrent LLM calls
- Files: `backend/src/core/services/wizard_steps_services.py:619`
- Impact: Can overwhelm LLM API or hit rate limits
- Improvement path: Use `asyncio.Semaphore` to limit concurrency

### Tool Compilation on Every Request
- Problem: Tools compiled on-demand; no persistent compilation cache
- Files: `backend/src/core/services/tool_loader.py:134-136` (cache exists but per-process)
- Impact: Cold starts slow; memory bloat with many servers
- Improvement path:
  - Pre-compile tools on server startup
  - Consider disk-based cache for compiled tools
  - Add lazy loading with LRU eviction

### N+1 Query Potential
- Problem: Multiple `selectinload` calls per server query
- Files: `backend/src/infrastructure/repositories/mcp_server.py:61-66`
- Impact: Could be slow with many relations
- Improvement path: Audit query patterns; add query-specific loaders

## Fragile Areas

### OAuth Implementation
- Files:
  - `backend/src/entrypoints/api/routes/oauth.py` (632 lines)
  - `backend/src/core/services/oauth_service.py` (531 lines)
- Why fragile: Complex OAuth 2.1 flow with PKCE; multiple endpoints; state management
- Safe modification:
  - Add tests before any changes (currently 0 test coverage)
  - Use RFC specification checklists
  - Test with multiple OAuth clients
- Test coverage: None detected

### Dynamic Tool Loading System
- Files: `backend/src/core/services/tool_loader.py`
- Why fragile: Core to MCP server functionality; complex namespace management
- Safe modification:
  - Test with various code patterns
  - Validate against security test cases
  - Check both free and paid tier paths
- Test coverage: Partial (test_http_tools.py covers some)

### Shared Runtime Registration
- Files: `backend/src/entrypoints/mcp/shared_runtime.py`
- Why fragile: FastAPI route manipulation; lifecycle management via `AsyncExitStack`
- Safe modification:
  - Test startup/shutdown cycles
  - Verify cleanup on errors
  - Test concurrent registrations
- Test coverage: Partial (test_shared_mcp_runtime.py)

## Scaling Limits

### Per-Process Tool Cache
- Current capacity: Limited by single process memory
- Limit: Cannot scale horizontally without cache sync
- Scaling path:
  - Move to Redis-backed cache
  - Consider sticky sessions or cache invalidation

### FastAPI Route Mounting
- Current capacity: Routes mounted dynamically at runtime
- Limit: No unmount lifecycle cleanup (noted in code comments)
- Scaling path:
  - Implement proper unmount with lifespan cleanup
  - Consider pre-mounted route patterns

### Database Connection Pool
- Current capacity: Default SQLAlchemy pool
- Limit: May bottleneck under high concurrent load
- Scaling path:
  - Tune pool size for production
  - Add connection pool monitoring

## Dependencies at Risk

### OpenRouter API (LLM Provider)
- Risk: Single LLM provider; no fallback
- Impact: Wizard tool generation fails if OpenRouter down
- Migration plan: Add support for multiple LLM providers (OpenAI, Anthropic direct)

### FastMCP Library
- Risk: External MCP framework; may have breaking changes
- Impact: Core functionality depends on this
- Migration plan: Pin versions; monitor changelog; consider abstraction layer

## Missing Critical Features

### OAuth Test Coverage
- Problem: No tests for OAuth implementation
- Files: `backend/tests/` - no OAuth tests detected
- Blocks: Safe refactoring of OAuth code

### Monitoring and Observability
- Problem: LOGFIRE_TOKEN setting exists but unclear if fully instrumented
- Files: `backend/src/settings.py:54`
- Blocks: Production debugging, performance analysis

### Customer Tier Enforcement
- Problem: Tier hardcoding means no actual enforcement
- Files: Multiple (see Tech Debt section)
- Blocks: Monetization, feature differentiation

## Test Coverage Gaps

### OAuth Flow
- What's not tested: Token exchange, PKCE verification, client registration, token revocation
- Files: `backend/src/core/services/oauth_service.py`, `backend/src/entrypoints/api/routes/oauth.py`
- Risk: Security vulnerabilities in auth flow
- Priority: High

### Code Validation Edge Cases
- What's not tested: AST bypass attempts, import trickery, namespace escapes
- Files: `backend/src/core/services/tier_service.py`
- Risk: Security vulnerabilities
- Priority: High

### Wizard Step Transitions
- What's not tested: All state transitions, error recovery, concurrent access
- Files: `backend/src/core/services/wizard_steps_services.py`
- Risk: Invalid states, data corruption
- Priority: Medium

### Frontend-Backend Integration
- What's not tested: Python backend client (`frontend/lib/python-backend/wizard.ts`)
- Files: `frontend/lib/python-backend/`
- Risk: Integration failures
- Priority: Medium

## Architecture Concerns

### Broad Exception Handling
- Issue: Many `except Exception as e` blocks catch all exceptions
- Files: 17 locations across `wizard.py`, `servers.py`, `tool_loader.py`, `middleware.py`
- Impact: Masking specific errors; harder debugging
- Fix approach: Catch specific exceptions; let unexpected errors propagate

### Singleton Pattern Abuse
- Issue: Multiple global singletons without lifecycle management
- Files:
  - `backend/src/core/services/tool_loader.py:297-301` - `_tool_loader`
  - `backend/src/core/services/artifact_generator.py:278` - `_artifact_generator`
- Impact: Testing difficulties; hidden state
- Fix approach: Use dependency injection; pass instances explicitly

---

*Concerns audit: 2026-02-18*
