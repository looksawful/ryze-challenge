# Rizzie responsive geometry: implementation / QA (2026-11-18)

Repository: `D:\inwork\ryze-challenge`; canonical branch: `main`. Scope: production Hero and Storybook Rizzie; no public deployment.

## Implementation
- `src/features/mascot/Rizzie.module.css`: a single `--rizzie-art-size` fluid width (rem/vw/svh); poster, sprite and clickable anchor share 12:13 geometry. Removed old width/scale modes.
- `src/features/mascot/RizzieMascot.tsx`: fractional spritesheet frames and disabled native drag, preserved from parallel executor's working changes in main; committed as part of cohesive mascot implementation.
- `src/features/hero/Hero.module.css`: remove two obsolete scale overrides; reserve real poster height on 490x480 and desktop; shift only copy/lead/headline continuously on 700–829px landscape to keep pet and text apart.
- `src/features/mascot/Rizzie.stories.tsx`: Storybook Playground is the sole reference for the component, runtime scenarios and viewport presets; removed redundant Motion Lab story.
- `scripts/rizzie-hit-target.browser.mjs` and `package.json`: real browser geometry regression with hit area, poster/sprite parity, 12:13 ratio, slot containment, X overflow, overlaps against CTA/Dock/Cookies/headline/lead/description, and media boundary continuity. Run with `RYZE_QA_URL=http://<private-preview>:3088/ npm run test:rizzie:geometry`. Reduced-motion mode bypasses cinematic intro; the Next.js dev toolbar can intercept a test point and is reported as a development-only overlay.
- Obsolete text-based CSS source test `scripts/rizzie-css-contract.test.mjs` discarded (was untracked, not part of the regular npm test script).

## Evidence
- Titan/Chrome via private Tailscale preview: **48/48 viewport checks passed**, **5/5 continuity pairs passed** on 699/700, 1023/1024, 2399/2400 width thresholds; **no pet intersections** and hit geometry consistent.
- Mac Lilith.local/Chrome via separate RDC account: **31 viewports**; artwork and target match; 490x480 slot overflow fixed; no horizontal overflow or CTA/Dock/Cookies overlap; dev indicator affected some sample points.
- Mac Safari 18.3 via WebDriver: **7 viewport cases**, including 390x844, 490x480, 874x402, 951x669, 1024x768, 1440x900 and 1920x1080. Normal intro reaches `revealing` after ~5s, pet then clickable except for dev toolbar interception at 490px. Safari actual innerHeight is ~52px smaller than set browser windowHeight.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run build-storybook`: passed, warnings from Vite about large chunks and `use client` directives, not regressions demonstrated by the mascot changes.

## Ownership / guardrails
Previous parallel executor had implemented preliminary `--rizzie-art-size`, percent background-position sprite atlas and many viewport presets. This session corrected continuity, Hero integration, short-phone containment, cross-element overlap, removed Motion Lab and built browser QA. No unrelated motion, typography, header, cookie, button or design work is included in the intended commit.
Other agents retain dirty working files in main; stage only the Rizzie feature files and the Rizzie-related hunks of Hero, never `git add .`.

Asana: T06 · Integrations / Rizzie / Cookies: https://app.asana.com/1/1204689852093979/project/1220599646494671/task/1220597307964244
