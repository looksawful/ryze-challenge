# Ryze first-screen fixes and Mac QA · 2026-11-18

Scope: user-requested corrections to the existing first screen. Base revision `26ea692`. No redesign, asset generation, dependency changes, broad branch merges, or public deployment.

## Changes and provenance
- Restored the exact interface-based four-card Products menu from commit `94dfd18` (Paid Ads, SEO & AI Visibility, CRO, Reporting), using the original existing `public/ryze-media/navigation/` images. These are used in desktop mega menu and mobile product rail. Newer product-shelf assets were not deleted.
- Desktop **Contact us** keeps the exact label and destination. It now has a 2px `--accent-current` border, pink label, transparent background, existing 52px height, and defined hover/focus states.
- Removed the unrequested post-submission `proof` panel, capability selector, preview images, staged fake processing, associated timers and GSAP reply animation. Valid website entry now shows only inline text **Website address accepted.** No website is analyzed or contacted.
- Blank/malformed website entry shows a visible accessible error and focuses the input; entering another address clears the error. Full URLs and domains without www remain supported.
- No-JavaScript path shows an ordinary **Start for free** link to the previously configured destination instead of an unusable disabled submit.
- Mobile navigation now opens a real modal dialog; keyboard focus remains inside the menu even when reverse-tabbing from its first focusable item. Native focus restoration works on close.
- Updated the affected Storybook interactive validation scenarios. Pre-existing parallel Storybook documentation edits are excluded from this scope.

## Verification
- Real Mac **Safari**, 1470 CSS px: `Contact us` computed background transparent, 2px pink border, 52px height; opened Products menu and verified four original interface screenshots and their labels; empty form submission shows visible error, `aria-invalid=true`, focus on website field; returned tab to the normal page afterward.
- Mac **isolated Chromium**: at 320×568, 390×844, 874×402, 1024×768 and 1440×900, no horizontal overflow or page JavaScript errors in tested states; desktop contact styling correct; four original menu assets displayed.
- Mac Chromium mobile 390×844: 7 reverse Tab actions kept keyboard focus inside modal; invalid input reports error; `example.com` entered from a clean field yields text-only accepted status, zero preview images and zero generated proof regions.
- Mac Chromium with JavaScript off: static navigation and working direct CTA link rendered, dynamic composer hidden.
- 25 focused Node tests passed, including new tests for restored images, outlined action, accessible form response, modal focus confinement, and no-JS fallback.
- `npm run typecheck`: passed.
- `npm run build -- --webpack`: passed.
- `npm run build-storybook`: passed with pre-existing Next.js/Vite `use client` warnings.

## Scope and known limitations
- Existing broad source-text contract tests and the older release smoke script still expect superseded Hero forms, old breakpoints and old selectors; their failures are not evidence against the browser checks above. They need their own compatibility cleanup.
- Full physical iPhone Safari sign-off not claimed. Mac Safari checked directly; Mac Chromium covered responsive emulations.
- Git workspace contains unrelated concurrent, uncommitted Storybook adjustments and local visual notes. Do not bulk-stage, restore or clean those changes.
- Do not publish the private dev preview address or local absolute workstation paths. Repository remains private; no public deployment authorized.
