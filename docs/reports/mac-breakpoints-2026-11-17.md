# Ryze · Mac Chrome · visual breakpoint audit · 17.11.2026

**Scope:** read-only visual QA of private current `main` (commit `ae95848`), served from Titan via Tailscale at `http://100.110.158.49:3090/`. No application, CSS, CI, test or branch changes in this audit.

**Method:** actual Google Chrome 157 on Mac `Lilith.local`, with its tab resized in Chrome DevTools Protocol (`Emulation.setDeviceMetricsOverride`), screenshots rendered by Chrome (`Page.captureScreenshot`). A separate macOS `screencapture` confirmed the on-screen Chrome session. These are **browser-emulated CSS viewports on the Mac**, not physical Duo hardware or Safari. Opened hamburger panel and scrolled to product shelf; also opened desktop Products MegaMenu. The screenshots below are captured from that browser, not design mockups.

**Viewports (21):** 320×568, 375×667, 402×874, 440×700, 466×678, 510×720, 540×850, 699×800, 700×800, 874×402, 897×1211, 918×874, 951×669, 1000×750, 1023×850, 1024×1366, 1199×850, 1200×850, 1440×1024, 1897×1024, 2803×1024.

## Findings

### P1 · visual composition defects

1. **CTA overlays Rizzie at narrow portrait widths:** At `375×667`, top of Rizzie is visibly hidden behind Start For Free. Similar contact at `466×678` and `510×720`. Rectangular Hero layout at 375 has mascot container x22–188/y483–635 and action x22–353/y441–517: **34px vertical overlap** of their layout boxes. The overlap is visible in the browser screenshot. **Corrective direction:** reflow CTA and sprite so the actual visible illustration has clearance, not only bounding-box margin. Evidence: [375×667](assets/mac-breakpoints-2026-11-17/375x667.png), [466×678](assets/mac-breakpoints-2026-11-17/466x678.png), [510×720](assets/mac-breakpoints-2026-11-17/510x720.png).
2. **Mobile Dock splits into disconnected shapes:** at `466×678`, gap Dock→hamburger ≈**34px**; at `510×720`, ≈**78px**; at `699×800`, ≈**137px**. Dock has squared right edge while hamburger remains isolated at right edge, forming a broken visual control group. At `540×850` the gap is small; this is a **range/breakpoint issue**, not universal. **Corrective direction:** compute Dock width + hamburger as one adaptive cluster or use consistent max width and separation. Evidence: [466×678](assets/mac-breakpoints-2026-11-17/466x678.png), [510×720](assets/mac-breakpoints-2026-11-17/510x720.png), [699×800](assets/mac-breakpoints-2026-11-17/699x800.png).
3. **Hard transition 699→700px:** at `699×800` Rizzie seated below CTA; at `700×800` Rizzie changes to standing and moves substantially up, while CTA moves down. At 700px the visible sprite enters the Description area. **Corrective direction:** tune adjacent Hero composition rules at the 700px threshold, preserve design intent but avoid collision/violent 1px jumps. Evidence: [699×800](assets/mac-breakpoints-2026-11-17/699x800.png), [700×800](assets/mac-breakpoints-2026-11-17/700x800.png).
4. **CTA/Integration overlap on ultrawide:** at `2803×1024` CTA bounds x1878–2171/y794–880; Integration bounds x2039–2359/y754–824. Their layout **overlaps approximately 132×30px**; the animated logo visibly approaches/overlays the button at its top-right corner. **Corrective direction:** reserve distinct slots for CTA and integration row at ultra-wide. Evidence: [2803×1024](assets/mac-breakpoints-2026-11-17/2803x1024.jpg) (compressed from the full-resolution Mac screenshot).

### P2 · layout/UX polish

5. **Rizzie too small at 320×568:** visual sprite appears roughly 60px tall despite larger containing block; conflicts with the previously agreed **110px visible minimum**. Also excessive empty space between CTA and sprite. Evidence: [320×568](assets/mac-breakpoints-2026-11-17/320x568.png). Corrective direction: balance vertical distribution, preserve readable H1, primary CTA and integration caption.
6. **Tall tablet void:** `897×1211` content occupies top ~775px leaving over 400px blank; `1024×1366` has a long empty vertical band between text and bottom elements. No clipping, but weak composition. Needs comparison against approved specific Figma composition before altering. Evidence: [1024×1366](assets/mac-breakpoints-2026-11-17/1024x1366.jpg).
7. **Product shelf buried inside hamburger:** `402×874` dialog has ~1445px scroll content for 874px viewport, shelf comes after Products/Explore/Resources/Company. It takes **571px scroll** to reach bottom of dialog and see full shelf; for 874×402 even less initially visible. Rail itself works and has four valid images. Consider moving shelf closer to Products heading, but location change is a **design decision**. Evidence: [402×874 menu bottom](assets/mac-breakpoints-2026-11-17/402x874-menu-bottom.png).
8. **Desktop MegaMenu content mismatch:** 2×2 illustrated cards are correctly `AI Marketer / MCP / Muse / SEO`, but right-hand links still say `AI Marketer / Muse / Shopify CRO`. Right column is visually sparse; navigation nomenclature contradicts cards in the same panel. Source mapping/links in `navigationGroups[0]` needs reconciliation without changing accepted desktop 2×2 design. Evidence: [1440×1024 products](assets/mac-breakpoints-2026-11-17/1440x1024-products-small.jpg).

## Passing observations

- At all 21 CSS sizes, document scroll width equals viewport width; document scroll height equals viewport height at default zoom and in the **closed** state. No whole-page horizontal/vertical overflow.
- In closed state, mobile Dock and hamburger bounding boxes did not overlap; the problem is an inconsistent **gap**, not pointer geometry overlap.
- Mobile dialog opens at tested 320/402/466/699/700/874 landscape/918/951/1024/1199 sizes; desktop trigger hidden at 1200+.
- Existing mobile product rail has `scroll-snap-type: x mandatory`, works with horizontal movement and shows AI Marketer, MCP, Muse, SEO; all four product images are loaded, naturalWidth > 0.
- Desktop `Products` MegaMenu opens at 1200/1440/1897; four artwork assets loaded, desktop 2×2 remains. Cookie notice remains bottom-right in desktop prototype.
- The audit does not prove native iPhone Safari, real Duo hinge and 200% zoom. No full tests, CI, lint or build were run for this read-only QA.

## Recommended correction order

**P1 first:** (1) CTA vs Rizzie narrow widths, (2) four-text Dock continuity at 466/510/699, (3) 699/700 reflow, (4) 2803 CTA vs integration. **P2 later:** 320 Rizzie scale, tall tablet distribution, product shelf order, desktop product link taxonomy.

**Artifacts:** selected Mac Chrome screenshots alongside this report in `docs/reports/assets/mac-breakpoints-2026-11-17/`; full 21-viewport screenshot set and extended menu screenshots were captured locally on Mac at `/tmp/ryze-layout-audit-20261117/` (temporary, not source-of-truth). No changes to application source.
