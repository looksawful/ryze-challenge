# Rizzie hit-area overlap · Debug report · 2026-11-17

Scope: fix two confirmed hit-testing bugs in the **private** Ryze Challenge preview. No navigation redesign, no mascot event-handler changes, no external deployment.

## Reproduction (red)
- In current prod `d385d26`, Chrome 320×568: fixed Cookies intersected Rizzie by roughly 3,351 px² and blocked 3/9 sampled click points.
- Chrome 874×402: fixed bottom Dock intersected the Rizzie anchor by 6,080 px² and overlapped the CTA by 2,880 px²; 0/9 click points reached Rizzie. Real macOS Safari independently confirmed that the Dock captured the center hit.
- `node scripts/rizzie-hit-target.browser.mjs`, with `RYZE_QA_URL` pointed at the old private `:3003` export, failed 12/14 cases before the fix. The test measures actual DOM rectangles and `elementFromPoint` at three-by-three points; it is not a regex/source-code test.

## Root causes
1. In short mobile viewports the Hero keeps an oversized empty mascot stage below the description, so the floating Cookies panel overlaps the active pet.
2. In 700–1023px landscape the Hero fills 100svh even though a 76px Dock covers the final strip. The pet also shares the CTA column, so moving it up alone would introduce a new conflict.

## Scoped fix
- Shrink the **empty stage**, with compact proportional Rizzie sizing on short phones; keep the headline, copy and CTA unchanged.
- For the shortest mobile viewport (<568px tall), place the demo consent notice in document flow rather than block interactive content. Consent remains usable by scrolling; no tracking runs.
- For 700–1023px landscape, reserve 76px Dock plus an 8px gap in the Hero track, move compact Rizzie to the unused left margin, and keep its bottom inside the visible track even when content forces intrinsic Hero height.
- No changes to navigation code, gestures, JavaScript handlers or text.

## Verification (green)
- Windows Titan isolated worktree and private static build: `npm run lint`, `npm run typecheck`, `npm test` (28/28), `npm run build`, `npm run test:static` (4/4), `npm run build-storybook`: pass.
- Browser test using headless Chrome: 19/19 viewports pass including 320×568, 874×402, 874×600, 700×320, 1023×402, 1440×1024; 9/9 hit samples where fully visible; for tiny phone viewports first scroll the pet into view. No overlap with Cookie notice, Dock, Hero CTA, or description; no horizontal overflow.
- Real Safari on Lilith.local over private Tailscale preview `:3004`: CSS widths 320, 402, 874, 1440 tested; Rizzie clickable, opens correct drawer/inline mode, focus moves to input; native Escape closes drawer and returns focus. At a 320px CSS viewport, Safari window height ~516px and consent is in-flow; scroll exposes pet without obstruction.
- Earlier P0/P1 consent behavior retained and tested.
- Focused script: set `RYZE_QA_URL` explicitly to the private static preview URL, then run `node scripts/rizzie-hit-target.browser.mjs` (requires local Chrome).

Remaining scope: full Issue #16 QA and physical iPhone Safari not represented by the desktop emulations. `prod` branch merges are **not** public deployment; do not publish GitHub Pages, Cloudflare or public preview without a new direct user instruction.
