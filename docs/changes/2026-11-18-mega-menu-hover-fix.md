# MegaMenu hover-gap fix — 2026-11-18

Project: `looksawful/ryze-challenge`; branch `main`, private repo. Local source: `D:\inwork\ryze-challenge`.

## Bug and evidence

On MacBook `Lilith.local` (macOS 15.3, Chrome), Products / Solutions / Resources MegaMenu would open on hover and close before the cursor could reach its links. The top-level button ends at y=56px; panel begins at y=68px. When the cursor reached y=57px, `onPointerLeave` on `desktopNavigation` closed the active group. Reproduced at 1440×900 in Chrome on Mac before the change.

The primary reproduction is `/Users/sonia/Desktop/ryze-nav-qa-20261118/hover-regression.cjs` on Mac. Before change: `FAIL: products should remain open at y=57`. After source rebuild: `PASS products / growth / resources trigger -> panel -> link`, running **without browser CSS injection**.

## Fix

`src/features/site-shell/SiteHeader.module.css` adds a transparent ::after pseudo-element to the desktop navigation whenever a megaPanel exists. Its pointer-active area bridges the visual gap, sits under the real panel (z-index 95 vs 96), and only applies to dock desktop (>=75rem). The 28px bridge was verified on Mac; a 13px variant had failed at y=63px. No change to JS event semantics, visual dimensions, motion, content, or mobile layout.

## Checks

- `npm run build`: PASS.
- `npm run typecheck`: PASS.
- `git diff --check`: PASS.
- Mac browser hover test (1440×900, reduced-motion): PASS all three menus after build.
- Mac Chrome final browser regression (no CSS injection): PASS 15/15 hover paths across 1200×850 Reduced, 1440×900 Reduced, 1440×900 Full, 1920×1080 Full, and 1440×900 Reduced in compact-after-scroll mode (scrollY 500, data-docked=true).
- Keyboard ArrowDown / Escape checks: PASS 5/5.
- Mobile drawer regression after source build: PASS 390×844, 320×568, 874×402 landscape, Duo 951×669; 19 menu links, Muse reachable after scroll, close returns focus, no pageerror events.
- Machine-readable results: `/Users/sonia/Desktop/ryze-nav-qa-20261118/final-desktop-qa.json` and `mobile-results.json`.
- Mac QA source, screenshots, JSON traces and previous report: `/Users/sonia/Desktop/ryze-nav-qa-20261118/`.

## Rollback

Restore only the added `desktopNavigation:has(.megaPanel)::after` declaration and surrounding @media block from SiteHeader.module.css; leave all other modifications untouched.

Private git push permitted; **no public deployment**. Existing Asana T04 is the tracking record; do not create GitHub Issues.
