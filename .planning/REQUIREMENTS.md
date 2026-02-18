# Requirements: MCPHERO Landing Page

**Defined:** 2026-02-18
**Core Value:** Ship MCP servers in minutes, not weeks. The wizard handles everything from code generation to OAuth to deployment.

## v1 Requirements

### SEO & Metadata

- [x] **SEO-01**: Implement Next.js Metadata API with title, description, keywords for MCP-related queries
- [x] **SEO-02**: Add Open Graph meta tags for social sharing (og:title, og:description, og:image)
- [x] **SEO-03**: Add JSON-LD structured data (Organization, WebSite, Product schemas)
- [x] **SEO-04**: Preserve existing URL structure to avoid 404s and link equity loss
- [x] **SEO-05**: Maintain canonical URLs and existing meta descriptions

### Hero Section

- [x] **HERO-01**: Clear headline communicating core value proposition
- [x] **HERO-02**: Subheadline with secondary value (1-2 sentences)
- [x] **HERO-03**: Primary CTA button ("Start Building" or similar, first-person)
- [x] **HERO-04**: Secondary CTA for docs/demo
- [x] **HERO-05**: Product screenshot or demo video (30 seconds max)
- [x] **HERO-06**: Social proof above fold (GitHub stars, company logos)
- [x] **HERO-07**: Mobile-responsive layout with touch-friendly CTAs (44px min)

### How It Works Section

- [x] **HOW-01**: 3-4 step wizard flow visualization (Describe → Tools → Configure → Deploy)
- [x] **HOW-02**: Each step with icon, title, and 1-line description
- [x] **HOW-03**: Visual flow connecting steps (arrows or connecting line)
- [x] **HOW-04**: CTA at bottom of section

### Use Cases Section

- [x] **USECASE-01**: Grid of 4-6 use case cards
- [x] **USECASE-02**: Each card shows use case name, description, copy-pasteable code snippet
- [x] **USECASE-03**: Visual distinction (icon or accent) per use case
- [x] **USECASE-04**: Mobile-responsive grid (1 col mobile, 2 tablet, 3-4 desktop)

### For Developers Section

- [x] **DEV-01**: Section highlighting mcphero Python package
- [x] **DEV-02**: npm/pip install command with copy button
- [x] **DEV-03**: Code example showing basic usage
- [x] **DEV-04**: Link to package documentation
- [x] **DEV-05**: Developer-focused language and tone

### Comparison Section

- [ ] **COMP-01**: Comparison table vs self-hosting (manual MCP setup)
- [ ] **COMP-02**: Comparison table vs FastMCP (open source alternative)
- [ ] **COMP-03**: Comparison table vs official MCP SDK
- [ ] **COMP-04**: Clear "Why MCPHERO" column highlighting advantages
- [ ] **COMP-05**: Fair, accurate comparisons (not misleading)

### Performance

- [ ] **PERF-01**: Lighthouse Performance score ≥ 90
- [ ] **PERF-02**: LCP (Largest Contentful Paint) < 2.5s
- [ ] **PERF-03**: CLS (Cumulative Layout Shift) < 0.1
- [ ] **PERF-04**: INP (Interaction to Next Paint) < 200ms
- [ ] **PERF-05**: Lazy load below-fold images
- [ ] **PERF-06**: Defer non-critical JavaScript

### Trust & Social Proof

- [ ] **TRUST-01**: Company/developer logos (social proof)
- [ ] **TRUST-02**: GitHub repository link with star count
- [ ] **TRUST-03**: Documentation link prominently placed
- [ ] **TRUST-04**: Footer with links (Docs, GitHub, Discord/Twitter)

### Design & UX

- [ ] **DESIGN-01**: Vercel/Linear aesthetic - clean, minimal, professional
- [ ] **DESIGN-02**: Dark mode support (or dark-first design)
- [ ] **DESIGN-03**: Consistent spacing using design tokens
- [ ] **DESIGN-04**: Proper heading hierarchy (h1 → h2 → h3)
- [ ] **DESIGN-05**: Accessible colors with sufficient contrast
- [ ] **DESIGN-06**: Keyboard-navigable (focus states visible)
- [ ] **DESIGN-07**: Scroll-triggered animations using motion (not blocking)

### Analytics

- [ ] **ANALYTICS-01**: Vercel Analytics integration for page views
- [ ] **ANALYTICS-02**: Track CTA click events
- [ ] **ANALYTICS-03**: Speed Insights monitoring enabled

## v2 Requirements

### Content

- **BLOG-01**: Blog section with MCP-related technical content
- **CASE-01**: Customer case studies
- **DOCS-01**: Interactive API documentation

### Features

- **PLAYGROUND-01**: Live code playground for trying MCP servers
- **TEMPLATES-01**: Pre-built MCP server templates gallery
- **A/B-01**: A/B testing framework for CTAs

### Engagement

- **CHAT-01**: AI chatbot for product questions
- **DEMO-01**: Interactive product demo

## Out of Scope

| Feature | Reason |
|---------|--------|
| Blog/Content section | Defer until after product-market fit |
| Live code playground | Requires backend support, high complexity |
| A/B testing framework | Defer until 1k+ daily visitors |
| Multi-language support | English sufficient for initial launch |
| Complex 3D animations | Performance risk, not aligned with Vercel/Linear aesthetic |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEO-01 through SEO-05 | Phase 1 | Complete |
| HERO-01 through HERO-07 | Phase 2 | Pending |
| HOW-01 through HOW-04 | Phase 2 | Pending |
| USECASE-01 through USECASE-04 | Phase 2 | Pending |
| DEV-01 through DEV-05 | Phase 2 | Pending |
| COMP-01 through COMP-05 | Phase 2 | Pending |
| PERF-01 through PERF-07 | Phase 3 | Pending |
| TRUST-01 through TRUST-04 | Phase 2 | Pending |
| DESIGN-01 through DESIGN-07 | Phase 2 | Pending |
| ANALYTICS-01 through ANALYTICS-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 54 total
- Mapped to phases: 54
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 after research synthesis*
