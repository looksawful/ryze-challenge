# ADR 0001: Local-first workflow and static publication

Status: Historical setup decision. Branch and release approval rules remain applicable; its initial no-hosted-CI and no-Pages statements are superseded by the actual `.github/workflows/ci.yml` and release PR history.

## Context
The interface is a static frontend preview. Build and verification run locally. Release requires human approval, and public artifacts must be reviewed independently of code functionality.

## Decision
- `dev` is the development branch; `prod` represents approved source; `gh-pages` holds generated static artifacts only.
- Use a PR or equivalent reviewed promotion to advance `prod`; a successful local build is necessary but is not release approval.
- Publish to GitHub Pages only after an explicit public-visibility decision and audit.
- Use local build, lint and type checks. Avoid persistent hosted workflows and public self-hosted runners at initial setup.
- Enable GitHub branch protection when the repository settings and visibility permit it.
- Keep public issue and commit text minimal and technical; use a noreply Git commit address.

## Consequences
GitHub-hosted builds are not a prerequisite for local development. Initial private repository protection may be procedural until branch rules are available. No Pages release is configured by this ADR.
