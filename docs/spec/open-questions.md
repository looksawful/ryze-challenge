# Open decisions

Status: Not approved for implementation. Resolve through the next design interview before deciding on behavior.

1. Colors, color palettes, theme semantics and which elements actually have theme variations. Do not infer a global dark/light pair.
2. Complete naming map for visible Hero entities, menu product shelf/cards and Storybook story hierarchy.
3. MegaMenu motion details: geometry, easing, speed, pointer transitions, desktop/mobile UX and accessibility. Review existing behavior before refactoring; it is not final.
4. Speech-bubble visual design, responsive placement near the mascot, language, exact copy and accessibility announcement behavior.
5. HeroAction transition choreography, input focus timing, placeholder timing, error states, cancellation and repeat states.
6. Domain and full-URL normalization, transliteration/IDN decisions, avoiding accidental changes to the entered destination.
7. Consent collapse/reopen animation, mobile positioning and keyboard behavior.
8. Exact feature folders, component state boundaries, motion token names, CSS naming and use of Storybook controls.
9. Asset inventory and licensing; reference material selection. No wholesale migration from earlier code.
10. Local build/static Pages publication procedure, Storybook path under the deployed site, branch protection when permitted and pre-publication audit checklist.
11. Final acceptance criteria for accessibility, responsive layout, performance and failure fallbacks.
12. The actual content, design assets and Figma link have not yet been supplied/approved in this repository.

Next interview sequence: palette/theme → component inventory and state machines → verification and release readiness. Keep unresolved points out of implementation tickets.
