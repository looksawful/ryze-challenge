# Homework Cookies integration · 2026-11-16

> Historical QA/release snapshot. Current behavior: source code; open work and acceptance: GitHub Issues. Dates and branch status below refer only to this checkpoint.

Scope: replace rendered CookieConsent with the approved Homework Cookie notice in Ryze Challenge, without changing Hero components.

- JS-only rendering, no cookies UI when JavaScript is absent.
- Same interface in full, reduced-motion, WebGL unavailable, and low-end modes.
- Homework styling: borderless, theme-aware panel.
- Persist optional choices via localStorage; component does not activate tracking.
- A footer-level Cookie settings link reopens preferences.
- One Storybook story under RYZE/Cookies with State, Remember Choice, Theme and Viewport controls, plus Reset.

Verification:
- npm ci: success.
- TypeScript and Next static build: success.
- Static HTML tests: 4/4.
- Node unit suite: 26/26 after aligning obsolete expectations with existing Hero/navigation markup and the revised Cookies contract.
- Storybook build: success.
- ESLint on added Cookie source and story: success.
- Chrome 402x874 and 1440x1024: notice visible, no horizontal overflow, Reject persisted, reload kept choice, settings reopened, Marketing preference changed and saved.
- Whole-repo ESLint still reports pre-existing HeroAction/RizzieMascot issues outside this scope.
- Physical Safari/mobile visual acceptance remains pending.

Integration: separate feature branch -> dev PR -> prod PR. Do not infer live website publication from GitHub branch merges.
