# Visual system contract

Status: Approved foundations; implementation and individual component visuals are evaluated separately.

## Theme and product roles
- `data-theme="dawn"`: light background; `data-theme="dusk"`: dark background.
- Hero defaults to dusk. Dawn may appear on nested surfaces where composition requires it.
- Components inherit semantic color roles from their nearest theme context; only explicitly contrasting subtrees override them.
- Accent on the current product: `#FF5AF1`. Keep a canonical raw accent and derive subsidiary colors only after contrast review.
- Other product accent colors are provisional. Muse needs its own distinct accent, not a guessed value.
- Theme (color context), product accent, visual variant, interaction state and layout order are different concepts.

## CSS cascade and progressive enhancement
Declare layers first, in this exact order:

```css
@layer reset, tokens, base, layouts, components, states, utilities;
```

- Keep authored declarations inside layers; unlayered normal rules can accidentally override layered rules.
- First render accessible, readable and usable semantic HTML without animation or JavaScript.
- Use `prefers-reduced-motion: no-preference` to opt in to nonessential motion. No animation is the starting behavior.
- Prefer native CSS and intrinsic layouts: Grid, Flexbox, `min()`, `max()`, `clamp()`, `minmax()`, `auto-fit`, container queries and limited page-level media queries.
- Layout primitives are opt-in and composable: wrapper, flow, stack, prose, cluster, repel, split, pile, grid, bento, reel.
- For horizontal reels, visually suppress the scrollbar while preserving wheel/touch/keyboard scrolling, visible affordances and focus.
- Visual reordering with `order`, `row-reverse` or Grid must never make keyboard/screen-reader order misleading.

## Typography
- Primary stack: `"Segoe UI", system-ui, sans-serif`.
- The approved navigation uses locally hosted Satoshi; the general Hero and body typography retain their existing stacks. Do not impose navigation typography globally.
- Fluid text sizes are selective: major headings, some leads and special compositions only. Regular body copy, controls, validation and fallback text use stable readable sizes unless justified.
- Text contrast, wrapping and measured line lengths matter more than decorative scaling.

## Components and Storybook
- Organize code by feature. Atomic Design labels may describe hierarchy, but do not force filesystem folders.
- Organisms expose meaningful variants using semantic `data-variant`, `data-state`, `data-theme` and, when appropriate, `data-order`.
- Specify valid data attributes with TypeScript, separating user-visible state from presentation.
- Storybook uses actual application components. Install/configure it initially but do not add stories until individual organisms are approved.
- Theme variations exist only where actually used, not automatically for every component.

## Validation
- On each PR, CI runs only `build` and `typecheck`; lint and focused logic tests run locally when relevant. One Chrome smoke and the full visual, accessibility and real-device matrix belong to release acceptance (#16).
- User performs manual sign-off on iPhone, Mac and desktop; these checks remain pending until actually completed.
- Inspect static HTML output with client-side JavaScript disabled; meaningful content and basic actions must survive.
- Optional WebGL/GSAP enhancements may fail or be disabled without leaving blank essential content.

References: Kevin Powell's intrinsic CSS layout/container-query techniques; Matt Pocock's TypeScript component-contract practices. These principles are guidance, not authorization to copy third-party source.
