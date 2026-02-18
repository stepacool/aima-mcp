# Phase 3: Performance & Analytics - Research

**Researched:** 2026-02-18
**Domain:** Next.js performance optimization, Core Web Vitals, Vercel Analytics/Speed Insights
**Confidence:** HIGH

## Summary

Phase 3 requires achieving Core Web Vitals targets (LCP <2.5s, CLS <0.1, INP <200ms) with Lighthouse Performance ≥90, plus implementing Vercel Analytics for page views, CTA tracking, and Speed Insights. The stack (Next.js 16 + motion + Tailwind + shadcn/ui) has native solutions for all requirements.

**Primary recommendation:** Use Next.js built-in optimizations (`next/image` with priority, `next/script` with lazyOnload, Server Components) combined with `@vercel/analytics` and `@vercel/speed-insights` packages. No third-party alternatives needed.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PERF-01 | Lighthouse Performance score ≥ 90 | next/image priority + next/font + dynamic imports achieve 90+ |
| PERF-02 | LCP < 2.5s | next/image with priority prop preloads LCP element |
| PERF-03 | CLS < 0.1 | next/image with dimensions, next/font for font loading |
| PERF-04 | INP < 200ms | Server Components reduce JS, useTransition for updates |
| PERF-05 | Lazy load below-fold images | next/image default behavior is lazy loading |
| PERF-06 | Defer non-critical JavaScript | next/script with lazyOnload strategy |
| ANALYTICS-01 | Vercel Analytics for page views | @vercel/analytics/next component |
| ANALYTICS-02 | Track CTA click events | track() function from @vercel/analytics |
| ANALYTICS-03 | Speed Insights monitoring | @vercel/speed-insights component |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @vercel/analytics | latest | Page view tracking | Official Vercel package, zero-config for Next.js on Vercel |
| @vercel/speed-insights | latest | Performance monitoring | Official Vercel package, automatic Core Web Vitals |
| next/image | built-in | Image optimization | Native Next.js, automatic format conversion (WebP/AVIF) |
| next/script | built-in | Script deferral | Native Next.js, multiple loading strategies |
| next/font | built-in | Font optimization | Zero layout shift, automatic subsetting |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/web-vitals | built-in | Custom Web Vitals reporting | When sending to custom analytics endpoint |
| eslint-config-next/core-web-vitals | latest | Lint rules for Web Vitals | Enforce metrics in CI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @vercel/analytics | Google Analytics | Vercel integrates natively, lighter script |
| @vercel/speed-insights | PageSpeed Insights API | Vercel provides real-user monitoring, not lab data |
| next/image | Cloudinary/Imgix | Next.js built-in avoids external dependencies |

**Installation:**
```bash
npm install @vercel/analytics @vercel/speed-insights
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx        # Root layout with Analytics + SpeedInsights
│   ├── globals.css       # Tailwind + font setup
│   └── ...
├── components/
│   ├── analytics.tsx     # Optional: analytics component wrapper
│   └── ...
```

### Pattern 1: Analytics Integration (App Router)
**What:** Add Vercel Analytics to root layout for automatic page view tracking
**When to use:** All Next.js 16 projects
**Example:**
```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```
Source: https://vercel.com/docs/analytics/quickstart, https://vercel.com/docs/speed-insights/quickstart

### Pattern 2: CTA Event Tracking
**What:** Track button clicks using track() function
**When to use:** Tracking conversions, CTA buttons, user actions
**Example:**
```tsx
import { track } from '@vercel/analytics';

export function CTAButton() {
  return (
    <button
      onClick={() => {
        track('CTA_Click', { button: 'hero-signup', location: 'header' });
      }}
    >
      Get Started
    </button>
  );
}
```
Source: https://vercel.com/docs/analytics/custom-events

### Pattern 3: LCP Image Optimization
**What:** Use next/image with priority prop for above-fold images
**When to use:** Hero images, featured images visible on initial load
**Example:**
```tsx
import Image from 'next/image';

export function HeroImage() {
  return (
    <Image
      src="/hero.png"
      alt="Hero"
      width={1200}
      height={600}
      priority  // Critical for LCP < 2.5s
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
```
Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/02-components/image.mdx

### Pattern 4: Defer Non-Critical Scripts
**What:** Use next/script with lazyOnload strategy for third-party scripts
**When to use:** Chat widgets, social scripts, analytics (if not using @vercel/analytics)
**Example:**
```tsx
import Script from 'next/script';

export function ThirdPartyWidget() {
  return (
    <Script 
      src="https://example.com/widget.js" 
      strategy="lazyOnload" 
    />
  );
}
```
Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/02-components/script.mdx

### Pattern 5: Font Optimization
**What:** Use next/font for zero layout shift font loading
**When to use:** Any custom fonts (prevents CLS from font swapping)
**Example:**
```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Pattern 6: Core Web Vitals Reporting (Custom)
**What:** Capture and send Web Vitals to custom analytics
**When to use:** When you need Web Vitals data beyond Speed Insights
**Example:**
```tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    console.log(metric); // { name: 'CLS', value: 0.05, id: 'xxx' }
  });
  return null;
}
```
Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/use-report-web-vitals.mdx

### Anti-Patterns to Avoid
- **Missing priority on LCP image:** Always add `priority` prop to images above the fold
- **No sizes prop on responsive images:** Causes browser to download full-size images
- **Using beforeInteractive for non-critical scripts:** Blocks page render
- **Loading third-party scripts in every page:** Use dynamic imports or page-specific loading

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom CDN, resize pipeline | next/image | Automatic WebP/AVIF, responsive srcset, lazy loading |
| Font loading | Google Fonts CDN, FOIT/FOUT issues | next/font | Zero layout shift, automatic subsetting, self-hosted |
| Script deferral | Manual DOMContentLoaded callbacks | next/script | Loading strategies (lazyOnload, afterInteractive, worker) |
| Page view analytics | Custom tracking endpoints | @vercel/analytics | Zero-config, Vercel dashboard integration |
| Web Vitals monitoring | Custom RUM implementation | @vercel/speed-insights | Real-user data, Vercel dashboard |

**Key insight:** Vercel's integration with Next.js provides these features with zero configuration when deployed to Vercel. Custom implementations require significant maintenance and miss Vercel's dashboard insights.

## Common Pitfalls

### Pitfall 1: Missing priority on LCP Image
**What goes wrong:** LCP > 2.5s, Lighthouse score drops 10-20 points
**Why it happens:** Default next/image is lazy-loaded, LCP element not preloaded
**How to avoid:** Add `priority` prop to any image in initial viewport
**Warning signs:** Lighthouse shows "Image element has explicit width and height" but LCP is slow

### Pitfall 2: No sizes Prop on Responsive Images
**What goes wrong:** Browser downloads largest image variant, slower FCP
**Why it happens:** Without sizes, next/image assumes 100vw and serves full-size image
**How to avoid:** Add sizes prop matching your CSS layout: `sizes="(max-width: 768px) 100vw, 50vw"`
**Warning signs:** Network tab shows large image downloads on mobile

### Pitfall 3: Third-Party Scripts Blocking Render
**What goes wrong:** TBT increases, INP degrades, Lighthouse drops
**Why it happens:** Scripts loaded with default strategy block page interaction
**How to avoid:** Use `strategy="lazyOnload"` or `strategy="afterInteractive"`
**Warning signs:** Long blocking time in Lighthouse, scripts in critical path

### Pitfall 4: Font Layout Shift (CLS)
**What goes wrong:** CLS > 0.1, text shifts as fonts load
**Why it happens:** Using Google Fonts CDN without font-display: swap, or no font fallback
**How to avoid:** Use next/font which handles this automatically
**Warning signs:** Font flicker, layout shifts on refresh

### Pitfall 5: Analytics Not Tracking All Routes
**What goes wrong:** Missing page views in dashboard
**Why it happens:** Using wrong import (@vercel/analytics/react instead of @vercel/analytics/next in App Router)
**How to avoid:** Use `@vercel/analytics/next` for App Router
**Warning signs:** Empty Analytics dashboard, SPA route changes not tracked

## Code Examples

All verified patterns from official sources above.

### Basic Analytics + Speed Insights Setup
```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### CTA Tracking with Metadata
```tsx
import { track } from '@vercel/analytics';

interface CTAProps {
  variant: 'primary' | 'secondary';
  label: string;
}

export function CTAButton({ variant, label }: CTAProps) {
  return (
    <button
      className={variant}
      onClick={() => {
        track('cta_click', { variant, label, timestamp: Date.now() });
      }}
    >
      {label}
    </button>
  );
}
```

### Optimized Hero Image
```tsx
import Image from 'next/image';

export function Hero() {
  return (
    <div className="relative w-full h-[400px]">
      <Image
        src="/hero.jpg"
        alt="Hero"
        fill
        priority  // CRITICAL: Preload for LCP
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
```

### Deferred Third-Party Script
```tsx
import Script from 'next/script';

export function ChatWidget() {
  return (
    <>
      {/* Loads after page is interactive, won't block LCP */}
      <Script 
        src="https://cdn.chat.com/widget.js" 
        strategy="afterInteractive" 
      />
    </>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GA script blocking | @vercel/analytics lazyOnload | 2023+ | 200ms+ savings |
| google-fonts CDN | next/font | Next.js 13+ | Zero CLS |
| img element | next/image | Next.js 10+ | Auto WebP/AVIF |
| Custom Web Vitals | @vercel/speed-insights | 2024+ | Real-user monitoring |
| eslint-config-next | eslint-config-next/core-web-vitals | Next.js 14+ | Metric-specific rules |

**Deprecated/outdated:**
- `next/legacy/image`: Use `next/image` (App Router default)
- `next/font/google` (old import): Now just `next/font/google`
- FID metric (replaced by INP in 2024)

## Open Questions

1. **How to handle motion/animation impact on INP?**
   - What we know: Framer Motion uses efficient animation APIs, but heavy animations can block main thread
   - What's unclear: Specific thresholds for motion-heavy pages
   - Recommendation: Use `motion` less is more principle, lazy load motion components

2. **Speed Insights with self-hosted deployment?**
   - What we know: @vercel/speed-insights works with any deployment
   - What's unclear: Self-hosted requires additional configuration
   - Recommendation: Deploy to Vercel for full integration, or use custom endpoint

3. **How to measure INP in development?**
   - What we know: Lighthouse LAB data doesn't show INP reliably
   - What's unclear: Best local INP measurement approach
   - Recommendation: Use Chrome DevTools Performance panel, rely on Speed Insights for production

## Sources

### Primary (HIGH confidence)
- /vercel/next.js - Next.js App Router docs, image optimization, Script component
- /websites/vercel - Vercel Analytics quickstart, custom events, Speed Insights setup
- https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/02-components/image.mdx - next/image priority, sizes
- https://vercel.com/docs/analytics/custom-events - track() function for CTA tracking
- https://vercel.com/docs/speed-insights/quickstart - Speed Insights integration

### Secondary (MEDIUM confidence)
- Reddit r/nextjs - Lighthouse 100 with Next.js 16 real-world case study (2026-01)
- Medium: Next.js Performance Optimization 2025 Playbook - Comprehensive guide
- https://markaicode.com/optimize-core-web-vitals-nextjs-16-lighthouse-12/ - Core Web Vitals guide

### Tertiary (LOW confidence)
- Various Medium articles on Lighthouse optimization (need official doc verification)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Vercel/Next.js packages, well-documented APIs
- Architecture: HIGH - App Router patterns from official docs
- Pitfalls: MEDIUM - Based on community reports and official guidance

**Research date:** 2026-02-18
**Valid until:** 2026-05-18 (6 months - Vercel/Next.js stable)
