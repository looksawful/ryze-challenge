# Ryze Hero intro · original cut-paper restoration
Date: 2026-11-19
Tracker: [#89](https://github.com/looksawful/ryze-challenge/issues/89) · Release PR: [#92](https://github.com/looksawful/ryze-challenge/pull/92)

## Decision
The user's updated specification superseded the proposed GPU point cloud. Retain **the same 118 original SVG cutout shapes** and original assembly / wind choreography. The `Plugs into any platform` animation remains untouched. No extra package, generic engine or third canvas.

## Implemented
- Reconnected `HeroMotionBackground` to the original `public/ryze-canvas/index.html` (not the temporary point-only scene).
- Original 118 irregular cutouts remain geometry source. Distinct sizes from existing SVG paths and randomized initial scale; independently seeded entry curves from four screen edges, with smaller spread and tighter bending.
- Target mark diameter: `clamp(144px, 31vmin, 240px)` (implemented using equivalent JS clamps in both SVG and WebGL).
- Group rotation begins at -45 degrees and converges to 0 before wind. SVG fallback uses the same group angle; WebGL plane uses the complementary coordinate-system sign.
- Original paper cutouts assemble, hold for 0.26s, then blow offscreen with variable stagger/velocity/spin. No per-fragment opacity fade or 3D-mesh alpha tween. The Hero reveal remains event-driven after `ryze:blown`.
- Removed four superseded point-intro assets/tests and the unused 118-entry embedded morph geometry table; the actual original SVG paths are unchanged.
- Kept the parent intro failure watchdog (8.5s), no-JS content, reduced-motion behavior, and existing integration effect.

## Validation on Titan
- `node --check public/ryze-canvas/src/main.js`: pass.
- `npm run test:smoke`: production static export build + 14/14 Chrome browser checks pass.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: 14/14 pass.
- Updated browser smoke test asserts 118 cutouts, non-fading wind (opacity=1), exact 0° angle before wind, and Hero reveal after `blown`.
- Real-time headless Chrome 1440×900 captures at 300/1000/1800/2550/3100/3900ms show the rotating convergence, assembled silhouette, wind dispersal and transition. Recorded local snapshots at `D:\inwork\_ryze_particle_realframes\` (not committed as source assets).
- Local standalone preview `http://127.0.0.1:5177` in isolated worktree `D:\inwork\ryze-particle-intro-89`.

## Release
GitHub Pages is deployed by `.github/workflows/pages.yml` on push to **dev**; the remote repository has no `prod` branch. Promote this PR into `dev` to publish, then verify the Pages workflow and the canonical URL. Do not create another release source solely for naming.

## Limitations
Physical Safari/iPhone visual sign-off was not performed in this work session. Browser smoke validates desktop Chrome and simulated mobile viewports; do not represent that as an iOS Safari pass.
