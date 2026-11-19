# Ryze: remove public footer (2026-11-19)

## Decision
Remove the visible SiteFooter from the public Ryze challenge page; do not modify or delete the reusable SiteFooter implementation or its design system stories. Minimal reversible change.

## Implementation
- src/app/page.tsx: remove SiteFooter import and JSX.
- scripts/browser-smoke.test.mjs: assert absence of footer across viewports and with JavaScript disabled; replace footer-dependent assertions with tests for preserved consent, chat layout, navigation and cookie-choice persistence.
- No changes to Hero, header, menus, CSS, images, motion or links.
- Note: the desktop Cookie settings re-open button previously lived inside the footer, so it is no longer exposed on desktop after a decision. Initial cookie notice, save/reload behavior and mobile menu settings remain available. No tracking is enabled in the preview.

## Verification
- RED: baseline browser smoke failed the new 'footer must not be mounted' assertion at 320px.
- GREEN: production build PASS; 16/16 Chromium smoke checks PASS across 320, 390, 800, 1024, 1200, 1440 and 1920px and no-JavaScript fallback.
- Unit/contract tests 14/14 PASS; Next typecheck PASS; ESLint PASS.
- Source work is isolated in a detached worktree from origin/dev (f0624d4); active worktree's uncommitted changes not touched.

## Reversal
Restore SiteFooter import and <SiteFooter /> in src/app/page.tsx, and restore the previous footer-specific smoke cases if re-enabling the footer.

## Release
Single dedicated commit on dev; Pages automatically publishes dev. Verify production DOM contains no footer element and navigation remains accessible.
