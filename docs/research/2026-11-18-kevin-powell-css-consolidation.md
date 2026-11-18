# Ryze CSS consolidation: Kevin Powell code-pattern research

**Date:** 2026-11-18  
**Scope:** Research and recommendations only. No source-code edit, merge, test run, or deployment in this research pass.  
**Evidence:** Kevin Powell's first-party lessons and source repositories, cross-checked against `looksawful/ryze-challenge` remote `main` CSS. Local uncommitted Titan/Storybook changes were **not** inspected in this pass; reconcile them before implementation.

## Primary-source findings

1. **Start with reusable layout fundamentals, then exceptions.** In [Responsive Design Patterns](https://github.com/kevin-powell/responsive-design-patterns), Powell explicitly recommends starting with typography, color, spacing, wrappers, recurring layouts, and then narrowing into small component exceptions. His [Dynamic Grid Layout source](https://github.com/kevin-powell/dynamic-grid-layout/blob/main/style.css) uses a small set of useful layout primitives (`container`, `flex`, `grid`, `flow`), scoped custom properties, and fluid spacing. **Ryze application:** keep the existing foundation and semantic tokens; remove competing copies of one Hero rule instead of adding another override.

2. **Break when the design breaks, not at a device name.** [Picking a Breakpoint](https://css-fundamentals.kevinpowell.co/3-layouts/responsiveness/picking-a-breakpoint/) explicitly advises against device-centered breakpoint selection. His own [Grid teaching example](https://github.com/kevin-powell/learn-grid-the-easy-way/blob/main/style.css) has several breakpoints because its *compositions* genuinely change. **Ryze application:** start with one wide/narrow Hero composition switch; permit an additional tested exception for tight landscape or short displays when intrinsic layout alone cannot solve it. One breakpoint is a hypothesis, not a dogma.

3. **Use intrinsic layout and honor minimum content size.** [Intrinsic Patterns](https://css-fundamentals.kevinpowell.co/3-layouts/responsiveness/intrinsic-patterns/) demonstrates `flex-wrap`, Grid `repeat(auto-fit, minmax(min(var(--min-col-size), 100%), 1fr))`, and locally scoped variables. **Ryze application:** a true Grid slot for Rizzie, composer, and integrations; no absolute positioning for the same row unless it is genuinely decorative. Keep `min-inline-size: 0` where content may otherwise force overflow. The existing integrations container query is a positive precedent.

4. **Fluid display type must be bounded and zoom-aware.** [Responsive Typography](https://css-fundamentals.kevinpowell.co/3-layouts/responsiveness/responsive-typography/) warns against pure viewport-unit font sizing; Powell prefers intrinsic scaling but combines relative `rem` and viewport terms inside `clamp()`, with explicit minimum and maximum. **Ryze application:** preserve asymmetrical two-line H1 alignment with one fluid font-size definition per composition; set independent readable line measures (`max-inline-size: 30ch` for the lead, roughly `50ch` for body copy) and left-align paragraphs. Choose actual values visually and test zoom; do not copy generic clamp numbers into production without measurement.

5. **Understand the cascade before creating more CSS rules.** The [New CSS Toolkit 2026: Cascade Layers](https://new-css-toolkit-2026.kevinpowell.co/1-organization/2-cascade-layers) explains layer precedence and why normal unlayered declarations outrank normal layered ones. **Ryze application:** current CSS modules already use `@layer components`; preserve that convention. Consolidate repeated selectors in-place and keep specificity low. Do not add a second design system, another layer hierarchy, `!important` patch, or a generic utility framework.

6. **CSS owns layout, JS owns real state and choreography.** [CSS is eating JavaScript (CSS Day 2026)](https://www.kevinpowell.co/talks/css-is-eating-js/) illustrates declarative styling driven by semantic attributes. Some 2026 features in that talk have limited cross-browser support: do **not** make experimental `if()` or advanced `attr()` a release dependency. **Ryze application (inference):** CSS places text, form and pet; React controls states; GSAP controls entry choreography; WebGL/Canvas produces brand visuals. No GSAP calculations for ordinary responsive placement.

## Concrete Ryze repository inspection

Remote `main` blobs inspected on 2026-11-18. These metrics are *snapshot values*, not an assertion about Titan's uncommitted working tree.

| File | Approximate size | Repetition observed | Recommendation |
|---|---:|---|---|
| `src/features/hero/Hero.module.css` | 1,104 lines | 38 `@media` conditions; `.hero` 21 selector blocks; `.headline` 15; `.mascot` 16 | **P0:** consolidate normal Hero composition and mobile variant; remove obsolete brand/contact rules only after reference search |
| `src/features/site-shell/SiteHeader.module.css` | 1,243 lines | 16 media conditions; recurring dock/inner/mobile dialog selectors | **P1:** group dock and drawer declarations by responsibility; preserve functional desktop/mobile differences |
| `src/features/site-shell/HeroWithNavigation.module.css` | 96 lines | Last `:has([data-conversational-hero])` rule forces visibility and uses `!important` | **P0:** remove conflicting visual override by giving the existing intro phase one owner and retaining immediate static/reduced-motion access |
| `src/features/hero/HeroConversation.module.css` | 153 lines | Small, mostly local; 1 `!important` in screen-reader utility | **P2:** do not rewrite just to shorten; preserve form accessibility |
| `src/features/integrations/IntegrationLogos.module.css` | 103 lines | Already includes a size-based `@container` rule | **Keep:** use as a positive example for intrinsic responsive behavior |
| `src/ui/Typography.module.css` | 22 lines | Single source for heading/lead/paragraph font declarations | **Keep:** let Hero adjust scoped type properties; avoid duplicating global font rules |

### Suggested minimal Hero layout pattern (original adaptation, **not** copied Kevin code)

```css
.hero {
  inline-size: min(calc(100% - 2rem), 84rem);
  margin-inline: auto;
  display: grid;
  gap: clamp(1rem, 1.5vw, 2rem);
}

.headline {
  --type-heading-size: clamp(3rem, 1.5rem + 5vw, 7.5rem);
  line-height: .98;
}
.headline > span { display: block; }
.headline > span:last-child { text-align: end; }

.lead { max-inline-size: 30ch; }
.description { max-inline-size: 52ch; line-height: 1.5; }

/* Add one structural switch only when the actual layout needs it. */
@media (width < 50rem) {
  /* Define the narrow composition here, not in multiple later overrides. */
}
```

The code above illustrates *direction*, not a production-ready drop-in: the actual Hero has Rizzie, the email composer, integrations, safe-area and interactive states that must stay intact.

## Codebase-design and Ponytail decisions

- **Deep module with small interface:** `Hero` owns semantic content and layout; `HeroWithNavigation` owns the intro lifecycle; `HeroConversation` owns input/feedback; `SiteHeader` owns navigation; Canvas reports effect events. Avoid duplicate owners of CSS visibility and timing.
- **Deletion test:** do not add new CSS utility modules for unique Hero rules. Instead remove stale selectors, overridden breakpoints and duplicate state-dependent effects once every reference and Storybook story is checked.
- **Not recommended:** migrate CSS to Sass/Tailwind, copy an entire Powell demo stylesheet, remove all media queries mechanically, move CSS layout logic into JS, introduce extra runtime engines, or rewrite working Storybook foundations.

## Implementation order and acceptance

1. Reconcile local Titan dirty worktree against remote `main`; establish ownership. Do not reset, stash or reformat another contributor's work.
2. Trace Hero selectors and Storybook usage; remove duplicate/obsolete CSS and keep one named wide/narrow composition. Make only a minimal, reviewable diff.
3. Resolve CSS-versus-GSAP ownership of initial visibility (paper-logo intro → wind/fade → text/CTA/header). Keep reliable no-JS, reduced-motion and WebGL fallback.
4. Consolidate SiteHeader mobile/dock CSS only after the Hero baseline is stable. Keep keyboard focus and drawer behavior.
5. Single batched visual review across mobile (320/390), laptop (900–1200), desktop (1440/1920), short landscape and 200% zoom. Check typography, pet position, form and no horizontal overflow. After fixes, one final typecheck/build and a clean selective commit.

**Success criteria:** source has one obvious layout owner for each slot, the main visual direction is unchanged, no first-frame flash, Storybook uses the same production modules, and a reviewer can find and change any Hero layout constraint without hunting through many override blocks.

**Limit:** this review used the remote `main` CSS snapshot, which may not contain newer local dirty changes. Re-evaluate before deleting or changing source code.
