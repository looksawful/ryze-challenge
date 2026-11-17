# Ryze Hero: staggered reveal after 118 fragments assemble
Date: 2026-11-18
Repository: looksawful/ryze-challenge (private), Titan `D:\inwork\ryze-challenge`, branch `main`.
Status: implemented and verified **locally**. No public deployment or GitHub push.

## Requirement / sequence
Start the site-content reveal on `ryze:assembled` (all 118 pieces of the SVG logo meet), **not** after `ryze:intro-complete`.
Relative to the assembly event:
- 0.00s: Brand and H1 (Karrik).
- +0.22s: subtitle (lead).
- +0.44s: description and Rizzie.
- +0.66s: CTA Start For Free and integration platform logos.
- +0.90s: Header / navigation.
- +1.14s: desktop Cookie panel.
- Every foreground element fades up for 0.52s; menu and Cookies fade in for 0.48s.
- Canvas SVG continues melting into a circle and shrinking behind the Hero; completion still uses the existing `ryze:intro-complete` event and backdrop fade.

## Implementation
- `public/ryze-canvas/src/main.js`: forward `ryze:assembled` from the same-origin Canvas iframe to its parent with `postMessage`.
- `src/features/site-shell/HeroWithNavigation.tsx`: add `playing → revealing → ready` phases, same-origin and source checks; 24s watchdog, reduce-motion and no-JS fallback preserved. Make Hero/Navigation interactive after assembly.
- `src/features/hero/Hero.module.css`: explicit per-group `--hero-enter-delay` and event-triggered fade/translate. No layout or content edits.
- `src/features/site-shell/HeroWithNavigation.module.css`: delayed menu reveal, Canvas fade only when intro actually completes; reduced-motion menu CSS specificity fix.
- `src/app/page.module.css`: Cookie panel last (desktop only), with delayed visibility/opacity and reduced-motion exception.
- `scripts/hero-reveal-order.test.mjs`: regression contract.

## Verification
- Focused tests: 5 passed (`hero-reveal-order`, media visibility/preservation).
- `npm run build`: passed, includes TypeScript.
- `git diff --check`: passed.
- Real Chrome via Playwright on Titan: 1440×900 desktop and 390×844 phone. `ryze:assembled` changes phase to `revealing` immediately; computed CSS delays verified. No JavaScript errors, no failed resources, no horizontal overflow.
- Reduced Motion: menu, heading and Cookies visible immediately, no animations, no Canvas iframe. No-JS: heading/main/nav remain visible.
- Screenshots: `docs/notes/hero-stagger-desktop-start.png`, `hero-stagger-desktop-middle.png`, `hero-stagger-desktop-end.png`, `hero-stagger-mobile-end.png`.
- Detailed probe: `docs/notes/hero-stagger-browser-measurements.json`.
- Preview: http://100.110.158.49:8793/ (Tailscale access required).

## Notes / limitations
- The pink Canvas circle remains visible behind the text for part of the overlap. This is an intentional result of revealing on assembly before circle disappearance; its styling/animation was left unchanged.
- Moving media cards remain off through existing `SHOW_MEDIA_CARDS = false`.
- Other agents' ongoing local font and Rizzie changes were left untouched.
- Existing `docs/reports/hero-element-timeline-2026-11-18.md` preserves the preceding behavior and measurements.
