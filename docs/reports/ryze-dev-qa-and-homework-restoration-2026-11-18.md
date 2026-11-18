# Ryze development QA, Homework footer, navigation and intro · 2026-11-18

## Scope and provenance
Continuation of the privately reviewed `dev` branch starting from `50a0d4a`. This work addresses approved Hero, animation, navigation, responsive copy, image, contract-test and footer corrections. It does not change the repository's visibility or enable GitHub Pages.

## Product implementation
- Retained the full-screen WebGL/SVG canvas, with its 118 original fragments starting beyond the **screen edges**, converging on a modest 88–116 CSS-pixel logo. The Three.js module no longer starts the paper animation a second time after loading.
- Reduced idle intervals between intro, GSAP text typing, navigation and Hero interaction. The responsive text retains the centered, narrower laptop headline and the common `prose` flow measure.
- Header: pink wordmark, transparent white-outline Contact us, genuine `Check for free` CTA.
- Domain entry accepts proper public hostnames with or without `www` or a scheme. Empty, malformed and nonsense addresses show a visible associated error; valid input yields **text-only confirmation**, not a pretend store analysis. No-JavaScript fallback remains usable.
- Desktop mega-menu separates **Products** (AI Marketer, Muse, MCP, Integrations), **Solutions** (Paid Ads, SEO & AI Visibility, CRO, Reporting), **Resources** (Guides, Blog, Free tools, Changelog) and **Pricing**. Four actual pricing tiers: $89/$129/$599/$1,499 monthly. The pricing panel opens on mouse hover or click, including keyboard navigation.
- Restored a dark, five-column Homework-style footer with Back to top and Cookie settings, naturally reached by scrolling. CSS view-timeline progressive enhancement with an immediate reduced-motion fallback.
- Removed unreachable legacy Shopify Dock event handling and dead exports without replacing the approved product routing.

## Assets
- Replaced three heavyweight card-media PNG files with visually equivalent, compressed WebP files. Average RGB difference in image regression analysis was 1.4–2.3 intensity units.
- Replaced three old menu screenshots with **pixel-identical lossless WebP** files (mean RGB difference 0).
- Both groups' obsolete PNG public copies were removed **after references were migrated and browser decoding was verified**. Previous originals remain recoverable from Git history. Total public-asset savings are approximately 6.6 MiB.
- Original edited product-shelf assets, mascot sprites, videos and third-party WebGL bundles are preserved unchanged.

## Reliable quality gates
- Deleted 25 superseded snapshot/selector-based `.test.mjs` files and 3 obsolete standalone browser-test scripts.
- Retained `website-address.test.mjs`, `links-assets-and-copy.test.mjs`, `ui-guardrails.test.mjs` and the actual `browser-smoke.test.mjs`. An optional `links-live.mjs` checks the live public destinations independently.
- `npm test`: **13/13 passed**. These cover address normalization, URL allowlists, labels, typography/semantics, common spelling mistakes, pricing, uniqueness and media references.
- `npm run test:smoke`: **9/9 passed** on a fresh built static export in headless Chrome. Includes seven layout sizes from 320 to 1920 CSS px; distinct navigation sections; hoverable Pricing; all four decoded solution screenshots; error and successful domain submission; no fake result image; dark Footer scroll; six reverse tabs confined to each mobile modal; original 118 paper pieces finishing and not restarting; no-JavaScript CTA and navigation.
- `npm run typecheck`: passed.
- `npm run lint`: passed with **zero warnings**; project-authored WebGL JavaScript is linted, third-party bundled vendor assets are excluded.
- `npm run build -- --webpack`: passed.
- `npm run build-storybook`: passed. Vite still reports nonfatal module-directive warnings from Next dependencies.
- Separate live navigation URL audit: **21/21 distinct HTTPS URLs returned HTTP 200** including redirects. The offline suite tests URL contracts without depending on third-party network availability; live check is `npm run test:links:live`.
- `npm run test:all` includes deterministic unit tests, fresh build/browser smoke, typecheck, lint and Storybook build; follow its result as the aggregate quality gate.

## Non-goals / residual review
- No public Pages deployment without explicit owner confirmation. Previously identified open GitHub Issues must be reconciled one by one; do not bulk-close issues tied to superseded UI.
- Browser evidence includes desktop/phone/landscape Chrome emulation and a prior Mac Chrome run. **Manual physical iPhone Safari sign-off remains external**.
- The footer recreates the old Homework structure and dark styling; literal pixel-by-pixel design matching against the historical screenshot was not signed off by the owner.
- Copy lint checks bounded typo patterns and accessible labels, not an exhaustive dictionary or human editorial approval.
- Do not stage or delete unrelated untracked screenshots, reports, research or tasks from concurrent agents.

## Key files
`src/features/site-shell/{SiteHeader.tsx,SiteHeader.module.css,SiteFooter.tsx,SiteFooter.module.css,link-model.ts}`;
`src/features/hero/{Hero.tsx,Hero.module.css,HeroConversation.tsx}`;
`src/motion/{hero-entrance.ts,tokens.ts,use-prefers-reduced-motion.ts}`;
`public/ryze-canvas/{index.html,src/main.js,src/media.js}`;
`scripts/{website-address.test.mjs,links-assets-and-copy.test.mjs,ui-guardrails.test.mjs,browser-smoke.test.mjs,links-live.mjs}`.

All code and asset changes belong to private `dev`. Release is not implied by a green test suite.
