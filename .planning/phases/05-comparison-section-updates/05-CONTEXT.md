# Phase 5: Comparison Section Updates - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Add new comparison tables (vs Manufact, vs Composio) to the existing comparison section. Fix HasMCP pricing ($59/mo) and JSON-LD structured data. Maintain existing comparison tables (vs Self-Hosting, vs FastMCP, vs Official SDK, vs HasMCP).

</domain>

<decisions>
## Implementation Decisions

### Table Positioning
- Append new comparison tables at the END of the existing comparison section
- Add in this order: vs Manufact, then vs Composio
- Keep existing 4 comparison tables unchanged

### Comparison Criteria - vs Manufact (YC-backed, 8K+ GitHub stars)
- Full comparison including: no-code vs code-first, AI generation, pricing, dedicated VPS, setup time, learning curve, support quality
- Highlight MCPHero strengths: truly no-code, AI generation from any input, dedicated VPS
- Be fair but highlight advantages

### Comparison Criteria - vs Composio (500+ integrations)
- Similar approach - full comparison
- Focus on: no-code vs their 500+ integrations, pricing ($59/mo vs enterprise), dedicated VPS vs shared
- Highlight MCPHero advantages for custom/unconventional integrations

### Key Differentiators to Highlight
- Any input (cURL, SQL, HTML, natural language) - competitors require structured specs
- No code required - competitors are code-first
- Dedicated VPS - competitors use shared infrastructure
- Pricing transparency - clear $59/mo vs enterprise/custom pricing
- Faster setup time

### JSON-LD Fixes
- Fix HasMCP pricing: show $59/mo (not $19/seat)
- Update MCPHero Pro pricing: $59/mo
- Fix free tier: "1 server, 3 tools" (not "unlimited")

</decisions>

<specifics>
## Specific Ideas

- Comparison tables should have "MCPHERO" column highlighted vs each competitor
- Use checkmarks/crosses for feature availability
- Include "Why MCPHERO" callout column where relevant
- Keep comparison fair - acknowledge competitor strengths

</specifics>

<deferred>
## Deferred Ideas

- JSON-LD details → Planner can determine exact fields to fix
- Pricing display details → Planner can handle exact text

</deferred>

---

*Phase: 05-comparison-section-updates*
*Context gathered: 2026-02-18*
