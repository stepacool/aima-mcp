# Project Research Summary

**Project:** MCPHero Landing Page
**Domain:** SaaS Marketing Landing Page (Developer Tool / MCP)
**Researched:** 2026-02-18
**Confidence:** HIGH

## Executive Summary

This is a redesign of an existing SaaS landing page for MCPHero — a developer tool that helps developers build MCP (Model Context Protocol) servers quickly. The current site exists but needs updates to improve SEO, conversion rates, and alignment with competitor best practices.

Research across stack, features, architecture, and pitfalls converges on a clear approach: **leverage existing Next.js 16 infrastructure** (motion, Tailwind, shadcn/ui already installed) to build a conversion-focused landing page that loads fast and clearly communicates value to developers in under 3 seconds.

The critical risks are: (1) SEO regression during redesign if existing meta tags and URL structure aren't preserved, (2) conversion drop from aesthetic changes that remove above-the-fold CTAs or trust signals, and (3) performance regression from adding heavy animations or unused libraries. All three are preventable with proper audits and performance budgets.

## Key Findings

### Recommended Stack

The project already has the correct stack in place — no additional packages needed. Next.js 16's native Metadata API handles all SEO requirements (replacing deprecated packages like react-helmet and next-seo). Motion (framer-motion) 12.x handles animations. Tailwind CSS 4.x + tw-animate-css covers styling and simple CSS animations.

**Core technologies already installed:**
- **Next.js Metadata API** — Server-rendered SEO tags, Open Graph, JSON-LD schema (no additional packages)
- **motion 12.x** — Scroll reveals, hover effects, page transitions; React 19/Next.js 16 compatible
- **Tailwind CSS 4.x** — Styling with built-in animation utilities via tw-animate-css
- **shadcn/ui** — Component primitives built on Radix UI (copy-paste, not npm dependency)
- **@vercel/analytics** + **@vercel/speed-insights** — Traffic and Core Web Vitals monitoring

**What NOT to use:** react-helmet, AOS, react-transition-group, Anime.js, CSS Modules + keyframes.

### Expected Features

**Must have (table stakes):**
- Hero with clear headline + subhead — users bounce in 3 seconds without immediate value prop
- Primary CTA ("Start building" or "npm install") — first-person CTAs show 300% lift
- Secondary CTA (docs/demo) — developers want to verify before committing
- Product screenshot or 30-sec video — proof it works
- Social proof (GitHub stars, company logos) — reduces risk perception
- How it works section — 3-step: install → define → deploy
- Use case cards with copy-paste code — developers copy before reading
- For Developers section — mcphero package showcase with npm install + code
- Comparison table vs alternatives (FastMCP, official MCP)
- Footer with links (docs, GitHub, Discord)

**Should have (competitive advantage):**
- Comparison table — "Why mcphero over X?"
- Dark mode default — developer aesthetic, Vercel/Linear standard
- Keyboard-first hints — "⌘K to search" signals dev-focused
- Performance metrics — "50ms latency" shows technical competence

**Defer (v2+):**
- Live code playground — high complexity, requires backend support
- Blog/case studies — after 1k MRR
- A/B testing framework — after 1k daily visitors
- Complex animated hero — risk of LCP regression

### Architecture Approach

The architecture follows the standard Next.js App Router pattern: a server component page (`app/(marketing)/page.tsx`) that imports client section components. This gives SEO-critical HTML while enabling interactivity where needed.

**Project structure:**
```
components/marketing/
├── sections/       # Full-page sections (hero, how-it-works, use-cases, comparison)
├── navigation/    # Header, footer
├── primitives/   # Reusable UI (gradient-card, code-block, infinite-slider)
```

**Key architectural patterns:**
1. Server Component Page + Client Sections — Best SEO + interactivity balance
2. Props-based content — Pass content as props from page to sections for maintainability
3. JSON-LD SEO Metadata — Structured data for rich search results

Section order on page: Hero → How It Works → For Developers → Features → Use Cases → Comparison → Pricing → FAQ → CTA

### Critical Pitfalls

1. **SEO Foundation Destroyed During Redesign** — 30-70% traffic drop if URLs change, meta tags stripped, canonicals lost. *Prevention: Audit existing SEO before changes, maintain URL structure, copy meta descriptions.*

2. **Conversion-Rate-Killing Visual Redesign** — 20-50% conversion drop when CTAs become subtle, above-the-fold content disappears, trust signals buried. *Prevention: A/B test CTAs, maintain headline + CTA above fold, preserve trust signals.*

3. **Performance Regression** — LCP > 4s from unoptimized images, heavy animations, synchronous third-party scripts. *Prevention: Set performance budgets (LCP < 2.5s, CLS < 0.1), defer non-critical JS, lazy load below-fold.*

4. **Mobile Experience as Afterthought** — 40%+ mobile conversion drop from cramped text, tiny CTAs. *Prevention: Design mobile-first, 44px minimum touch targets, test on real devices.*

5. **Missing Trust Signals** — Professional page feels "too good to be true." *Prevention: Audit existing trust signals, place logos above fold, include testimonials near CTAs.*

6. **Brand Voice Inconsistency** — Returning visitors don't recognize brand. *Prevention: Document brand voice, preserve unique positioning, A/B test new copy.*

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Discovery & SEO Audit
**Rationale:** Critical to preserve existing SEO before any design changes. This is the most irreversible risk.
**Delivers:** SEO audit report, URL map, meta tag inventory, heading hierarchy documentation
**Addresses:** Pitfalls 1 (SEO), 5 (Brand Voice)
**Avoids:** Traffic drop from redesign

### Phase 2: UX/Conversion Planning & Mobile Design
**Rationale:** Establish conversion benchmarks and mobile requirements before design starts. Prevents the most common conversion-killing mistakes.
**Delivers:** Wireframes with CTAs above fold, trust signal placement, mobile-first mockups
**Addresses:** Pitfalls 2, 4, 6 (Conversion, Mobile, Brand)
**Avoids:** 20-50% conversion drop

### Phase 3: Development with Performance Budget
**Rationale:** Build with strict performance constraints. Core Web Vitals must be non-negotiable.
**Delivers:** Implemented landing page with LCP < 2.5s, CLS < 0.1, INP < 200ms
**Uses:** Stack: Next.js Metadata API, motion, Tailwind, shadcn/ui
**Implements:** Architecture pattern (Server + Client components), sections in defined order
**Addresses:** Pitfall 3 (Performance)
**Avoids:** Performance regression

### Phase 4: New Section Implementation (MCPHero-specific)
**Rationale:** After core MVP sections are optimized, add differentiated content.
**Delivers:** How It Works, Use Cases, For Developers, Comparison sections
**Features:** All P1 features from FEATURES.md

### Phase 5: Validation & Optimization
**Rationale:** Launch with analytics baseline, validate changes don't regress core metrics.
**Delivers:** A/B test results, Lighthouse scores, conversion benchmarks
**Research Flags:** This phase may need `/gsd-research-phase` if A/B testing platform selection is needed

### Phase Ordering Rationale

- **Phase 1-2 before any code** because SEO and conversion are irreversible once launched
- **Phase 3 before Phase 4** because performance budget must constrain all section development
- **Phase 4 adds differentiated content** only after table stakes (Hero, CTAs, Trust) are validated
- **Phase 5 validates** the entire redesign against baseline metrics

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Mobile responsive patterns for complex animations (may need Motion/GSAP research)
- **Phase 5:** A/B testing platform selection (needs evaluation of GrowthBook, LaunchDarkly, or simple solution)

Phases with standard patterns (skip research-phase):
- **Phase 3:** Next.js 16 + motion + shadcn/ui patterns are well-documented
- **Phase 4:** Standard SaaS landing page sections — established patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified in existing project, Next.js 16 documentation confirmed |
| Features | HIGH | Based on 100+ landing page studies, competitor analysis, established SaaS patterns |
| Architecture | HIGH | Uses existing project patterns, Next.js App Router best practices |
| Pitfalls | HIGH | Multiple industry sources, concrete prevention strategies |

**Overall confidence:** HIGH

All four research areas show strong alignment — existing project already uses recommended stack, features follow established patterns, architecture matches Next.js 16 best practices, and pitfalls have clear prevention strategies.

### Gaps to Address

- **Content copy** — Research assumes placeholder copy; final headlines need product team validation
- **Actual GitHub stars/npm stats** — Social proof numbers should be confirmed pre-launch
- **Competitor comparison data** — Table needs accurate current data from FastMCP, official MCP
- **Analytics baseline** — Current conversion data should be captured before Phase 1

## Sources

### Primary (HIGH confidence)
- Next.js 16 Documentation — Metadata API, App Router patterns
- Motion (Framer Motion) GitHub — React 19 compatibility, server components
- Evil Martians: 100 Dev Tool Landing Pages Study (2025)
- Existing codebase verification — packages, components

### Secondary (MEDIUM confidence)
- Magic UI: SaaS Landing Page Best Practices
- Shipixen: 10 Essential Features for SaaS Landing Pages
- Linear Design: Landing Page Layout

### Tertiary (LOW confidence)
- MCP Official Documentation — Use case verification (needs current state check)

---
*Research completed: 2026-02-18*
*Ready for roadmap: yes*
