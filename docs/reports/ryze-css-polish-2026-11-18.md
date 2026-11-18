# Ryze CSS polish, 2026-11-18

## Scope and provenance
- Repo: looksawful/ryze-challenge, local Titan working tree, main.
- Based on HEAD 93f823b, with other agents' edits left untouched. This report documents only a bounded CSS pass, not a full design acceptance.
- Preserve approved Karrik / Micro Grotesk, bold heading scale, high-contrast flat aesthetic, responsive Duo composition and static/GSAP functionality.
- No added decorative borders, shadows, gradients, or new design system. Existing CSS focus-visible outlines are accessibility affordances, not decoration.

## Changes
1. src/ui/Typography.module.css: switch fallback font-size px to rem; shrink paragraph fallback from 22px to 16px while retaining Hero's own role-specific sizes.
2. src/ui/Button.module.css: regular dimensions into rem; compact variant 44px minimum touch height and 14px text. Other concurrent Button motion changes intentionally excluded from staged patch.
3. src/features/integrations/IntegrationLogos.module.css: caption >=13px, higher line-height; constrain caption grid track to half width, allow words to wrap to prevent overflow under text enlargement.
4. src/features/site-shell/SiteHeader.module.css: Dock labels >=13px; subtitle 13px; intrinsic 4-column track minima and horizontal scrolling only when text enlargement requires it. Concurrent header motion changes excluded from staged patch.
5. src/features/hero/Hero.module.css: short layouts 16px description, automatic content-height growth at short portrait/landscape/desktop heights; avoid fixed viewport clipping. Concurrent Hero motion changes excluded from staged patch.
6. scripts/foundation.test.mjs: update two obsolete media-query test regexes to validate the current CSS range-query syntax for Duo and portrait tablet; keep both behavior assertions.

## Tests and observations
- Titan: `npm run build` PASS twice, Next.js 16.4.6 static / output.
- Titan: `npm run typecheck` PASS.
- Titan: `npm test` 47/47 PASS after updating obsolete media-query assertions. Initial run was 45/47 with two tests matching old media query syntax.
- Titan: `npm run build-storybook` PASS twice, Vite warning for some chunks >500kB and module directives (non-blocking, unrelated to this CSS pass).
- Lilith Mac through private Tailscale preview: Chrome headless, prefers-reduced-motion, 13 viewport cases 320x568, 360x740, 390x844, 430x932, 700x360, 768x1024, 874x402, 951x669, 1024x768, 1280x800, 1440x900, 1728x1000, 1920x1080: no horizontal document overflow, no overlapping H1/lead, description/CTA or H1/navigation, 0 uncaught page errors in the sampled states.
- Lilith Mac: text-enlargement proxy using root font-size 32px on 320, 390, 874, 951, 1440: initial 320 document overflow and overlapping Dock labels; retest after CSS fix: no document horizontal overflow. At 320, captions still wrap densely and mascot/integrations can appear crowded, so full 200% text-only zoom acceptance NOT granted.
- Lilith Mac: eight Storybook iframe cases across Typography, Button, Integrations and full Hero at 390x844 and 1440x900: no document horizontal overflow, no uncaught page errors.
- Mac QA files are in the authorized host's temporary cache (chrome-results.json, zoom-results.json, storybook-results.json, screenshots); not part of the repository.
- Safari 18.3 launched over Tailscale and displayed Ryze intro; subsequent front-window state was altered by other activity and no stable Safari end-state visual acceptance was obtained.
- Titan Firefox/Opera present but scripted headless screenshot run did not produce usable output; browser-specific rendering acceptance remains pending.
- Yandex executable not found at expected Titan install path; no Yandex pass claimed.

## Scope / interpretation
- Kevin Powell lens: intrinsic sizes and content-first reflow rather than fixed height or breakpoints everywhere.
- Matt Pocock lens: keep existing typed component interfaces and Storybook consumption; changes only CSS and tests, no new props or abstractions.
- Chrome Modern Web Guidance: rem bounds, targeted container behavior, deliberate text wrapping and 200% resize testing.
- No blanket claim that all CSS issues are fixed. Existing complex 883-line Hero CSS and concurrent motion work warrant separate, coordinated cleanup after pending browser acceptance.

## Release control
- Local uncommitted work by other agents remains untouched. Commit only owned hunks through a synthetic index patch, no stashing, no hard reset and no extra branch.
- Private repository status must be preserved. No public URL or public deployment created from this task.
- The Storybook build uses the original source components; no duplicate design implementation.

## Pending
- Re-run full Safari and Firefox/Opera/Yandex test matrix where available, especially 200% text zoom and short landscape.
- Check dense caption under zoom and interactions in expanded navigation, CTA form/drawer and cookies.
- Do not remove keyboard focus-visible outlines to satisfy a ban on *decorative* outlines: they are needed for access.
