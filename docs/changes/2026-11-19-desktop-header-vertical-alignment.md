# Desktop dock header vertical alignment — 2026-11-19

## Problem
Review of the deployed Ryze challenge found independent vertical geometry for the logo, desktop navigation and Contact us CTA. Their center lines differed. At 1200×800 before the patch, the header was measured in Chromium at logo Y=43.20 px, nav Y=34 px and CTA Y=38 px.

## Scope and change
- Only desktop layouts (min-width: 75rem) and the existing `dock` header variant.
- CSS custom properties represent the dock top inset, normal/compact row height and 44 px control height.
- Logo and CTA positions now derive from the same center line as the navigation dock. Logo and Contact us use a common 44 px interactive box.
- The existing desktop compact-height media query and `data-docked` state retain their native dimensions. The logo is intentionally hidden in `data-docked=true` and this behavior was not changed.
- No changes to JSX, menus, links, mobile/tablet rules, content, hover behavior or animation timing.

## Verification
- TDD red: new browser test failed on baseline at 1200×800, logo Y=43.20 px vs nav Y=34 px.
- TDD green: browser smoke 16/16, including new geometry check at 1200×800, 1440×900 and 1920×1080, both dock states; existing transition allowed to settle before measurements.
- Existing unit and contract tests: 14/14.
- Next.js webpack production build: PASS.
- Next.js typecheck: PASS.
- ESLint: PASS.
- Storybook static build: PASS (existing Vite module-directive and chunk-size warnings).
- In a separate detached worktree; original `D:\inwork\ryze-challenge` working tree was not altered, including its other contributors' uncommitted changes.

## Files
- `src/features/site-shell/SiteHeader.module.css`
- `scripts/browser-smoke.test.mjs`
- This report

## Rollback
Revert this single isolated commit if geometry checks fail in any new viewport; no migration or data change needed.
