# Hero typography preview | 2026-11-18

Project: `D:\inwork\ryze-challenge` / `looksawful/ryze-challenge`, existing branch `main`.
Scope: typography styles only; do not alter agreed Hero composition, content, Rizzie or animations.

## Changes
- `src/features/hero/Hero.module.css`: responsive typography override at end of existing components layer.
- H1 Karrik 400, line-height 0.99, letter-spacing -0.02em. Normal workstation at 1440px: 96px; phone 390px: ~48px.
- Lead Micro Grotesk 400: 22px desktop, 18px mobile. Paragraph 400: 18px/16px.
- Hero CTA Micro Grotesk 600: 16px/15px. Responsive overrides for short phone, Duo, iPad, ultrawide, short landscape windows.
- Existing CSS layout, all other components, styles and unrelated uncommitted changes retained. No new branch, commit, push or public deployment.

## Verification and observations
- `npm run build`: PASS (Next.js 16.4.6).
- `npm run typecheck`: PASS.
- Existing private Tailscale preview `http://100.110.158.49:8793/`: HTTP 200; served CSS contains the new `6.667vw` responsive heading and self-hosted Micro Grotesk.
- Actual Opera desktop on Titan: page visible, two-line headline, navigation, mascot and CTA present. Screen checked through desktop screenshot, not full geometric audit.
- Headless Chrome CLI on Titan rendered black screenshots for this site even though a basic control HTML rendered correctly; those screenshots are invalid and were not used for visual approval.
- Mobile/Duo browser-specific layout QA still pending. Do not claim complete visual approval.
- Private preview requires being connected to Tailscale.

## Undo
Remove only the appended `Hero typography study` block from `src/features/hero/Hero.module.css`. All pre-existing responsive layout CSS and local font installations remain unaffected.
