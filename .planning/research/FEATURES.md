# Feature Research

**Domain:** SaaS Landing Page for MCP (Model Context Protocol) Developer Tool
**Researched:** 2026-02-18
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Essential elements every SaaS landing page needs. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Hero with clear headline** | Users decide to stay or bounce in 3 seconds. Must state what you do immediately. | LOW | "Build MCP servers fast" — not clever metaphors. Developers scan, they don't read. |
| **Primary CTA (Get Started/Start Building)** | Every SaaS has one. Missing = no conversion path. | LOW | Use first-person: "Start building" vs "Get started". Tests show 300% lift. |
| **Secondary CTA (View Demo/Read Docs)** | Developers want to verify before committing. | LOW | "Read the docs" or "Watch demo" for skeptical buyers. |
| **Product screenshot/video** | Proof it works. Abstract descriptions = suspicion. | MEDIUM | Auto-playing Loom-style video or interactive terminal recording. |
| **Social proof (customer logos)** | "If X uses it, it must work" — reduces risk perception. | LOW | 4-6 recognizable logos. "Powering X companies" statement. |
| **GitHub stars / npm downloads** | For developer tools, this IS social proof. | LOW | Prominent star count near CTA. |
| **Pricing indication or "Free"** | Users need to know cost before investing attention. | LOW | Even if "Contact us", signal the tier. |
| **Clear navigation** | Users expect to find docs, pricing, blog. | LOW | Docs link critical for developer products. |
| **Footer with links** | SEO signal + UX expectation. | LOW | Docs, GitHub, Discord, Twitter, status page. |
| **Mobile-responsive** | 55%+ traffic on mobile. Broken mobile = lost credibility. | MEDIUM | Must work on 375px width. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable for conversion.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **"1-minute setup" demo** | Lower friction = more signups. Developers hate 20-step onboarding. | MEDIUM | Interactive terminal showing `npx create-mcp-server@latest` in 30 seconds. |
| **Live code playground** | Let users experience value before signup. Frictionless. | HIGH | Browser-based MCP editor. Could be v2. |
| **MCPhero package showcase** | First-party package = credibility. Show npm install + 10 lines of code. | LOW | Code snippet in hero or just below. "3 lines to production MCP server". |
| **Real-time "MCP status" indicator** | Shows protocol is alive/active. Built on it = bleeding edge. | LOW | "MCP v1.0 Spec Active" badge. |
| **Comparison table (vs alternatives)** | Help users justify choice. "Why X over Y?" | MEDIUM | Compare: FastMCP, modelcontextprotocol/server. |
| **Use case cards with copy-paste code** | Developers copy before reading. Practicality wins. | LOW | "SEO Analysis", "Database Queries", "API Integration" with one-click copy. |
| **"Built with MCPhero" logo/brands** | User logos are strongest proof. Offer embeddable badges. | LOW | Create "Built with mcphero" SVG badge. |
| **Dark mode default** | Developer aesthetic. Vercel/Linear/Supabase all use dark-first. | LOW | Dark theme hero, toggle for light. |
| **Keyboard-first navigation hints** | "⌘K to search" — signals developer-focused. | LOW | Subtle but adds credibility with dev audience. |
| **Performance metrics** | "50ms latency", "10k requests/sec" — shows technical competence. | LOW | Benchmarks in hero or dedicated section. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Complex animated hero** | "Make it pop" — looks impressive initially | Increases LCP (Largest Contentful Paint). 2.5s+ load time = bounce. 62% of users abandon slow sites. | Static gradient or subtle CSS animation. Auto-play video with poster frame. |
| **Multi-step signup wizard** | "Reduce friction" — seems user-friendly | Developers abandon at account creation. Every step = 20% drop-off. | GitHub OAuth only. No email verification for dev tools. |
| **Full-screen product tour** | "Show everything" — marketing wants coverage | Overwhelms users. They want to solve ONE problem, not see all features. | 30-second video. Let them explore naturally. |
| **Chatbot/intercom on page** | "Capture leads" — sales wants more conversion | Annoying for devs. "Help" when I don't want it = friction. | Docs search is better help. Put Intercom only on pricing/docs. |
| **A/B testing framework on day 1** | "Optimize conversion" — growth team priority | Premature optimization. Must have traffic first. | Launch, measure basic analytics, add after validation. |
| **Blog/case studies for v1** | "Content SEO" — SEO team wants | No one reads case studies until product is proven. Distracts from core. | Focus on docs + code examples first. Add blog at 1k users. |
| **Pricing page with 7 tiers** | "Capture all segments" — sales wants | Decision paralysis. Developer tools work best with simple tiers: Free / Pro / Enterprise. | 3 tiers max. |
| **"Request demo" as primary CTA** | "Qualify leads" — sales wants | Developers won't book demo. They want self-serve. | Primary: "Start building" / "npm install". Demo = secondary. |
| **Heavy 3D animations (Three.js)** | "Stand out visually" — wants differentiation | Massive bundle size. Performance nightmare on mid-tier laptops. | CSS gradients + subtle motion. Framer Motion for simple reveals. |
| **Newsletter signup in hero** | "Build list" — marketing wants | Diversifies from primary CTA. Confusion. Two CTAs = neither works. | Put newsletter in footer only. |

## Feature Dependencies

```
[Hero Section]
    └──requires──> [Clear Value Prop]
                        └──requires──> [Product Visual]

[Live Demo/Playground]
    └──requires──> [Hero is optimized for LCP]

[Comparison Table]
    └──requires──> [Competitor research complete]

[Social Proof]
    └──requires──> [At least 1 customer willing to display]

[Dark Mode]
    └──requires──> [CSS variables for theming]
```

### Dependency Notes

- **Hero requires Clear Value Prop:** Without it, nothing else matters. Users bounce in 3 seconds.
- **Live Demo requires Hero LCP optimized:** If hero is slow, users never reach demo.
- **Comparison Table requires Competitor Research:** Must be accurate. One error = lost credibility.
- **Social Proof requires Customer:** Even one logo is better than none. Start with "Early adopters" placeholder.
- **Dark Mode requires CSS Variables:** Build theme as foundation, not afterthought.

## MVP Definition

### Launch With (v1)

Minimum viable landing page — what's needed to validate the concept.

- [ ] **Hero** — Headline, subhead, dual CTAs, 1-min value proposition
- [ ] **Product visual** — Terminal screenshot or 30-sec Loom
- [ ] **How it works** — 3-step diagram: `npm install` → write function → deploy
- [ ] **Use cases** — 3 cards with copy-paste code snippets
- [ ] **For Developers section** — mcphero package showcase with npm install + code
- [ ] **Comparison** — Simple table vs alternatives (FastMCP, raw MCP)
- [ ] **Social proof** — GitHub stars + 2-3 company logos (or "trusted by")
- [ ] **Footer** — GitHub, Discord, Docs, Twitter links

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Live code playground** — Browser-based MCP editor
- [ ] **Performance benchmarks** — Latency/throughput metrics
- [ ] **Video hero replacement** — Replace static with auto-play video
- [ ] **Interactive terminal** — Animated terminal showing setup
- [ ] **Customer case studies** — One-pagers from early adopters

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Blog/SEO content** — After reaching 1k MRR
- [ ] **A/B testing framework** — After reaching 1k daily visitors
- [ ] **Pricing page redesign** — After validating pricing strategy
- [ ] **Multi-language support** — After international demand

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero with clear headline | HIGH | LOW | P1 |
| Primary CTA (npm install) | HIGH | LOW | P1 |
| Product visual (terminal) | HIGH | MEDIUM | P1 |
| Social proof (GitHub stars) | HIGH | LOW | P1 |
| How it works (3 steps) | HIGH | LOW | P1 |
| Use case cards | MEDIUM | LOW | P1 |
| mcphero code showcase | HIGH | LOW | P1 |
| Comparison table | MEDIUM | MEDIUM | P2 |
| Dark mode | MEDIUM | LOW | P2 |
| Footer with links | HIGH | LOW | P1 |
| Live code playground | HIGH | HIGH | P3 |
| Animated hero | MEDIUM | MEDIUM | P3 |
| Blog/case studies | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | FastMCP | modelcontextprotocol.io | Our Approach |
|---------|---------|-------------------------|---------------|
| Hero headline | Minimal | Abstract | "Build MCP servers in minutes" — concrete benefit |
| CTA | "Get Started" | "Read Spec" | "npm create mcphero@latest" — action-oriented |
| Code showcase | No | Minimal | Full code block with syntax highlighting |
| Comparison | No | No | Explicit "Why mcphero over X" |
| Playgrounds | No | No | v2: Live editor |
| Dark mode | Light only | Light only | Dark-first, toggleable |
| GitHub stars | Hidden | Hidden | Prominent near CTA |

## Section-by-Section Breakdown

### Hero

**Must include:**
- Headline: "[Product] helps you [verb] [noun] in [timeframe]"
- Example: "mcphero helps you build production-ready MCP servers in minutes"
- Subheadline: 1-2 sentences explaining value
- Primary CTA: `npm install` or "Start building"
- Secondary CTA: "Read docs" or "View examples"
- Visual: Terminal screenshot OR auto-play video
- Social proof: GitHub stars, "X developers"

**Design patterns (Linear/Vercel):**
- Large typography, minimal words
- Dark background with subtle gradient
- Two buttons: primary (filled), secondary (outline)
- No stock photos — show real UI
- Keyboard hint: "⌘K to search" as subtle dev signal

### How It Works

**Structure:**
- Step 1: Install (`npm install mcphero`)
- Step 2: Define server (code block)
- Step 3: Deploy (one command)

**Design:**
- Numbered steps with icons
- Code blocks with syntax highlighting
- Arrow connectors between steps
- Optional: Animated terminal replay

### Use Cases

**Format: Card with**
- Use case title ("SEO Analysis", "Database Queries", "API Integration")
- One-liner benefit
- Copy-paste code snippet
- "Copy" button on hover

**Target use cases:**
- SEO workflows (MCP for SEO interest is growing)
- Database operations
- API integrations
- File system automation

### For Developers (mcphero Package)

**Structure:**
- Package name + npm install command
- 5-10 lines showing complete server
- Key features list (3-4 bullets)
- Link to full docs

**Example code:**
```bash
npm install mcphero
```

```typescript
import { McpServer } from 'mcphero';

const server = new McpServer({
  name: 'my-seo-tool',
  tools: [seoAnalyzer, keywordResearcher]
});

server.listen(3000);
```

### Comparisons

**Competitors to compare:**
- FastMCP
- @modelcontextprotocol/server (official)
- Custom MCP implementation

**Comparison dimensions:**
- Setup time
- TypeScript support
- Deployment options
- Performance
- Documentation quality

**Format:**
- Table with checkmarks
- "Why mcphero" summary at bottom
- Link to detailed comparison in docs

## SEO Considerations

**For MCP search intent:**
- Target: "MCP server", "Model Context Protocol", "build MCP server", "MCP for SEO"
- Keywords in hero headline
- Code blocks are SEO gold (developers search for code)
- Docs section with structured data
- GitHub repository optimized (stars, description, topics)

**Technical SEO:**
- LCP < 2.5s
- Mobile-first responsive
- Schema markup for software application
- Sitemap with all pages

## Sources

- [Evil Martians: 100 Dev Tool Landing Pages Study (2025)](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)
- [Magic UI: SaaS Landing Page Best Practices](https://magicui.design/blog/saas-landing-page-best-practices)
- [Shipixen: 10 Essential Features for SaaS Landing Pages](https://shipixen.com/blog/10-essential-features-every-saas-landing-page-needs-in-2025)
- [Linear Design: Landing Page Layout](https://lineardesign.com/blog/landing-page-layout/)
- [MCP Official Documentation](https://modelcontextprotocol.info/docs/)
- [FastMCP Registry](https://fastmcp.me/)

---

*Feature research for: MCP SaaS Landing Page*
*Researched: 2026-02-18*
