# Navigation product visual refresh (2026-11-18)

Scope: Four original Photoshop-edited product images replacing existing files in `public/ryze-media/product-shelf/`, without renaming or touching component code.

| Asset | Format | Dimensions | Used in navigation as |
| --- | --- | --- | --- |
| `muse.webp` | WebP RGBA | 1448 x 1086 | AI Marketer |
| `mcp.webp` | WebP RGB | 1086 x 1448 | MCP |
| `mascot.png` | PNG RGBA | 1448 x 1086 | Muse |
| `seo.webp` | WebP RGB | 1448 x 1086 | SEO |

Consumers: `src/features/site-shell/link-model.ts` -> `SiteHeader.tsx` -> desktop mega-menu and mobile product shelf; `HeroWithNavigation.stories.tsx` / `SiteHeader.stories.tsx` share those components. `src/features/hero/HeroConversation.tsx` also directly references three of the same paths. All consumers pick up these four replacements automatically without changing imports or layout.

Source-library copy was synchronized: `RYZE-MEDIA/mockups/challenge-assets/product-shelf/` (outside this repository). SHA-256 matches verified for each file.

Other in-progress source/Storybook/CSS modifications were intentionally left untouched. No public deployment was performed.

Verification (Titan, 2026-11-18): Pillow decode/format/dimensions passed for all four files; local 
pm run build and 
pm run typecheck both exit 0.
