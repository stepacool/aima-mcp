# Architecture Research

**Domain:** Next.js App Router Landing Page (MCPHero Marketing Site)
**Researched:** 2026-02-18
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Page (app/(marketing)/page.tsx)          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Layout (app/(marketing)/layout.tsx)        │   │
│  │  ├── Header (navigation/header.tsx)                   │   │
│  │  └── Footer (navigation/footer.tsx)                   │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Landing Sections                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ HeroSection│  │HowItWorks  │  │ UseCases   │           │
│  │            │  │ Section    │  │ Section    │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ ForDevs    │  │Comparison  │  │Features    │           │
│  │ Section    │  │ Section    │  │ Section    │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Pricing    │  │ FAQ        │  │ CTA        │           │
│  └────────────┘  └────────────┘  └────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                   Primitives & UI                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │GradientCard│  │Progressive │  │Infinite    │           │
│  │            │  │Blur        │  │Slider      │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `HeroSection` | Primary CTA, value proposition, product screenshot | `use client` - animated elements, responsive images |
| `HowItWorksSection` | Step-by-step explanation (3-4 steps) | `use client` - may use scroll animations |
| `UseCasesSection` | Real-world problem/solution examples | Grid of cards with icons and descriptions |
| `ForDevelopersSection` | Technical audience - code examples, SDK info | Code blocks, API references, repo links |
| `ComparisonSection` | vs competitors, before/after | Table or feature matrix |
| `FeaturesSection` | Platform capabilities | Card grid with images |
| `PricingSection` | Plan tiers, pricing cards | Existing component |
| `FAQSection` | Q&A accordion | Existing component |
| `CTASection` | Final conversion push | Existing component |
| `Header` | Nav, auth buttons, mobile menu | `use client` - state for mobile |
| `Footer` | Links, social, legal | Static mostly |

## Recommended Project Structure

```
components/marketing/
├── sections/
│   ├── hero-section.tsx          # Existing
│   ├── features-section.tsx      # Existing
│   ├── how-it-works-section.tsx  # NEW - 3-step process
│   ├── use-cases-section.tsx     # NEW - use case cards
│   ├── for-developers-section.tsx # NEW - code-focused
│   ├── comparison-section.tsx    # NEW - vs alternatives
│   ├── pricing-section.tsx       # Existing
│   ├── faq-section.tsx           # Existing
│   ├── cta-section.tsx           # Existing
│   └── stats-section.tsx         # Existing
├── navigation/
│   ├── header.tsx                # Existing
│   └── footer.tsx               # Existing
├── primitives/
│   ├── gradient-card.tsx         # Existing
│   ├── progressive-blur.tsx      # Existing
│   ├── infinite-slider.tsx      # Existing
│   ├── number-ticker.tsx        # Existing
│   └── code-block.tsx           # NEW - syntax highlighting
└── content/
    └── mdx-content.tsx           # Existing
```

### Structure Rationale

- **`sections/`:** Full-page sections with consistent container widths (`max-w-7xl`)
- **`navigation/`:** Global nav components (header, footer)
- **`primitives/`:** Reusable low-level components (cards, animations)
- **`content/`:** Blog/post rendering components

## Architectural Patterns

### Pattern 1: Server Component Page + Client Sections

**What:** Page is a server component that assembles client section components
**When to use:** SEO-critical pages needing dynamic content
**Trade-offs:** Best of both worlds - server-rendered HTML for SEO, client interactivity where needed

**Example:**
```typescript
// app/(marketing)/page.tsx (Server Component)
export default async function HomePage() {
  const posts = await getAllPosts();
  
  return (
    <>
      <HeroSection />         // "use client"
      <FeaturesSection />     // "use client"
      <PricingSection />      // "use client"
    </>
  );
}
```

### Pattern 2: Section Component with Data Props

**What:** Pass content data as props rather than hardcoding in component
**When to use:** Content that may change or be translated
**Trade-offs:** More flexible, slightly more setup

**Example:**
```typescript
// In page.tsx
const faqContent = {
  headline: "Questions & Answers",
  items: [
    { question: "...", answer: "..." },
  ],
};

// In section
<FaqSection content={faqContent} />
```

### Pattern 3: JSON-LD SEO Metadata

**What:** Inject structured data via script tags
**When to use:** Rich search results, organization schema
**Trade-offs:** Additional SEO value, minimal performance cost

**Example:**
```typescript
function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: appConfig.appName,
    // ...
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
```

## SEO Implementation

### Current Approach (Already Implemented)

1. **JSON-LD Structured Data:**
   - `OrganizationJsonLd` - Organization schema
   - `WebSiteJsonLd` - Website with search action

2. **Semantic HTML:**
   - `<section>` tags with `id` attributes for anchor links
   - Proper heading hierarchy (h1 → h2 → h3)

3. **Meta Tags:**
   - Via `metadata` export in layout/page

### New Sections SEO Requirements

| Section | Key SEO Elements |
|---------|------------------|
| `HeroSection` | h1 with primary keyword, alt text on images |
| `HowItWorksSection` | h2, descriptive alt text for step diagrams |
| `UseCasesSection` | h2, list of use case keywords |
| `ForDevelopersSection` | h2, code blocks with proper pre/code tags |
| `ComparisonSection` | h2, table with competitor names |

## Build Order (Implementation Priority)

### Phase 1: Core Sections (MVP)

1. **`HeroSection`** - Already exists, may need updates
2. **`FeaturesSection`** - Already exists
3. **`PricingSection`** - Already exists
4. **`CTASection`** - Already exists

### Phase 2: Supporting Sections

5. **`FAQSection`** - Already exists
6. **`StatsSection`** - Already exists
7. **`LibrarySection`** - Already exists

### Phase 3: New Sections for MCPHero

8. **`HowItWorksSection`** - NEW - 3-step process flow
9. **`UseCasesSection`** - NEW - problem/solution cards
10. **`ForDevelopersSection`** - NEW - code examples, SDK
11. **`ComparisonSection`** - NEW - vs other MCP tools

### Suggested Section Order on Page

```
1. HeroSection              # Immediate value proposition
2. HowItWorksSection       # Quick explanation (above fold if possible)
3. ForDevelopersSection    # Technical audience hook
4. FeaturesSection         # Platform capabilities
5. UseCasesSection         # Real-world applications
6. ComparisonSection       # Why better than alternatives
7. PricingSection         # Cost information
8. FAQSection              # Common objections
9. CTASection             # Final conversion
```

## Data Flow

### Page Assembly Flow

```
[Route: /]
    ↓
[Server Component: page.tsx]
    ↓ (imports)
[Client Components: *Section.tsx]
    ↓ (render)
[Primitives: GradientCard, etc.]
    ↓ (styles)
[HTML Output]
```

### Content Data Flow

```
[Hardcoded in page.tsx] → [Props to Section] → [Renders UI]
         ↓
    OR
[Fetched (await)] → [Passed to Section] → [Renders UI]
```

## Anti-Patterns

### Anti-Pattern 1: Hardcoding Content in Client Components

**What people do:** Putting content strings inside section components
**Why it's wrong:** Harder to maintain, translate, and A/B test
**Do this instead:** Pass content as props from server page component

### Anti-Pattern 2: Missing Scroll Margin on Anchor Links

**What people do:** Sections with `id` but no `scroll-mt-` class
**Why it's wrong:** Anchor links jump and hide section headers
**Do this instead:** Add `scroll-mt-14` (or header height) to section elements

### Anti-Pattern 3: Client Component for Static Content

**What people do:** Using "use client" for sections with no interactivity
**Why it's wrong:** Unnecessary JS bundle size, hydration cost
**Do this instead:** Use server components where possible; only add "use client" for hooks, state, or event handlers

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Analytics | Client-side script in layout | Track section views |
| Video (Loom/Demo) | Embedded iframe in Hero/HowItWorks | Lazy load for performance |
| Social Links | Static links in Footer/Header | Icon components |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Page → Sections | Props | Content data flows down |
| Sections → Primitives | Props/children | Reusable UI components |
| Header → Auth | Link + Redirect | Uses Next.js navigation |

## Sources

- Next.js App Router docs: https://nextjs.org/docs/app
- Existing codebase: `frontend/app/(marketing)/page.tsx`
- Existing components: `components/marketing/sections/*.tsx`
- Shadcn/ui patterns for consistent styling
