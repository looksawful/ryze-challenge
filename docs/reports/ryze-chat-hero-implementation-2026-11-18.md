# Ryze · Chat Hero integration report

Date: 2026-11-18
Status: validated implementation, merged into canonical main worktree.
Archived baseline: archive/main-before-chat-hero-20261118 (ce0a91276ae164743b35f6e58b3bf62051733907)
Implementation source: design/flim-chat-hero-20261118 (91a0f7853909de09e1d649c71491aa82befa338c)
Repository: looksawful/ryze-challenge. Private; no public deploy requested.

## Changes
- Canonical Hero typography, copy, mascot size, menu taxonomy and integration logos from the main baseline retained.
- Email-first chat composer with pink Start for free button. Typed AI-style responses above input for empty/invalid email and valid demo. All email remains local; no server submission or storage.
- Contact us small header-right pill on desktop and menu item on mobile. Official Ryze lockup at desktop left. Removed legacy Hero contact.
- Cookie notice shortened to one explanation and Settings/Reject/Accept; full preferences preserved. No real tracking from preferences.
- Rizzie appears left of the composer at laptop and desktop widths. Duo-specific CSS at 800-1023px reserves distinct mascot/form/logos slots.
- Original 118-piece logo animation restored with wind-blown shrinking and fading final scene, not circle. Stale undefined melting variable was removed; previously it prevented animation starting, including SVG fallback.

## Verification
- 17 focused node:test assertions passed.
- Typecheck and webpack production static export passed on Titan.
- Mac Chrome headless/Tailscale: 390, 951, 1024, 1440, 1920 screen sizes checked, mobile menu contains Contact us, invalid and valid demo form flows tested. SVG fallback dynamically transitioned from assembling to blown, 118 pieces, no page errors.
- Hardware WebGL and Safari visual QA not established by headless Chromium: must check on devices before any public release.

## Process
- Old main was archived before merge; dirty Storybook edits, other agents' screenshots, QA files and reports in the original Titan main worktree were not changed, deleted or stashed.
- Experimental source branch retained for provenance. No public deploy, no real email backend, no tracking integration.
- Follow-up: confirm actual hardware WebGL, Mac Safari, UI assets and email destination/consent before real lead collection.

Private preview: Titan static export on port 8796 (Tailscale accessible).