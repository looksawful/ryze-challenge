# Ryze · Chrome on Mac · responsive composition audit (2026-11-17)

**Scope:** private Ryze `main` after commit `ae95848`, served via Tailscale Titan `http://100.110.158.49:3090/`. Mac: Lilith.local, Chrome 157, remote CDP device metrics emulation, original browser-rendered PNG screenshots. **No source-code changes.** Safari/physical devices were not tested. Captures use ordinary rendered Chrome, not synthetic artwork.

## Coverage

- 21 viewports: 320×568, 375×667, 402×874, 440×700, 466×678 (Duo Closed), 510×720, 540×850, 699×800, 700×800, 874×402 (landscape), 897×1211, 918×874, 951×669 (Duo Open), 1000×750, 1023×850, 1024×1366 (iPad), 1199×850, 1200×850, 1440×1024, 1897×1024, 2803×1024.
- 11 expanded-menu screenshot states: 320×568, 402×874, 466×678, 699×800, 700×800, 874×402, 918×874, 951×669, 1024×1366, 1199×850, 1200×850 (note: at 1200px hamburger is hidden, and the menu was opened programmatically; **not** a real-user interaction).
- Document scrollWidth matched viewport in all 21 captures; no horizontal overflow. No broken image loading detected. This **does not** establish visual acceptance.
- Mac comparison gallery: `http://100.117.181.54:9137/` (requires Mac and temporary preview server running on Tailscale); screenshot ZIP: `http://100.117.181.54:9137/screenshots.zip`; originals `/tmp/ryze-layout-audit-20261117/` on Mac. The report and images in that temp directory can be lost after reboot; copy ZIP to permanent storage when needed.

## Findings

### P1 · Visible overlap or severe composition jump

1. **375×667:** primary Start For Free CTA overlaps Rizzie region approximately 166×34 CSS px. Visible silhouette sits behind button. Height-sensitive: no corresponding overlap at 402×874. Recommended: adjust mobile short-height stacking, reserving mascot's actual drawn bounds.
2. **699→700px at 800px high:** Hero composition abruptly switches. CTA moves from y≈463 to y≈629 (166px); Rizzie from y≈549 to y≈453, entering proximity of the Description (on screenshot his head visibly reaches the description region). The Dock also changes from a wide detached bar with a large blank gap before hamburger to a joined tablet pair. Recommended: smooth composition handoff and protect description from mascot's actual image content, not only wrapper geometry.
3. **2803×1024:** CTA wrapper and animated Integrations group intersect by approximately 132×30 CSS px; animated logo particles can intrude over upper-right CTA area. Recommended: reserve fixed separation between CTA and integration cluster on ultrawide.
4. **Docks 510–699px wide:** varying empty gap between the last dock item and hamburger (e.g., 699×800 Dock right≈492px, hamburger starts≈629px, gap≈137px). Navigation looks broken into two unrelated pills; at 700px they suddenly sit together. Recommended: one aligned fluid flex/grid pair in this band, preserving right edge and avoiding abrupt horizontal jump.

### P2 · Composition quality or content hierarchy

5. **320×568:** unusually small *visible* Rizzie figure and cramped content, though all components nominally fit. Fine-tune responsive content hierarchy instead of blindly shrinking artwork.
6. **951×669 / 1000×750 (Duo-like landscape):** Lead text is located very near bottom edge (starts y≈628 and y≈709 respectively), while the other content is distributed across the screen. Recommended: pull lead into a coherent content group and maintain comfortable bottom breathing room.
7. **1024×1366:** oversized empty vertical band between description and Rizzie/CTA cluster. Entire layout fits but the visual rhythm is weak; mitigate with height-aware grouping.
8. **1199→1200px at 850px high:** nav switches immediately between mobile/tabled Dock and desktop menus; desktop Cookie notice also appears at 1200. This is a discontinuity rather than confirmed functional bug; review transition in final accepted style.
9. **Mobile menu, all tested sizes:** new AI Marketer / MCP / Muse / SEO image cards appear in the lower 'Other products' rail, but the upper **Products** section retains AI Marketer/Muse/Shopify CRO/SEO-GEO/Agents/Agency. The requirement to prioritize four products is visually diluted by duplicate product navigation. Consider elevating the new rail (without removing unrelated links until separately approved).
10. **Short landscape 874×402:** dense layout and narrow margins. DOM bounding boxes for headline/lead/mascot partially overlap because decorative image wrappers are broader than visible painted pixels. Manually review at 320% zoom and real mobile landscape; no assertion of visible glyph collision from geometry alone.

## Verified okay

- Text-only four-link Dock with separate hamburger rendered on 21 viewports where mobile layout applies.
- The 951×669 Duo Open scene separates left Dock and right hamburger without measured nav-control overlap.
- No document horizontal overflow and zero broken image references across captured viewports.
- Existing mobile right-hand drawer opens and new product media loads on checked cases; 1200px programmatic drawer screenshot not used as user-visible acceptance.
- No findings here constitute an approval of iPhone Safari, actual touch targets or 200% browser zoom.

## Next implementation focus

Correct P1 (#1–4) first on same main, using existing CSS layouts/components only, then recheck 375×667, 699/700×800, 951×669, 2803×1024. Prior to changing P2 layout decisions, preserve approved visual direction and the separated Duo navigation. No new branches, no public preview. The user did not ask to modify code as part of this audit.
