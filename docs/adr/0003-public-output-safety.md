# ADR 0003: Public-output minimization

Status: Accepted

## Context
Repository visibility and publication destinations can change over time. Git history, comments, generated logs and assets are often copied or indexed independently of current repository permissions.

## Decision
- Assume all committed data and outbound GitHub content may later be public.
- Keep README, specs, issue descriptions, PRs, comments and commit subjects limited to necessary technical descriptions.
- Never include personal details, private communications, external context, internal arrangements, credentials, local machine identities or provenance narratives in repository content.
- Check source code comments, binary assets and metadata as well as prose before publishing.
- Treat visibility changes, Pages publication and merges as approval-gated operations.
- Store private interview notes outside the repository and all tracked paths.

## Consequences
Approval of implementation work does not authorize disclosure of background context. Nonessential explanation is omitted rather than anonymized into a misleading story.
