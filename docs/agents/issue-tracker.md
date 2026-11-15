# Issue tracker

GitHub Issues is the sole task tracker. Search existing issues before creating one; keep one issue per independently verifiable outcome. Do not maintain parallel task lists.

## Intake and tickets

- **Human report:** state the problem or goal, expected result, and reproduction steps or evidence when relevant. Classify the request as a bug or enhancement.
- **Triage:** use `/triage` for incoming requests. Check for existing implementations and prior decisions; verify claims where possible. Record established facts and specific missing questions for `needs-info`.
- **Agent brief:** after triage, put the actionable brief in the issue description or one comment: **What to build**, **Scope**, observable **Acceptance criteria**, **Blocked by** (linked issues or “None”), and **Verification** (commands or manual checks). Link a parent issue when relevant. For `ready-for-human`, say what requires human judgment.
- **Generated tickets:** `/to-tickets` produces already-specified tickets; do not triage them again. Preserve their dependency links. `ready-for-agent` means an approved, self-contained brief, **not** permission to start while blockers remain. Work on the unblocked frontier only.
- **States:** use exactly one of the five state labels from `triage-labels.md`; incoming requests begin at `needs-triage`. Keep bug/enhancement classification in the issue text without introducing new required labels. For `wontfix`, record the reason and close.

## Execution and updates

- Execute only approved scope. Link each implementation PR to its issue. Close only after verification and accepted review. External PRs are not an incoming triage surface by default.
- Post material **decisions, agent briefs, triage notes, implementation results, verification results or blockers**. Keep each update concise and actionable.
- For implementation, link the PR/commit. For verification, identify the tested revision, actual checks and pass/fail results, plus remaining gaps. Link detailed evidence in the PR instead of duplicating it across issues.
- Update the issue description or linked specification when a later decision supersedes an earlier requirement; retain useful history. Skip repetitive progress reports, tool transcripts and research without an actionable finding.
- Treat all issues, PRs and comments as potentially public. Apply the publication checks in `AGENTS.md`.
