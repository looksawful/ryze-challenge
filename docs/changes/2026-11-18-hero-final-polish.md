# Ryze Hero polish and preserved baseline (2026-11-18)

Scope: implement only the eight changes requested for the current live Mac/Titan prototype. No old layout restoration, additional screens, public deployment, or changes to unrelated worktrees.

## Preserved starting point
- Working source: `D:\inwork\ryze-challenge`, `main` (Next dev on Titan port 3000, tailnet `100.110.158.49:8447`).
- Prior uncommitted website, motion and Storybook changes were committed and pushed first as `8ca46a9`.
- Separate untracked screenshots, research notes, historical local reports and draft plans remain untouched and uncommitted. They are not public release materials.

## Focused changes
1. Shortened 118-paper logo motion by changing the shared clock scale `0.78 → 0.66`; reduced logo footprint `610 → 550`. Preserve paper gust and completion event.
2. The Ryze header lockup remains visible at mobile widths, with transparent background on all devices. Desktop navigation still has its own pill surface.
3. Made the top-right Contact us action taller (52px) and more legible (14px), keeping the existing label and destination.
4. Integration caption no longer shrinks into unusable narrow characters; minimum 13px font, 10ch minimum caption width, flexible layout with natural wrapping below logos when necessary.
5. Disabled manual Rizzie dragging and detachment while preserving non-drag sprite behavior and desktop booking click; mobile decorative link is removed from keyboard tab order.
6. Changed the Hero conversation field from email-only validation to a website address. `normalizeWebsiteAddress` accepts `example.com`, `www.example.com`, full HTTPS/HTTP URLs and nested subdomains; rejects invalid hostnames, unsafe protocols and credentials. The preview remains entirely local with no network-based store analysis.
7. Desktop/mobile product shelf mockup images use a full-bleed crop instead of padded object containment, without replacing the user's edited assets.
8. The H1 uses an actual character-by-character opacity/type sequence instead of bottom-up translation. A single character rotates every 35–55 seconds while the page is visible and full motion is enabled; cleanup cancels idle tweens and restores unsplit source text.

Storybook's interactive HeroConversation example and the focused test descriptions were updated from email to website input. The legacy domain-first HeroAction remains archived and was not reinstated.

## Verification
- `npm run typecheck`: PASS.
- Focused Node tests (website URL parser, current Storybook, Hero form, Flim, reveal order, art direction): 23/23 PASS.
- `npm run build -- --webpack`: PASS on Titan before the final integration-caption flex tuning; recheck at final commit.
- Mac headless Chrome against the exact live Titan server: 320, 390, 1440 CSS px. Header lockup visible with transparent background at all widths; Contact us 52px on desktop; 13px integration caption at small widths, no horizontal page overflow, no page JS errors, no draggable mascot target.
- Mac Chrome actual valid website entry `example.com`: ready preview shown. Product mega-menu images report `object-fit: cover`. Simulated desktop pointer drag did not detach the mascot.
- Full-motion 1440×900 probe: paper iframe reached `blown`; the Hero changed `playing → revealing` with GSAP and split per-character H1 → `ready`, approximately 6.4 s in one loaded browser run. Intro appearance varies with asset/network and device speed.
- This is not a claim of real iPhone/Safari manual approval: the user will review appearance on the already-open Safari tab.

No public Pages deployment or repository visibility change.
