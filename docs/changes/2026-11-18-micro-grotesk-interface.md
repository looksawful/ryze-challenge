# Micro Grotesk for Ryze interface

Date: 2026-11-18
Repository: `looksawful/ryze-challenge` / local `D:\inwork\ryze-challenge`, branch `main`.
Source: https://github.com/eliheuer/micro-grotesk (Eli Heuer)
License: SIL Open Font License 1.1; copy in `public/fonts/micro-grotesk/OFL.txt`.

## Change

- Added upstream `fonts/MicroGrotesk[wght].ttf` as `public/fonts/micro-grotesk/MicroGrotesk-variable.ttf` (14,736 bytes); no dependency or external font CDN.
- Registered `@font-face` in `src/app/foundation.css` with `font-display: swap`, valid `wght` axis 100–900 (default 400).
- Changed `--font-body` and root `font-family` to Micro Grotesk with Segoe UI/system fallbacks; navigation, buttons, inputs and body text inherit it.
- Preserved `--font-heading` with Karrik first; H1–H3 remain Karrik.
- No other visual component geometry, animations, content or branches changed.

## Checks

- Checked upstream TTF variable axis with Node: `wght` 100, 400, 900.
- `npm run build`: PASS (Next.js 16.4.6, static pages generated).
- `npm run typecheck`: PASS.
- Font file confirmed in the production static export at `out/fonts/micro-grotesk/MicroGrotesk-variable.ttf`.
- The previous preview server at 127.0.0.1:8793 is not running; browser visual QA remains pending.
- Upstream labels font work in progress; test small sizes on target browsers before final approval. Cyrillic coverage not verified.

## Delivery

Local working-tree change only. No commit, push or public deployment; pre-existing uncommitted user work preserved.
To revert the interface font, restore prior `font-family` and `--font-body` declarations in `src/app/foundation.css`, remove Micro Grotesk `@font-face` and remove its folder. Karrik remains independent.
