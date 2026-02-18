# Pitfalls Research

**Domain:** Landing Page Redesign (MCP/SaaS Product)
**Researched:** 2026-02-18
**Confidence:** HIGH

---

## Critical Pitfalls

### Pitfall 1: SEO Foundation Destroyed During Redesign

**What goes wrong:**
Redesign causes rankings to drop significantly or disappear entirely. Traffic plummets 30-70% within weeks.

**Why it happens:**
Teams focus on visual redesign without auditing existing SEO elements. URLs change, meta tags get stripped, heading hierarchy breaks, canonical tags disappear, and internal links break during migration.

**How to avoid:**
- Audit current page's SEO elements before redesign: title tag, meta description, H1/H2 hierarchy, canonical URL, schema markup
- Maintain URL structure or implement proper 301 redirects for every changed URL
- Preserve existing heading structure and keyword placement
- Copy meta descriptions and Open Graph tags to new design
- Run a full SEO audit post-launch before announcing redesign

**Warning signs:**
- CMS change without SEO preservation plan
- "We'll fix SEO later" mentioned in planning
- No SEO checklist exists for launch

**Phase to address:**
Phase 1: Discovery & SEO Audit

---

### Pitfall 2: Conversion-Rate-Killing Visual Redesign

**What goes wrong:**
Redesign looks modern but conversion rates drop 20-50%. Visitors leave without taking action.

**Why it happens:**
Design teams prioritize aesthetics over conversion psychology. CTA buttons become subtle, above-the-fold value proposition disappears, trust signals get buried, and page becomes "too clean" with excessive white space.

**How to avoid:**
- A/B test critical conversion elements before full redesign
- Maintain or improve above-the-fold clarity: headline + subheadline + CTA must be visible without scrolling
- Keep CTA buttons prominent: high contrast, actionable text ("Get Started Free"), above the fold
- Preserve existing trust signals (logos, testimonials, ratings) in similar positions
- Design for scannability: use clear visual hierarchy, bullet points, and short paragraphs

**Warning signs:**
- Designers can't explain how each element drives conversions
- "Clean" redesign removes most copy
- No conversion rate benchmarks established before redesign

**Phase to address:**
Phase 2: UX/Conversion Planning

---

### Pitfall 3: Performance Regression

**What goes wrong:**
Page load time increases from 1s to 4s+. Core Web Vitals drop to "needs improvement" or "poor." Bounce rates spike.

**Why it happens:**
New design introduces heavier assets: uncompressed images, excessive JavaScript libraries, custom fonts without optimization, animations that block rendering, and third-party scripts loaded synchronously.

**How to avoid:**
- Set strict performance budgets: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Use modern image formats (WebP/AVIF) with responsive sizing
- Defer non-critical JavaScript and load third-party scripts asynchronously
- Implement lazy loading for below-fold content
- Test with Lighthouse/PageSpeed Insights before launch
- Budget for animation/ interactivity libraries — each one has a cost

**Warning signs:**
- No performance budget in design requirements
- Design file shows heavy animations or video backgrounds
- Team hasn't run Lighthouse audit on mockup

**Phase to address:**
Phase 3: Design & Development

---

### Pitfall 4: Mobile Experience as Afterthought

**What goes wrong:**
Desktop design gets most attention. Mobile users see cramped text, broken layouts, tiny CTAs, and horizontal scrolling. Conversion rates on mobile drop 40%+.

**Why it happens:**
Designers work on large monitors. Mobile responsive is "handled later" by developers. Touch targets remain undersized. Text becomes unreadable without zooming.

**How to avoid:**
- Design mobile-first, then scale up to desktop
- Ensure CTAs are at least 44x44px touch targets
- Test on real devices, not just browser dev tools
- Prioritize mobile Core Web Vitals (mobile-first indexing)
- Stack content vertically — no horizontal scrolling ever
- Ensure text is readable at default zoom (16px minimum)

**Warning signs:**
- "Make it responsive" is a developer task, not a design requirement
- No mobile mockups created during design phase
- Team hasn't tested on actual phones

**Phase to address:**
Phase 2: UX/Conversion Planning

---

### Pitfall 5: Brand Voice Inconsistency

**What goes wrong:**
Redesigned page feels like a different company. Returning visitors don't recognize the brand. Trust erodes. Messaging becomes generic.

**Why it happens:**
New designers don't understand the existing brand voice. Copy gets rewritten to sound "more professional." Unique brand phrases and positioning get replaced with industry jargon.

**How to avoid:**
- Document existing brand voice, key phrases, and positioning before redesign
- Include brand guidelines in design brief
- Preserve signature visual elements (colors, iconography, illustration style)
- A/B test new copy against existing messaging
- Get stakeholder sign-off on tone before design starts

**Warning signs:**
- No brand guidelines document shared with design team
- Copy gets completely rewritten without testing
- "Let's make it sound more enterprise" mentioned

**Phase to address:**
Phase 1: Discovery & SEO Audit

---

### Pitfall 6: Missing Trust Signals

**What goes wrong:**
Professional-looking page feels "too good to be true." Visitors hesitate to convert. B2B buyers request more proof before signing up.

**Why it happens:**
Redesign removes social proof to "clean up" the page. Customer logos, case studies, and testimonials get deprioritized or placed below the fold. Trust badges disappear.

**How to avoid:**
- Audit existing trust signals before redesign
- Place customer logos "above the fold" or immediately below hero
- Include at least 2-3 prominent testimonials near CTAs
- Add relevant trust badges (security, compliance) near forms
- Include specific metrics ("500+ companies trust us") rather than generic claims

**Warning signs:**
- Trust signals marked as "clutter" to remove
- No testimonials or case studies in new design
- Social proof placed below fold or on separate page

**Phase to address:**
Phase 2: UX/Conversion Planning

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Use JavaScript for everything | Faster initial development | Poor SEO, slow performance, accessibility issues | Never for content-heavy sections |
| Skip image optimization | Don't need design process | 2-4x larger page weight, failed CWV | Only for above-fold hero if using modern formats |
| Use generic placeholder copy | Can design faster | Must redesign once copy added, often breaks layout | Only in early wireframes, must be replaced |
| Load all fonts eagerly | No FOUT/FOIT | Blocks rendering, slows LCP | Never — use font-display: swap |
| Single CTA below fold | Simpler design | Major conversion loss | Never — above-fold CTA is required |
| Skip schema markup | Faster development | Missing rich snippets, reduced CTR | Never for product/service pages |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Analytics | Not implementing before redesign | Set up tracking 2 weeks before launch to benchmark |
| A/B Testing | Launching redesign without variant | Run A/B test on key conversion elements pre/post |
| Chat Widget | Adding too early or wrong position | Test placement post-launch, defer until stable |
| CDN | Not configuring for new assets | Pre-warm CDN cache before announcement |
| Forms | Breaking existing submissions | Test end-to-end form flow before going live |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Hero video background | LCP > 4s on mobile | Use poster image, defer video load | Any mobile traffic > 20% |
| Heavy animation library | INP > 500ms | Limit animations, use CSS where possible | Any interactive elements |
| Unoptimized fonts | FOUT, layout shift | Subset fonts, use woff2, set display: swap | First contentful paint |
| Third-party scripts | CLS spikes, delayed interactivity | Audit all scripts, defer non-essential | Any marketing/analytics tools |
| No lazy loading | Excess initial payload | Implement native lazy loading | Any page with > 5 images |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Vague CTAs ("Submit", "Click Here") | Users don't know what happens | Action-oriented: "Start Free Trial", "Get Your Demo" |
| Long forms (> 4 fields) | High abandonment | Progressive disclosure, start with minimal fields |
| No visual hierarchy | Content feels overwhelming | Clear H1 > H2 > H3, size and color contrast |
| Auto-playing audio/video | Annoying, often blocked | User-initiated only, muted by default |
| Excessive popups | Negative brand perception | Exit-intent only, respect "no thanks" |
| No loading states | Feels broken, impatient users | Skeleton screens, progress indicators |

---

## "Looks Done But Isn't" Checklist

- [ ] **SEO:** Title tag, meta description, Open Graph tags, heading hierarchy preserved
- [ ] **Performance:** Lighthouse score > 90 on mobile and desktop
- [ ] **Mobile:** Tested on real device (not just responsive mode)
- [ ] **Forms:** End-to-end submission tested with real data
- [ ] **Analytics:** Events firing correctly for all conversions
- [ ] **404s:** All old URLs redirect or return proper response
- [ ] **Trust signals:** Logos, testimonials, badges in place
- [ ] **CTA:** Above-fold, high contrast, actionable text
- [ ] **Accessibility:** Keyboard navigable, sufficient color contrast
- [ ] **Cross-browser:** Tested on Chrome, Firefox, Safari

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SEO dropped | HIGH | Implement 301s, restore meta, request re-index, expect 4-8 weeks recovery |
| Conversions down | MEDIUM | Roll back to previous CTA/position, A/B test incremental changes |
| Performance poor | LOW-MEDIUM | Image optimization, defer scripts, enable caching — can fix in days |
| Mobile broken | MEDIUM | Prioritize mobile fix, push hotfix within 24-48 hours |
| Brand mismatch | MEDIUM | Restore key brand elements, update messaging guidelines |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| SEO Foundation Destroyed | Phase 1: Discovery | SEO audit pass pre-launch |
| Conversion-Killing Redesign | Phase 2: UX Planning | A/B test results |
| Performance Regression | Phase 3: Development | Lighthouse > 90 |
| Mobile Experience | Phase 2: UX Planning | Real device testing |
| Brand Voice Inconsistency | Phase 1: Discovery | Stakeholder sign-off |
| Missing Trust Signals | Phase 2: UX Planning | Conversion benchmark maintained |

---

## Sources

- ViserX: "10 Common Landing Page Optimization Mistakes to Avoid in 2025"
- Moosend: "10 Landing Page Mistakes You Should Avoid in 2025"
- Peach: "Top 7 Landing Page Mistakes That Hurt Your Conversions in 2025"
- Email Mavlers: "9 UX Mistakes Killing Your Landing Page Conversions"
- DebugBear: "Why Core Web Vitals Assessment Failed & How to Fix It"
- LinkGraph: "Advanced Core Web Vitals: Diagnose, Prioritize & Fix"
- Search Engine Land: "Core Web Vitals: How to measure and improve your site's UX"
- SEOBoost: "How to do Landing Page SEO in 5 Steps"

---

*Pitfalls research for: MCPHERO Landing Page Redesign*
*Researched: 2026-02-18*
