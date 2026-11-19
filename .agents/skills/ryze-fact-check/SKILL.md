---
name: ryze-fact-check
description: Use when auditing English copy in the Ryze prototype for factual product claims, measurable outcomes, integrations, customer identities, prices, guarantees or public links. Produce an evidence-backed advisory report before approved text is changed.
---

# Ryze fact-check

Manual advisory skill. Does not run CI tests, edit the application or block deployment.

## Inputs
- Read `AGENTS.md`, `CONTEXT.md` and `docs/agents/business-context.md`.
- Review actual source text and rendered UI/Storybook, with file and section locations.
- Prefer primary, current public sources including https://www.get-ryze.ai/ and https://www.get-ryze.ai/changelog ; check feature, help and integration pages as relevant.
- Do not expose private correspondence or unpublished product information.

## Process
1. Inventory each verifiable statement in scope, preserving exact original wording and the component/file containing it.
2. Classify it: product capability, simulated demo behavior, integration availability, metric/guarantee, customer reference, price, comparison, or non-factual positioning.
3. Seek original evidence and a dated public URL. For numbers and results, trace the published methodology or case; for market comparisons, require independent comparison. Official marketing copy is evidence of what the company claims, not proof of results.
4. Label every claim: **verified feature**, **company-attributed claim**, **unsupported**, **contradicted**, or **needs human review**. Absence of proof is not proof of falsity.
5. Suggest the smallest accurate phrasing. Never fabricate evidence, customers, integration status, metrics, or competitor comparisons. Do not describe preview simulations as real product integrations.
6. Post a concise report to the applicable GitHub Issue: `location | original claim | verdict | public source | date checked | proposed wording or evidence gap`. Link to the exact files. Leave approved copy unchanged.

## Completion criteria
- Every in-scope checkable claim receives a verdict and a traceable URL or explicit evidence gap.
- Uncertain claims remain unchanged for human review.
- No application code, copy, dependency, workflow or Pages setting is changed by this skill.
- Report unperformed checks as unperformed.

## Manual evaluation fixture
Input: "Our AI guarantees 300% more sales."
Expected: flag the quantified guarantee as unsupported unless original relevant evidence is found; request the evidence and propose removing or appropriately qualifying the guarantee. This is a fictional test sentence, not a Ryze product claim.
