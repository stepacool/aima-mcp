# Phase 2: Content & Design - Research

**Researched:** 2026-02-18
**Domain:** Landing page implementation with Next.js, Motion animations, Tailwind 4, dark mode
**Confidence:** HIGH

## Summary

Phase 2 requires building a complete landing page with Hero, How It Works, Use Cases, For Developers, Comparison, Trust, and Design sections using a Vercel/Linear aesthetic. The existing codebase already has the foundation: Next.js 16, Tailwind 4 with CSS variables for dark mode, motion library (v12.23.26), and shadcn/ui components. The marketing-specific CSS variables are already defined in globals.css.

**Primary recommendation:** Leverage existing Tailwind 4 CSS variables (`--marketing-*`) and motion's `whileInView` for scroll-triggered animations. Use shadcn/ui Button, Card components as base, customize for landing page aesthetics.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.1 | React framework | Required by project |
| Tailwind CSS | 4.1.18 | Styling | Already configured with CSS variables |
| motion | 12.23.26 | Animations | Production-ready scroll animations |
| next-themes | 0.4.6 | Dark mode | Already integrated |
| shadcn/ui | - | Components | Components already installed |

### Supporting (Already Installed)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| lucide-react 0.562.0 | Icons | All UI icons |
| tw-animate-css 1.4.0 | CSS animations | Simple entrance animations |
| geist | Font | Already configured as default |
| class-variance-authority | Variants | Button/Card variants |

### Already Configured
- Tailwind 4 with CSS variables in `app/globals.css`
- Dark mode via `@custom-variant dark (&:is(.dark *))`
- Marketing-specific CSS variables: `--marketing-bg`, `--marketing-fg`, `--marketing-accent`, `--marketing-card`, etc.
- Animations defined: `fadeIn`, `slideIn`, `marquee`

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (marketing)/           # Marketing routes group
│   └── page.tsx          # Landing page
├── components/
│   ├── landing/
│   │   ├── hero.tsx
│   │   ├── how-it-works.tsx
│   │   ├── use-cases.tsx
│   │   ├── for-developers.tsx
│   │   ├── comparison.tsx
│   │   ├── trust.tsx
│   │   └── footer.tsx
│   └── ui/               # Already exists
```

### Pattern 1: Scroll-Triggered Animation with Motion
**What:** Animate elements when they enter viewport
**When to use:** All landing page sections
**Example:**
```tsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  Content
</motion.div>
```

Source: https://motion.dev/docs/react/-motion-component

### Pattern 2: Staggered List Animation
**What:** Animate list items with delay between each
**When to use:** Use case cards, feature lists
**Example:**
```tsx
const container = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.ul variants={container} initial="hidden" whileInView="visible">
  {items.map(item => (
    <motion.li variants={item}>...</motion.li>
  ))}
</motion.ul>
```

Source: https://motion.dev/docs/react/-animation

### Pattern 3: Dark Mode with CSS Variables
**What:** Use existing marketing CSS variables for theming
**When to use:** All landing page components
**Example:**
```tsx
// Light: --marketing-bg: var(--color-neutral-50)
// Dark: --marketing-bg: var(--color-neutral-950)

<div className="bg-marketing-bg text-marketing-fg">
  Content
</div>
```

### Pattern 4: Button Variants for Landing Page
**What:** Use shadcn/ui button variants
**When to use:** CTAs in Hero and other sections
**Example:**
```tsx
import { Button, buttonVariants } from "@/components/ui/button";

// Primary CTA
<Button size="lg">Get Started</Button>

// Secondary/outline
<Button variant="outline" size="lg">Learn More</Button>

// Link style
<Button variant="link">View Docs →</Button>
```

### Pattern 5: Code Syntax Highlighting
**What:** Display code snippets in Use Cases section
**When to use:** Developer-focused content
**Example:** Use existing Shiki setup from fumadocs or install highlight.js

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode | Custom toggle | `next-themes` + existing `ThemeToggle` | Already implemented, handles system preference |
| Scroll animations | IntersectionObserver | Motion `whileInView` | Easier API, hardware accelerated |
| Button styles | Custom CSS | shadcn/ui `buttonVariants` | Already configured with focus states |
| Card styling | Custom borders/shadows | shadcn/ui `Card` + CSS variables | Already themed for dark mode |
| Icons | Custom SVGs | lucide-react | 1500+ icons, tree-shakeable |

## Common Pitfalls

### Pitfall 1: Missing Focus States
**What goes wrong:** Keyboard navigation fails accessibility
**Why it happens:** Forgetting `focus-visible` styles
**How to avoid:** Use existing `focus-visible:ring-*` classes in buttonVariants
**Warning signs:** Tab navigation not visible

### Pitfall 2: Hardcoded Colors Ignoring Dark Mode
**What goes wrong:** Landing page looks broken in dark mode
**Why it happens:** Using `bg-white` or `text-black` directly
**How to avoid:** Use CSS variables: `bg-marketing-bg`, `text-marketing-fg`
**Warning signs:** Explicit color values without dark: variant

### Pitfall 3: Animation Performance Issues
**What goes wrong:** Janky scroll animations
**Why it happens:** Animating layout properties (width, height, margin)
**How to avoid:** Animate `transform` and `opacity` only
**Warning signs:** Layout shift on scroll

### Pitfall 4: Missing Viewport Settings
**What goes wrong:** Animations trigger too early/late
**Why it happens:** Not configuring viewport margin
**How to avoid:** Set `viewport={{ once: true, margin: "-100px" }}`
**Warning signs:** Animations firing unexpectedly

### Pitfall 5: Not Using Container Class
**What goes wrong:** Inconsistent max-width across sections
**Why it happens:** Missing container wrapper
**How to avoid:** Use Tailwind 4 container: `<section className="container">`
**Warning signs:** Varying content widths

## Code Examples

### Hero Section Structure
```tsx
<section className="container py-24 md:py-32">
  <div className="mx-auto max-w-3xl text-center">
    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl md:text-6xl font-bold tracking-tight"
    >
      Headline
    </motion.h1>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-4 text-lg text-marketing-fg-muted"
    >
      Subheadline
    </motion.p>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-8 flex gap-4 justify-center"
    >
      <Button size="lg">Get Started</Button>
      <Button variant="outline" size="lg">Learn More</Button>
    </motion.div>
  </div>
</section>
```

### Use Case Card with Code
```tsx
<Card className="group">
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
  <CardContent>
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
      <code>{codeSnippet}</code>
    </pre>
  </CardContent>
</Card>
```

### Trust Section with Logo Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
  {logos.map((logo) => (
    <img 
      key={logo.alt}
      src={logo.src}
      alt={logo.alt}
      className="h-8 w-auto grayscale opacity-60 hover:opacity-100 transition-opacity"
    />
  ))}
</div>
```

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HERO-01 | Headline | Use motion animate + typography classes |
| HERO-02 | Subheadline | Motion with delay for layered reveal |
| HERO-03 | CTAs | shadcn/ui Button with size="lg" |
| HERO-04 | Product visual | Motion fade + scale for hero image |
| HERO-05 | Social proof | Trust badges below CTAs |
| HERO-06 | Mobile-responsive | Tailwind responsive classes (md:, lg:) |
| HERO-07 | Dark mode | Use existing marketing CSS variables |
| HOW-01 | Wizard flow | Steps with icons + motion stagger |
| HOW-02 | Icons | lucide-react icons |
| HOW-03 | Descriptions | Card component with title/description |
| HOW-04 | Visual flow | motion viewport animations |
| USECASE-01 | Grid of cards | CSS Grid + Card component |
| USECASE-02 | Code snippets | pre/code with bg-muted |
| USECASE-03 | 4-6 cards | Map over useCases array |
| USECASE-04 | Visual cards | Card hover effects |
| DEV-01 | Python package | Section content |
| DEV-02 | Install command | Code block with pip/uv |
| DEV-03 | Code example | Syntax-highlighted code |
| DEV-04 | Docs link | Button variant="link" |
| DEV-05 | Visual section | Card layout |
| COMP-01 | Vs self-hosting | Comparison table |
| COMP-02 | Vs FastMCP | Feature comparison |
| COMP-03 | Vs official SDK | Feature comparison |
| COMP-04 | Visual table | Table or Card grid |
| COMP-05 | Clear winner | Highlighted differences |
| TRUST-01 | Logos | grayscale + opacity styling |
| TRUST-02 | GitHub stars | Badge/stat component |
| TRUST-03 | Docs link | Link component |
| TRUST-04 | Footer | Footer component with links |
| DESIGN-01 | Vercel/Linear aesthetic | Use Geist font, minimal design |
| DESIGN-02 | Dark mode | Already configured |
| DESIGN-03 | Spacing | Tailwind spacing classes |
| DESIGN-04 | Heading hierarchy | text-4xl/6xl, font-bold |
| DESIGN-05 | Accessibility | focus-visible, aria-labels |
| DESIGN-06 | Focus states | buttonVariants already includes |
| DESIGN-07 | Animations | Motion whileInView |

## Open Questions

1. **Content details**
   - What's the exact hero headline/subheadline copy?
   - What are the 4-6 use cases to display?
   - What logos for trust section?
   - What's the comparison data?

2. **Product visual**
   - What type of visual for hero (screenshot, demo, video)?
   - Should it use motion for any animations?

3. **GitHub stars count**
   - Should this be dynamic or static?

**Recommendation:** Get content details from product team before implementation. These don't block research but will be needed for planning.

## Sources

### Primary (HIGH confidence)
- Motion docs - `mcp__context7__/websites/motion_dev_react` - Scroll animations, variants
- shadcn/ui - `mcp__context7__/websites/ui_shadcn` - Dark mode configuration
- Existing codebase - `frontend/app/globals.css` - CSS variables setup
- Existing codebase - `frontend/components/ui/button.tsx` - Button API
- Existing codebase - `frontend/components/ui/card.tsx` - Card API

### Secondary (MEDIUM confidence)
- Tailwind CSS v4 docs - New CSS-first configuration
- next-themes documentation - Theme switching patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and configured
- Architecture: HIGH - Clear patterns from existing codebase
- Pitfalls: HIGH - Well-documented with existing solutions

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days - stable stack)
