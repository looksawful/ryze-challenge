# Borderless surfaces (18 November 2026)

## Scope
- Removed decorative one-pixel outlines from the navigation dock, mega-menu, static fallback, mobile menu, product tiles, navigation notices and mobile sections.
- Removed decorative frames from Hero call-to-action, input form, response panel, secondary buttons and Rizzie speech bubble.
- Retained focus-visible outlines, chevron strokes, panel backgrounds, hover states, shadows and interactive behavior.
- Changed dark menu surface from #292929 to #222222 to separate the dropdown from the header using fill rather than strokes.

## Verification
- Focused style checks: 2 passed, 0 failed.
- Next.js static production build: passed.
- Next.js typecheck: passed.
- Browser screenshots are local review artifacts only and are not committed.

## Boundaries
- No new dependencies, major layout rework, branch creation or public deployment.
- Unrelated local Rizzie animation edits stay uncommitted; only the border cleanup belongs to this change.
