# BrandMark particle intro · QA and release record

> Historical QA/release snapshot. Current behavior: source code; open work and acceptance: GitHub Issues. Dates and branch status below refer only to this checkpoint.

Date: 2026-11-16
Scope: [Issue #15](https://github.com/looksawful/ryze-challenge/issues/15), brand entrance only.

## What shipped
- Isolated static-export page: `public/ryze-logo-intro.html` (URL: `/ryze-logo-intro.html`).
- Exactly one source-derived Ryze SVG mark, centered on a pure black stage, without Hero copy, menus, controls or decorative backgrounds.
- A progressive optional Canvas 2D particle gather lasting 3.5 s, deterministic seeded flow and crossfade to the **same** SVG silhouette.
- Responsive `min-block-size: 100svh` and intrinsic centered mark size; 1.1k–2.4k particles scaled by view.
- Static SVG is primary HTML content. Motion runs only with JS, a working Canvas 2D context and `prefers-reduced-motion: no-preference`.
- Plays once per session (`sessionStorage`); mouse/touch click or keyboard Enter/Space replays. Hidden tab stops, no perpetual RAF after completion.
- No external JS, CSS, font or media dependencies.

## Scope boundary
The user asked for **only the mark on black**. This release creates a direct-access, standalone page; it does **not** replace the main Hero, integrate an automatic overlay into the landing page, or alter integration logo morphing. Stacked responsive Hero #9 is not yet accepted into dev. Future embedding requires design acceptance.

## Verifications on Titan
- TDD: new assertions failed before HTML existed, passed 3/3 after implementation.
- `npm test`: foundation + brand intro tests PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; static HTML exported to `out/ryze-logo-intro.html`.
- `npm run test:static`: PASS.
- `npm run typecheck`: PASS after Next generated types on build (direct typecheck before build fails in the **existing** layout typegen dependency).
- Headless browser matrix: Chrome, Opera, Yandex, Firefox, WebKit × desktop, mobile, reduced motion, JS off = **20/20 PASS**.
- Chrome: 3.5s completion, one shot per session, click replay all PASS.
- Captured frames in local `qa-reports/` (not committed). Verified actual source SVG geometry and black-only stage.
- Real iPhone Safari, real GPU load / FPS, production CDN, external published URL: **not verified**.

## Rollback / stop
The route is independent and not linked from the landing page. Revert the HTML/test/docs commit from the affected branch to remove it; no other route, dependency, data or schema must be reverted.

## Future work
- Obtain visual approval of the intro.
- Finish #8 / #9 Hero review and merges.
- If approved, integrate the standalone intro with the live Hero and retest the interaction, including actual device motion/performance. Do not assume approval for this from shipping the standalone route.
