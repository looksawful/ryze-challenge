# Issue tracker

GitHub Issues is this repository's sole task tracker. Keep one issue per independently verifiable outcome; search existing issues before creating another. Do not maintain parallel task lists in documents or external systems.

## Writing issues

- **Human report:** state the problem or goal, expected result, and reproduction steps or evidence when applicable. Ask for missing information instead of inventing it.
- **Agent-ready ticket:** state **What to build**, observable **Acceptance criteria**, **Blocked by** (issue links or "None"), and **Verification** (commands or manual checks). Link a parent issue when one exists.
- Record approved decisions in the canonical issue description or linked specification. Keep unresolved choices explicitly open. Avoid speculative implementation detail that will go stale.
- New requests start as `needs-triage`. Use `ready-for-agent` only when the scope is approved and actionable; use `ready-for-human` for required human decisions or review. Apply exactly one state role from `triage-labels.md`.
- Execute only approved scope. Link each implementation PR to its issue. Close issues only after verification and accepted review. External PRs are not an incoming triage surface by default.

## Writing comments

Post only material updates: **Decision**, **Implemented**, **Verified**, or **Blocked**. One short comment may combine relevant fields:

- **Decision:** what changed in the agreed scope, and where the canonical requirement was updated.
- **Implemented:** PR or commit link, plus the observable result.
- **Verified:** exact revision, checks performed, pass/fail outcome, and remaining gaps. Put detailed evidence in the PR; link it rather than repeating it across issues.
- **Blocked:** concrete blocker and the owner or decision needed to proceed.

Distinguish proposals from verified results. Update the issue description when later decisions supersede old requirements; preserve historical evidence rather than silently erasing it. Avoid repeated status reports, tool transcripts, unrelated research and "no changes made" comments when they add no decision or actionable fact.

Review all published issue, PR and comment text for personal information, local machine details, credentials, asset rights and unverified claims. Apply the publication rules in `AGENTS.md`.
