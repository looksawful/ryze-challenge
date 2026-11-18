# Ryze Hero layout, validation and small-logo intro | 2026-11-18

Status: implemented and tested locally; **development branch only; public release blocked**.

## Approved changes
- For laptop/desktop layouts, the two-row H1 uses a shared centered CSS measure of `min(100%, 60vw)`. Existing small-screen layout remains intrinsic/full width. Actual browser measurements: at 1280 CSS px, `for`/ `your` left-edge difference improved from +238px to +5px; from 800 to 1920 px the difference is within 9px (mobile 390 px remains −15px). No JS positioning.
- The full-screen intro iframe/canvas stays full viewport. The 118-fragment paper mark and Three.js canvas texture both use a common CSS target of 88–116 px. The fragments originate within the small mark region rather than across the viewport, and wind displacement is proportionally reduced.
- Invalid website submissions visibly show the message with `role=alert` and an error outline on the existing composer. Input remains editable. No fake audit or processing step was added; domain syntax check is local only. `example.com` remains a valid syntax and no `www` is required.
- README reduced to project name and license status, no license invented. No standalone license file exists in this repository.

## Evidence
- RED/GREEN regression: `scripts/hero-final-layout-and-validation.test.mjs` originally failed for all changed contracts; now 4/4 pass.
- Profiled subset with website, Hero, navigation, Storybook contract checks: 25/25 pass.
- `npm run typecheck`: PASS; `npm run build -- --webpack`: PASS; `npm run build-storybook`: PASS (Vite upstream directive warnings remain).
- Mac Chromium: 390, 800, 1024, 1280, 1470, 1920 CSS px, no horizontal overflow and no page JS errors; malformed address displayed `data-state=error`. Full-motion 1280×840 screenshot confirmed small, centered paper assembly rather than fullscreen confetti.
- Broad `npm test`: **37 PASS, 14 FAIL** due contracts for prior layout/Storybook/cookie state, release gate still red. The newer focused checks do not replace broad-suite migration.

## Release gate / Issues
- 11 GitHub Issues remain open at audit time: #86, #85, #84, #74, #66, #65, #16, #15, #11, #7, #2. Some describe older, superseded designs; audit individually before closing. No blind bulk-close.
- GitHub repository is private, Pages was disabled when checked. User explicitly requires separate consent before any Pages publication. **No public deploy**.
- Existing uncommitted Storybook work from parallel authors is preserved and should be checked before staging into development; do not reset worktrees or restore old versions.
- No publication to `main` requested: synchronize tested changes to Git's `dev` branch only, preserving remote `main` as rollback target.
