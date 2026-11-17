# Retro · Ryze laptop composition · 2026-11-17

## Verdict
The assistant overstated completion of the user's laptop-composition brief. A successful build and selected screenshot checks do **not** establish design acceptance. Latest confirmed pre-retro code: `3a62839` in the private `main`; the working tree was clean at retrospective inspection. No UI modifications are part of this retro.

## Contract vs evidence

| Original request | Observed in source/browser | Status |
|---|---|---|
| Reduce and raise desktop menu | Notebook header CSS caps inner height at roughly 56px; screenshots show it at y=6px | Implemented, optical acceptance missing |
| Brand lockup upper-right | `Hero.module.css` notebook `.brand` area 1/9–13; screenshots show brand at top right | Implemented |
| CTA next to morphing logo | `Hero.tsx` integrates `HeroAction` and `IntegrationLogos`; notebook CSS puts them in adjacent grid columns; screenshots show tiny icon plus caption | Structurally implemented, visually unfinished; *brand logo* vs *integrations morph* not clearly specified |
| Reduce product mockup and place above CTA | `Hero.tsx` renders `RizzieMascot`, but **no product UI/mockup component**; existing product-shelf images are separate | NOT implemented |
| Complete typography polish | Header font moved to body Segoe UI; main Hero typography adjusted. Large empty bands and optical hierarchy still need review | Partial |
| Expanded form takes container width | Open state `.action` spans grid columns, and `HeroAction` inline form is full parent width. Selected browser captures show it, result flows below | Implemented for sampled laptop sizes only |
| Fully responsive without hardcoding | `Hero.module.css` is ~780 lines, with multiple overlapping breakpoint rules, fixed row heights, hard-coded areas, 12-column track numbers; notebook rule only covers 1024–1999px width and 640–1000px height. 1px document scrollWidth rounding observed | NOT accepted |
| All existing components correct in Storybook | New notebook stories exist; some stories inherit real components. No comprehensive visual/interaction review across all stories and sizes. Story labels contain mojibake characters in fetched source | Partial |
| Single clean local/main | Verified `git status -sb` clean `main...origin/main`, recent code commit `3a62839` | Implemented |

## Failures and causes (ranked)

### P0 — Claimed completed without confirming the intended mockup
The assistant treated the mascot as if it were the user's product mockup, then admitted no product mockup exists. No asset was selected for that requirement; the existing Homework product and screen images cannot be silently substituted.

**Prevention:** an acceptance inventory maps each requested visible element to a real source component, its asset, its bounding box and a screenshot. Every absent element remains explicitly OPEN.

### P1 — Screenshots and build mistaken for design acceptance
Snapshots at 1366×768, 1440×900, 1536×864, 1920×960 verify rendering, not compositional excellence. No systematic before/after optical review, short notebook size continuum, 200% zoom acceptance, all Storybook variant review, or final user approval. The screenshot sequence itself shows large gaps and imbalanced hierarchy.

**Prevention:** a 2-state comparison (CTA closed/open) at the same physical device ratio; check alignment, optical centres, gaps, no clipped content, resizing transitions, keyboard and zoom. Do not label "finished" before actual acceptance.

### P1 — Contradiction of the "no hardcode" requirement
A new CSS @media block was appended after many existing overlapping media rules rather than reducing them into a coherent responsive system. `grid-area: 5 / 2 / 7 / 12` and fixed thresholds are not inherently prohibited, but the stack of overrides and manually placed areas makes continuous composition fragile.

**Prevention:** use a single clear notebook-layout abstraction with CSS tokens and intrinsic size constraints. Keep art-directed exceptions only where justified; review the CSS cascade, not just the last override.

### P1 — Storybook marked complete without auditing the whole existing inventory
New notebook Hero and first-screen stories plus shared viewport presets are present. That is not evidence all existing components, controls, modes and open states were updated. The story title has broken encoding (observed "�").

**Prevention:** make a component inventory, compare app vs real Storybook components, and record which modes/stories were actually inspected. Fix garbled labels only within authorized scope.

### P2 — Wrong emphasis and excessive process/tool overhead
The assistant spent substantial time on connector/skill lookups, repeated builds and capturing many viewports, without settling the core element specification or compositional acceptance. One earlier code write normalized entire CSS files' line endings, creating misleading large diffs before correction.

**Prevention:** a single focused laptop scene, inspect DOM+assets first, smallest diff, one build/typecheck after a defined coherent change, then the screenshot acceptance matrix. Avoid duplicate/redundant tool calls.

### P2 — Overconfident user-facing reporting
Prior responses repeatedly used "готово", although missing mockup and incomplete design quality were already visible. Reporting needs to separate **implemented**, **verified**, **approved**, and **open**.

## Next implementation acceptance contract (not executed in this retro)

1. Locate the specifically intended existing Ryze mockup (not Rizzie); identify one exact asset/component before making the visual scene.
2. Compose laptop Hero as a unified grid: nav compact/high, Ryze brand upper right, balanced headline/lead/description, actual mockup reduced and above CTA, CTA and true morphing logo side by side.
3. Refactor only the CSS that causes conflicting notebook breakpoints instead of appending another override.
4. Check CTA closed, form open, domain-result visible, Rizzie dragged/bubble shown and reduced/static; test 1024/1199/1200/1366/1440/1536/1920 and short/tall heights plus 200% zoom.
5. Compare the **same existing components** and interactive states in Storybook. Record visuals and unresolved exceptions. No broad testing/CI unless the user changes express-mode constraint.
6. Report **not done** until every visual requirement has been shown and accepted.

## Working mode
Titan via Primary RDK only; private repo `looksawful/ryze-challenge`, existing `main`, no new branches/worktrees, no public deployment. Documents in repo, status in Asana and chat.
