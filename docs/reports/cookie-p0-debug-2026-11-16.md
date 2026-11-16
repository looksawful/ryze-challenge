# Cookies P0 debug — 2026-11-16

> Historical QA/release snapshot. Current behavior: source code; open work and acceptance: GitHub Issues. Dates and branch status below refer only to this checkpoint.

Scope: only two audited P0 defects in Ryze Challenge. No navigation, hero, consent persistence, or visual redesign changes.

## Reproduction and root causes
1. On a light sampled background, the floating panel retained inherited dark-theme foreground. Chrome previously measured about 1.05:1 contrast.
2. The Storybook story called `useArgs()` from a nested React component outside Storybook's render-hook context, resulting in a runtime error.

## Fix
- `HomeworkCookieNotice.tsx`: derive a readable foreground from the actual sampled panel background using relative luminance, preferring existing #111/#f7f7f7 inks and falling back to black/white only where necessary for WCAG AA (4.5:1).
- `HomeworkCookieNotice.stories.tsx`: call `useArgs()` directly inside the named `CookieStoryRender` Storybook render function; retain one story and its Controls.
- `scripts/foundation.test.mjs`: two focused regression assertions, observed failing before fixes and passing after.

## Verification
- TypeScript check: pass.
- Existing and new unit tests: 27/27.
- Next static build and static HTML tests: pass.
- Storybook production build: pass.
- ESLint on the two changed components: pass.
- Headless Chrome CDP, site, notice/settings/scroll: 320x568 (18.42/19.25/13.38:1), 402x874 (18.42/19.25/13.38:1), 1440x1024 (13.58/19.25/19.25:1).
- Storybook runtime: Notice, Settings, Closed all rendered without hook error.
- Other audit findings (Dock overlap, Storybook Closed mutating consent, code cleanup) intentionally remain out of scope.
