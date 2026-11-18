# Ryze CSS polish: mobile Dock continuity
Date: 2026-11-18
Scope: existing design only; no decorative borders, shadows or new UI patterns. GitHub PR linked from issue #16. Single implementation: SiteHeader.module.css shared with site and Storybook.

## Reproduction and resolution
- 466x678: gap between four-link Dock and hamburger 32px -> 0px.
- 510x720: gap 76px -> 0px.
- 699x800: gap 135px -> 0px.
- 700-1199px tablet layouts: Dock and toggle heights differed by 7px -> same height.
- 951x669 Duo Open uses an intentional split-pane control arrangement (wide gap retained).
- Under 700px, removed a maximum 480px Dock width cap and narrow Duo Closed width override that separated otherwise adjacent controls.
- Tablet Dock and toggle now use the same 65px height. No changes to Hero content, typographic styling, CTA, motion, sprite, or desktop mega-menu.

## Evidence
- RED: Mac Chrome 157 via private Tailscale preview reproduced separation at 466/510/699 and mismatched tablet heights.
- GREEN: Mac Chrome 157, 11/11 responsive viewport cases.
- GREEN: Titan Chrome, Yandex Browser, Opera, 11/11 viewport cases each.
- GREEN: Mac Chrome Storybook iframe, First Screen with Navigation, 11/11 cases; this renders the same SiteHeader component.
- GREEN: TypeScript check and production static build using Next webpack; Storybook static build completed.
- Screenshot visual inspection for 375, 699, 951 on Mac; no new horizontal overflow at sampled widths.
- Existing repository tests: 45/47 pass; two **preexisting** Hero source-pattern checks fail on unchanged Hero source. They are not regressions of this SiteHeader patch; follow-up under #16.
- Firefox on Titan: headless screenshot capture produced a black frame during intro; screenshot inconclusive, **not approved**.
- Mac Safari WebDriver: session unavailable because Safari was already paired with another session. **Not tested**. No current physical iPhone or real foldable-device acceptance.
- This report does not claim full browser/device matrix completion.

## Follow-up
- Resolve baseline Hero test contracts against current approved responsive composition, without changing visual design just to satisfy text matching.
- Complete real Safari/iPhone/Firefox visual+interaction acceptance and device rotation/zoom in #16.
- Preserve existing design-system tokens and authored motion, especially the intentional Duo split-pane layout.
- No public Pages/Cloudflare publishing from this QA pass. Private repository main receives this isolated fix through one PR.

## Verification command
On an authorized browser with Chrome DevTools Protocol exposed, run:
`CDP_ORIGIN=http://127.0.0.1:<port> node scripts/nav-dock-continuity.browser.mjs http://localhost:<dev-port>/`
Use an ephemeral browser profile. The script asserts eleven geometry, alignment, and no-horizontal-overflow cases.
