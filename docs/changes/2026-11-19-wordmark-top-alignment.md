# Ryze · Align visible desktop wordmark with navigation top (19 Nov 2026)

## Observation
The hit area of the Ryze wordmark and the navigation dock had matching center lines, but the SVG itself was vertically centered inside the 44 px hit area. The artwork therefore started below the menu's upper edge, especially at 1200 px.

Measured on the published source at 1200×800:
- navigation top: 12 px
- logo container center: 34 px
- SVG image top: 18.78 px
- offset: +6.78 px

## Change
- `SiteHeader.module.css`: on the desktop dock variant only, use `align-self: flex-start` on `.brandImage`. The 44 px interactive link, its common positioning with navigation, image scale, contact button, mobile styling, and scrolling transitions remain unchanged.
- `scripts/browser-smoke.test.mjs`: extend header geometry assertions to cover the actual SVG image top, not just its parent hit area.

## Verification
- RED: new browser assertion failed against the previous build at 1200×800, reporting SVG top 18.78 px vs nav top 12 px.
- GREEN: Chromium 16/16 browser cases PASS (1200×800, 1440×900 and 1920×1080, both dock states, responsive and no-JS checks).
- Unit/contract tests 14/14 PASS; Next.js production build PASS; TypeScript PASS; ESLint PASS.
- Existing footer removal, mobile navigation and cookie behavior remain untouched.

## Isolation
Worked from the latest `origin/dev` in a temporary detached worktree, avoiding the original Titan checkout with unrelated uncommitted edits. Commit on `dev` deploys through GitHub Pages.

## Rollback
Revert the one-line desktop `.brandImage { align-self: flex-start; }` rule if visual requirements change; keep the regression test aligned with the chosen top-edge contract.
