# Ryze Challenge: source-of-truth / merge audit — 2026-11-17

## Canonical locations and rules
- Private repository: https://github.com/looksawful/ryze-challenge
- **dev** is the canonical integration branch and GitHub default (changed from prod on 2026-11-17).
- **prod** is the approved release branch; **gh-pages** holds public static artifacts only. Neither was changed in this audit.
- Canonical Titan checkout path: `D:\inwork\ryze-challenge`. The misleading `D:\inwork\ryze-dev` worktree is actually checked out on **prod**.
- Keep approved visuals and prototype-only status. Do not publish via Pages/Cloudflare or make the repository public.

## Changes performed in this audit
1. Merged PR #76 (native Static / no-JavaScript mobile navigation) into dev. Merge SHA: `1c2ece86d5c7738fc7566dd15b89736043d805d2`. PR checks passed.
2. Marked PR #63 ready and merged Storybook Foundations, Overview, component grouping and the native-controls redesign already integrated via PR #77. Merge SHA: `305cee7a3723ff146634c95ce92560c7d70cead6`. PR checks passed. This integrates a **partial** Storybook design system, not all proposed stories or Asana tasks.
3. Merged verified Rizzie/Cookie/Dock hit-target fix into dev via **PR #78** after clean merge-tree and green fresh GitHub PR CI (npm ci, build, typecheck). Merge SHA: `5b4364e2c25ca9ece9a3be9d061935ef34883e64`. Originating prod release PR #75 was not touched.
4. Changed GitHub default branch from prod to dev; independently verified via GitHub API. Local `origin/HEAD` was also switched to dev.
5. Fetched/pruned remote-tracking references on Titan; did **not** checkout, reset, clean, stash or rewrite any local worktree.

## Inventory (observed, not all approved for deletion)
- Before integrations: 34 remote branches, 3 open PRs (#63, #75, #76). After integrations #75 is the only remaining open PR.
- There are **54 registered Git worktrees** on Titan, including 12 with tracked or untracked changes:
  - `ryze-challenge` (4 tracked modified/deleted, 8 untracked)
  - `ryze-cookie-homework-ship-20261116` (6 untracked)
  - `ryze-cookies` (4 tracked, 1 untracked)
  - `ryze-homework-migration-20261116` (60 untracked)
  - `ryze-nav-unified-20261116` (7 tracked)
  - `ryze-navigation-preview-20261116` (3 tracked, 5 untracked)
  - `ryze-notice-20261116` (2 tracked)
  - `ryze-reference-shell` (5 untracked)
  - `ryze-rizzie-from-dev-20261116` (10 tracked)
  - `ryze-rizzie-mvp` (4 tracked, 10 untracked)
  - `ryze-ship-dev-qa-20261116` (1 untracked)
  - `ryze-storybook-design-system` (1 tracked; **local checkout is older than merged GitHub branch**)
- Local canonical checkout `dev` is **diverged** from `origin/dev`. Two local-only commits: `5fc564f` (large earlier Homework navigation) and `cec07a0` (trusted Tailscale preview origins). Their content must be compared with current dev; do not blindly replay the earlier navigation implementation.
- Remote `dev` and `prod` were already diverged by 44 vs 23 commits before the merges, and must **not** be bulk-merged.

## Open review blockers
- PR #75 (https://github.com/looksawful/ryze-challenge/pull/75) targets **prod**, not dev. The tested fix was separately ported into dev by merged PR #78; PR #75 remains open for explicit release review. Merging dev does not authorize prod promotion.
- Issue #74 (https://github.com/looksawful/ryze-challenge/issues/74) documents a **P0** interactive mobile drawer pointer-events failure and **P1** cookie/dock overlap. PR #76 repairs Static/no-JS fallback and does **not** by itself close the interactive-drawer problem. Re-test on current dev before closing it.
- Storybook implementation continues in the existing private Asana project: https://app.asana.com/1/1204689852093979/project/1220599646494671 . Nine of ten scoped tasks were still incomplete at audit start. PR #63 is not a claim that the whole design system is finished. Current dev has 11 Storybook story files; Button and Typography remain under the legacy `RYZE/Foundations` category. Patterns and Content & Entities remain incomplete. The untracked local `src/features/hero/Inventory.stories.tsx` imports obsolete `CookieConsent`, removed from current dev; do not merge it verbatim.
- No currently listening Storybook server was confirmed on the sampled Titan ports; the audit used current GitHub PR code, existing tests and review evidence, not a fresh full visual browser pass.

## Next actions (no automatic destructive cleanup)
1. Preserve and classify changes in the 12 dirty worktrees. Particularly the main checkout's untracked Inventory/Cookie/Storybook files, which must not be overwritten.
2. Compare the two unpushed local `dev` commits against current `origin/dev`. Carry forward only still-needed unique changes via isolated review, not an uncontrolled merge or reset.
3. Port of Rizzie hit-target fix to dev is complete (#78); resolve issue #74 P0/P1 separately, then verify assembled landing/Storybook parity.
4. After preservation and confirmation of no unique work, prune **only** obsolete clean worktrees and already integrated branches. Keep separate release work under prod review.
5. Leave public deployment off. Require explicit approval for promoting to prod or publishing static artifacts.

**Review scope:** remote repository metadata, PR diffs/CI/reviews, Git topology, local worktree status and existing reports/specification. Avoid assuming a green PR CI establishes full product QA.
