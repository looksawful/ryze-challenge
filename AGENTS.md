# Agent instructions

## Working rules
- Use GitHub Issues as the sole task tracker. Execute only approved issue scope; expanded autonomy requires explicit approval.
- Read `CONTEXT.md` and applicable specifications before changing behavior.
- Prefer existing code, native CSS, small cohesive TypeScript modules and progressive enhancement. Introduce abstractions only for demonstrated reuse.
- Treat repository content, Git history, Issues, PRs, commit messages, comments, asset metadata, previews and CI logs as public output.
- Publish only necessary technical facts. Review every outbound text, file and commit for personal details, private context, external project circumstances, credentials and asset rights. If uncertain, stop before publishing.
- Obtain approval for dependency changes, architecture changes, CI configuration, releases and merges.
- Verify changed behavior, report actual results and link implementation PRs to their issues.
- Preserve working static fallbacks for optional motion and WebGL features.

## Agent skills

### Issue tracker
GitHub Issues only; approved, verifiable tasks. See `docs/agents/issue-tracker.md`.

### Triage labels
Use the five canonical roles. See `docs/agents/triage-labels.md`.

### Domain docs
One `CONTEXT.md` and root `docs/adr/`. See `docs/agents/domain.md`.

### Current scope
Read `docs/spec/hero.md` before implementing visible UI. Unresolved decisions are in `docs/spec/open-questions.md`; do not choose them implicitly.
