# Cookies P1.1 / P1.2 debug, 2026-11-16

## Scope
- P1.1: Cookie notice overlaps the fixed bottom navigation because it searched for nonexistent `[data-ryze-mobile-dock]` and `.navbar`.
- P1.2: Storybook `Closed` clicked real Reject and wrote to `localStorage`. Returning to Notice / Reset also removed saved choices.

## Changes
- Locate actual `header[data-variant="dock"]`, measure its viewport rectangle only when `data-docked="false"` and it is visible at the bottom, and leave an 8px clearance.
- Observe `data-docked` changes and navigation size to remove clearance when the dock moves to the top.
- Support an optional initial view on the existing `HomeworkCookieNotice` component for Storybook. Production still uses the default and retains its consent behavior.
- Storybook Controls instantiate Notice/Settings/Closed directly. State switching and Reset no longer click Reject or read/write `localStorage`. Explicit user interaction with the notice still uses `rememberChoice` as before.
- One Storybook story retained; no visual redesign or new dependencies.

## Verification
- Red/green: 2 regression checks failed before implementation, pass after.
- `npm run typecheck`, `npm test` (29/29), `npm run build`, `npm run test:static` (4/4), `npm run build-storybook`, focused ESLint: all pass.
- Chrome, independent production static build: 320x568, 402x874, 874x402, 1024x768, 1440x1024. Notice, Settings, and scrolled geometry checked at every width. At 874+ where dock is visible the vertical clearance was consistently 8px; on 320/402 the CSS dock has zero height and requires no extra clearance.
- Simulated top-docked state at 874, 1024 and 1440 confirmed the reserved clearance returns to 16px without refresh.
- Chrome Storybook: Closed, Notice, Settings and Reset preserve an existing `{analytics:true,marketing:true}` choice. Closed renders no panel; Notice and Settings remain visible as requested.
- Remaining audit topics (Hero CTA occlusion, focus flow, performance and obsolete components) are intentionally outside this patch.

## Integration
- Isolated branch `fix/cookie-p1-dock-story-20261116`, derived from `origin/dev`, and a separate cherry-pick release for `prod`. No unrelated worktree edits.
