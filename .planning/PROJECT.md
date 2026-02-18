# MCPHERO

## What This Is

MCPHERO is a platform for generating and deploying MCP (Model Context Protocol) servers - "Lovable for MCPs". Users describe what they want, an AI wizard guides them through tool selection and env vars, generates code, and deploys a production-ready MCP server with OAuth 2.1 and Bearer auth. Built for developers who want to expose their APIs/tools to AI assistants like Claude without infrastructure complexity.

## Core Value

Ship MCP servers in minutes, not weeks. The wizard handles everything from code generation to OAuth to deployment.

## Requirements

### Validated

- ✓ AI wizard flow (describe → tools → env vars → code → deploy) — existing
- ✓ MCP server generation with FastMCP — existing
- ✓ OAuth 2.1 + Bearer auth for MCP servers — existing
- ✓ Multi-tenant organizations — existing
- ✓ Stripe billing integration — existing
- ✓ Python backend with FastAPI + FastMCP — existing
- ✓ Next.js 16 frontend with tRPC + Drizzle — existing

### Active

- [ ] Landing page with YC-quality polish targeting MCP SEO
- [ ] Hero section with clear value proposition
- [ ] "How it works" section showing wizard flow
- [ ] Use cases/examples section with MCP server templates
- [ ] "For developers" section highlighting mcphero Python package
- [ ] Comparison/FAQ section (vs self-hosting, vs alternatives)

### Out of Scope

- Changes to wizard functionality — landing page only
- New MCP server features — marketing only
- Pricing page changes — separate concern
- Dashboard/app changes — landing page only

## Context

**Current state:**
- Landing page exists from template with basic infrastructure
- Routes: `(marketing)/` route group in Next.js
- Tech: React 19, Shadcn UI, Tailwind, Fumadocs for docs
- Applied for YC - needs to match YC company quality standards

**Target audience:**
- Developers building AI tools
- Teams wanting to expose APIs to Claude/ChatGPT
- Companies needing managed MCP infrastructure

**Competitive positioning:**
- "Lovable for MCPs" - instant MCP server generation
- Managed hosting vs self-hosting
- OAuth + auth handled automatically

## Constraints

- **Tech stack:** Must use existing Next.js + Shadcn + Tailwind setup
- **SEO:** Must target MCP-related queries (MCP server, Model Context Protocol, Claude MCP, MCP hosting, MCP builder, MCP platform)
- **Style:** Vercel/Linear aesthetic - clean, minimal, trust-building
- **Quality:** YC-level polish expected

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Iterate on existing template | Preserve infra, focus on content/UX | — Pending |
| Vercel/Linear style | Clean, minimal, trust-building for YC audience | — Pending |
| Include mcphero package mention | Attract developers who want programmatic access | — Pending |

---
*Last updated: 2026-02-18 after initialization*
