# Stack Research

**Domain:** Landing Page Redesign (Next.js 16)
**Researched:** February 18, 2026
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js Metadata API | Built-in | SEO meta tags, Open Graph, Twitter Cards | Native to Next.js 16, type-safe, server-rendered for crawlers |
| motion (framer-motion) | 12.x | Animation library | Already in project, React 19/Next.js 16 compatible, best DX |
| Tailwind CSS | 4.x | Styling | Already in project, built-in animation utilities via `tw-animate-css` |
| shadcn/ui | Latest | Component primitives | Already in project, built on Radix UI, copy-paste not npm dependency |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vercel/analytics | 1.6.x | Traffic analytics | Always - track landing page performance |
| @vercel/speed-insights | 1.3.x | Core Web Vitals | Always - monitor LCP, INP, CLS |
| tw-animate-css | 1.4.x | Tailwind animation utilities | Already installed - use for simple CSS animations |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| next-sitemap | Latest | Generate sitemap.xml, robots.txt - use Next.js 16 native instead |
| Google PageSpeed Insights | External | Validate Core Web Vitals before launch |

## Installation

```bash
# Already installed - verify versions
npm list motion tw-animate-css @vercel/analytics @vercel/speed-insights

# No additional packages needed for SEO - use Next.js Metadata API
# No additional packages needed for animations - use motion + tw-animate-css
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js Metadata API | next-seo | Only if using Pages Router (not applicable here) |
| motion (framer-motion) | GSAP | Complex scroll-based animations, timeline-heavy sequences |
| motion | react-spring | When physics-based springs are required (motion also supports this) |
| motion | Motion One | Bundle size constraints (motion is ~30kb) |
| tw-animate-css | pure CSS keyframes | When motion isn't needed, simple fade/slide is enough |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-helmet | Client-side only, SEO unfriendly - crawlers don't execute JS | Next.js Metadata API |
| react-meta-tags | Same issue as react-helmet - not server-rendered | Next.js Metadata API |
| next-seo | Deprecated pattern for App Router - use native Metadata API | Next.js Metadata API |
| AOS (Animate On Scroll) | Unmaintained, jQuery-era approach | motion `whileInView` or GSAP ScrollTrigger |
| react-transition-group | Only handles mount/unmount, no gesture/scroll support | motion |
| Anime.js | General-purpose, not React-native, imperative API | motion |
| CSS Modules + keyframes | Extra setup, harder to maintain variants | tw-animate-css + motion |

## Stack Patterns by Variant

**If marketing landing page with animations:**
- Use `motion` for scroll reveals, hover effects, page transitions
- Use `tw-animate-css` for simple entrance animations
- Use Next.js Metadata API for all SEO

**If documentation site with landing:**
- Already using fumadocs - leverage its built-in components
- Add motion sparingly for hero sections only

**If heavy animation needs (scrollytelling):**
- Add GSAP + ScrollTrigger alongside motion
- Keep motion for UI micro-interactions

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| motion 12.x | Next.js 16, React 19 | Verified in current package.json |
| tw-animate-css 1.4.x | Tailwind CSS 4.x | Verified in current package.json |
| @vercel/analytics 1.6.x | Next.js 16 | Verified in current package.json |
| @vercel/speed-insights 1.3.x | Next.js 16 | Verified in current package.json |

## Sources

- Next.js 16 Documentation — Metadata API, sitemaps, robots
- Motion (Framer Motion) GitHub — React 19 compatibility, server components
- LogRocket Blog — React animation library comparison 2026
- Syncfusion — Top 7 React animation libraries for real-world apps
- CodeSearch queries — Next.js SEO best practices 2025/2026

---

*Stack research for: Landing Page Redesign*
*Researched: February 18, 2026*
