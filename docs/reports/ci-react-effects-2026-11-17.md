# PR CI: React effect lint, 2026-11-17

Scope: Restore the existing ESLint gate without weakening rules, touching CI config, changing styling, or altering other agents' Hero work.

## Diagnosis
- CI on prior PRs stopped at `npm run lint`: `react-hooks/set-state-in-effect` in HeroAction and RizzieMascot, plus one `react-hooks/exhaustive-deps` warning.
- Current `dev` has already fixed the HeroAction issue independently using an imperative ref and is the source for this change.
- Remaining RizzieMascot effects synchronized browser capabilities and fallback support via state writes directly during effect setup. Its `measure` callback listed `detached` as a dependency without reading it.

## Smallest change
- Collect browser capability and media-query data at mount; commit initial state inside one cancellable `requestAnimationFrame` callback. Keep media-query listeners and cleanup unchanged.
- If image decode is unavailable, switch to the static fallback in a cancellable frame, preserving the existing fallback behavior.
- Remove the unused `detached` dependency from `measure`; pointer move/end already places and remeasures the message bubble.

## Validation (isolated worktree on latest origin/dev)
- `npm ci`: passed.
- `npm run lint`: passed, with no disabled ESLint rules.
- `npm run typecheck`: passed.
- `npm test`: 26/26 passed.
- `npm run build`: passed.
- `npm run test:static`: 4/4 passed.
- `npm run build-storybook`: passed (Vite's module-level directive warnings are non-fatal).
- GitHub PR CI remains the final integration gate for Chrome/browser workflows.

No new dependencies or changes to static/JS-disabled behavior. The worktree is separate from ongoing contributors' local dev files.

## Prod-only release follow-up
- Prod still used `HeroAction.activation` in an effect, unlike the updated dev imperative-ref flow. Move only its existing mode update into one cancellable animation frame; the existing mode effect retains input focus after opening.
- On prod with this additional minimal fix: complete ESLint and TypeScript pass, 28/28 unit tests, 4/4 static tests, Next build and Storybook build pass.
- Independent Chrome smoke: Rizzie opens the drawer and focuses the input at 402 × 874; it opens inline and focuses the input at 1440 × 1024; Reduced Motion retains a static mascot.
- Chrome's local test HTTP server logged benign connection resets on shutdown; assertions all passed.
