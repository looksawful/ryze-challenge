# English content review (optional)

The repository includes three **manual**, non-blocking agent skills:
- `.agents/skills/copy-editing/SKILL.md` for improving existing English copy.
- `.agents/skills/copywriting/SKILL.md` for drafting new or explicitly approved replacement copy.
- `.agents/skills/ryze-fact-check/SKILL.md` for evidence-based review of product claims.

Before reviewing, read `AGENTS.md`, `CONTEXT.md`, `docs/agents/business-context.md` and the relevant UI source. Review *actual* copy, not fabricated screens. Existing copy and agreed CTA labels are preserved until an authorized change request.

## Manual invocation
Ask an agent: "Review English Hero/navigation copy using the repository's copy-editing and ryze-fact-check skills. Report-only: list each current phrase, location, concern, sources and minimal suggestion. Make no source-code, CI or deployment changes."

Report findings in the relevant GitHub Issue; use GitHub Issues as the sole task tracker. Distinguish marketing claims from demonstrated product functionality and simulated prototype interactions.

The two vendored skills include upstream `evals/evals.json` fixtures for later manual agent evaluation. No test runner or new `npm` script is wired to those files; they do not run in CI or affect GitHub Pages.

## Upstream and license
Source: https://github.com/coreyhaines31/marketingskills ; pinned commit `0cd9b3a0ef4c411a1d690419ce843f2a1da32cce`.
Imported without modifications: `skills/copy-editing` and `skills/copywriting` (their SKILL.md, references and evaluation fixtures).
Their MIT license is preserved at `.agents/skills/LICENSE.marketingskills`. It applies to the imported third-party files only, not the rest of this repository. `ryze-fact-check` is project-specific.
