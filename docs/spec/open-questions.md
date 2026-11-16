# Open design decisions

The architectural interview is complete. These are per-component implementation details, not a request to restart the interview.

1. Final visual design and animation timeline for Hero, MegaMenu and HeroAction.
2. Exact copy, focus behavior, aria-live treatment and mobile position for the mascot's speech bubble.
3. Domain and URL normalization: IDNs, transliteration, ambiguous input, secure handling and invalid/error cases.
4. Cookie notice visual/device acceptance and short-viewport behavior (basic collapse/reopen is implemented; #14).
5. Exact names and shapes for navigation product cards, plus integration animation/design acceptance (static logo fallback is implemented; #15).
6. Final product palettes, including Muse, and individual component-specific theme exceptions. Current Hero accent is fixed at #FF5AF1.
7. Asset rights, approved images, source files and final content; validate before migration.
8. Real menu destination URLs and the precise simulated preview destination.
9. Optional motion/WebGL budgets, fallback visuals and reduced-motion behavior.
10. Deployment verification, production branch rules and release audit for subsequent releases (the static Hero is already published; #2, #16).

## Already settled
See `docs/spec/visual-system.md`, `docs/spec/hero.md` and `docs/spec/component-inventory.md` for the agreed scope, CSS layer ordering, dusk/dawn, typography, responsive philosophy, Storybook sequencing and test expectations. Do not reopen those decisions without a concrete conflict.
