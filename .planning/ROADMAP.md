# Roadmap: MCPHERO Landing Page Redesign

**Project:** MCPHERO Landing Page
**Core Value:** Ship MCP servers in minutes, not weeks
**Depth:** Standard (5-8 phases)
**Created:** 2026-02-18

---

## Phases

- [ ] **Phase 1: SEO Foundation** - Preserve and enhance search visibility
- [ ] **Phase 2: Content & Design** - Build all visual sections with Vercel/Linear aesthetic
- [ ] **Phase 3: Performance & Analytics** - Optimize Core Web Vitals and enable tracking

---

## Phase Details

### Phase 1: SEO Foundation

**Goal:** Preserve and enhance search visibility while maintaining existing URL structure and meta tags

**Depends on:** Nothing (first phase)

**Requirements:** SEO-01, SEO-02, SEO-03, SEO-04, SEO-05

**Success Criteria** (what must be TRUE):
1. Next.js Metadata API returns proper title, description, and keywords for all MCP-related search queries
2. Open Graph tags (og:title, og:description, og:image) render correctly for social sharing
3. JSON-LD structured data (Organization, WebSite, Product schemas) is present in page source
4. All existing URLs return 200 status (no 404s from moved content)
5. Canonical URLs point to correct pages and meta descriptions match existing content

**Plans:** TBD

---

### Phase 2: Content & Design

**Goal:** Build complete landing page with all visual sections using Vercel/Linear aesthetic

**Depends on:** Phase 1

**Requirements:** 
- HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, HERO-06, HERO-07
- HOW-01, HOW-02, HOW-03, HOW-04
- USECASE-01, USECASE-02, USECASE-03, USECASE-04
- DEV-01, DEV-02, DEV-03, DEV-04, DEV-05
- COMP-01, COMP-02, COMP-03, COMP-04, COMP-05
- TRUST-01, TRUST-02, TRUST-03, TRUST-04
- DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, DESIGN-06, DESIGN-07

**Success Criteria** (what must be TRUE):
1. Hero section displays with headline, subheadline, primary CTA ("Start Building"), secondary CTA, product visual, and social proof - all visible above fold on desktop
2. How It Works section shows 4-step wizard flow (Describe → Tools → Configure → Deploy) with icons, titles, descriptions, and connecting visual flow
3. Use Cases section displays 4-6 cards with use case name, description, and copy-pasteable code snippets in responsive grid
4. For Developers section shows mcphero Python package with install command (with copy button), code example, and docs link
5. Comparison section displays tables vs self-hosting, FastMCP, and official MCP SDK with clear "Why MCPHERO" advantages
6. Trust section shows company logos, GitHub link with star count, docs link, and footer with Docs/GitHub/Discord links
7. Design matches Vercel/Linear aesthetic with dark mode support, proper heading hierarchy, accessible colors, visible focus states, and scroll-triggered animations
8. Mobile layout renders correctly with 44px minimum touch targets and responsive grid (1 col mobile, 2 tablet, 3-4 desktop)

**Plans:** TBD

---

### Phase 3: Performance & Analytics

**Goal:** Achieve Core Web Vitals targets and enable analytics tracking

**Depends on:** Phase 2

**Requirements:** PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, ANALYTICS-01, ANALYTICS-02, ANALYTICS-03

**Success Criteria** (what must be TRUE):
1. Lighthouse Performance score is ≥ 90
2. LCP (Largest Contentful Paint) is under 2.5 seconds
3. CLS (Cumulative Layout Shift) is under 0.1
4. INP (Interaction to Next Paint) is under 200ms
5. Below-fold images are lazy loaded
6. Non-critical JavaScript is deferred
7. Vercel Analytics tracks page views
8. CTA click events are tracked in analytics
9. Speed Insights monitoring is enabled

**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. SEO Foundation | 1/1 | Complete | 2026-02-18 |
| 2. Content & Design | 0/1 | Not started | - |
| 3. Performance & Analytics | 0/1 | Not started | - |

---

## Coverage

**Total v1 requirements:** 50
**Mapped to phases:** 50
**Unmapped:** 0 ✓

| Phase | Requirements |
|-------|--------------|
| Phase 1: SEO Foundation | SEO-01, SEO-02, SEO-03, SEO-04, SEO-05 |
| Phase 2: Content & Design | HERO-01 to HERO-07, HOW-01 to HOW-04, USECASE-01 to USECASE-04, DEV-01 to DEV-05, COMP-01 to COMP-05, TRUST-01 to TRUST-04, DESIGN-01 to DESIGN-07 |
| Phase 3: Performance & Analytics | PERF-01 to PERF-06, ANALYTICS-01 to ANALYTICS-03 |

---

*Last updated: 2026-02-18*
