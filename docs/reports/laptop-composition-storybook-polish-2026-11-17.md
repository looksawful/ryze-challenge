# Ryze · Laptop composition and Storybook polish · 2026-11-17

**Working copy:** `D:\inwork\ryze-challenge`, branch `main`, private `looksawful/ryze-challenge`.
**Sync:** started from clean `2dc7cce`, compared local and remote refs, `git pull --ff-only origin main` reported already up to date. No new branch/worktree. Titan only; Mac not used.

## Scope and implementation

- Notebook CSS composition on width **1024–1999 px** and viewport height **640–1000 px**, responsive to both dimensions. Existing mobile, Duo, tall iPad and 2000+ desktop artwork remain under their own rules.
- Navigation panel stays top-fixed and centred, now ~56px high, starting ~6px from top on laptop; scroll-compact state also reduced. Original menus and interactions preserved.
- Ryze logo moved into the upper-right region of laptop Hero.
- Rebalanced H1, lead and supporting paragraph using the **existing Segoe UI heading/body typography**, fluid measures, restrained tracking, aligned Grid positions. Removed unused Satoshi declarations from Header and replaced the font in Storybook navigation showcase.
- Smaller Rizzie above the Start For Free button; existing animated/morphing Integrations logos and caption directly alongside CTA. Native component behavior preserved; no replacement/mock UI.
- The domain input expanded inline fills the responsive **Hero Grid container**, not the whole viewport. Rizzie/Integrations recede while the form is open.
- Fixed two visual collisions found in actual browser captures: 1366/1440px expanded form formerly behind desktop Cookies, and submitted example-result card formerly layered over Hero headings/paragraph. The result now flows **under the form**, with a contained readable width, and stays clear of Cookies.
- Storybook uses the **same real components** as the landing: global viewport reference sizes in `.storybook/preview.tsx`, notebook stories in `Hero.stories.tsx` and `HeroWithNavigation.stories.tsx`, form-width story adjusted in `HeroAction.stories.tsx`, navigation documentation/font updated. Existing Rizzie and Integrations stories inherit real components.
- Storybook port **6018** switched from the stale worktree to current `D:\inwork\ryze-challenge`, bound to Titan's Tailscale IP rather than all LAN interfaces; real notebook story inspected in Titan Chrome.

## Browser evidence and checks

- Titan Chrome viewports: **1366×768, 1440×900, 1536×864, 1920×960**; non-notebook regressions: **1024×1366 iPad, 874×402 landscape, 2000×1050 desktop**.
- Captured closed, expanded-form and submitted-result states for the key laptop sizes. On **1366×768**, after submitted `example.com`: form at y~486, result card at y~619–741, no overlap with lead/description or Cookies.
- `npm run typecheck` **PASS**, `npm run build` **PASS**, `git diff --check` **PASS**. No full unit/CI suite run under the approved express-development workflow.
- One-pixel document `scrollWidth` rounding at some sizes (e.g. 1367 at viewport 1366) observed; no material horizontal content clipping in the inspected screenshots. Browser QA at Mac/Safari/physical laptop not performed.
- Preview-only CSS measurement Grid restored in static `out/` with **G** toggle (it will need restoring after a future export/build). Grid and screenshots under `out/` are preview resources, not production source or Git history.

## Current private links (require Tailscale)

- Live site: http://100.110.158.49:3090/
- Storybook (main): http://100.110.158.49:6018/?path=/story/design-system-screens-first-screen-with-navigation--notebook
- Laptop browser shot: http://100.110.158.49:3090/_qa/1366x768.png
- Full-width form: http://100.110.158.49:3090/_qa/1366x768-form.png
- Result state: http://100.110.158.49:3090/_qa/1366x768-result.png
- Real Storybook frame: http://100.110.158.49:3090/_qa/storybook-notebook.png

No new modules, dependencies, branches, public deployment, CI or automated test infrastructure.

## Follow-up correction after user review

The earlier claim of a *fully* finished laptop composition was premature. Hero contained a **Rizzie** illustration above the CTA, not a product-device mockup. These must not be conflated.

- Replaced the artificial six-track laptop Grid with intrinsic type/content rows and two height-distributed flexible rows; removed the opposing headline span alignment in laptop view so both title lines share a visual centre.
- Reduced heading tracking to a safer -.04em and balanced its measure; kept brand in upper-right and real Integrations morph animation beside the existing Start For Free CTA.
- Retained the real draggable/tappable Rizzie on a smaller stage above CTA. No substitute product image was introduced, because the existing local phone mockups and Ryze website screenshots represent different products/screens; the intended product mockup has not been identified.
- Verified on Titan Chrome with 1366×768, 1440×900, 1536×864 and 1920×960 closed and expanded states, and 1024×1366, 874×402, 2000×1050 as non-laptop references. Submitted `example.com` result at 1366×768 appears at y≈581–703, below form and outside Hero copy.
- Updated Storybook visual content automatically via shared production Hero and Header components. No duplicate mock Hero component made.
- **OPEN / incomplete:** place the specifically intended product mockup above the button once its asset is unambiguously selected. Preserve Rizzie, do not arbitrarily use a marketing screenshot as a product mockup. This is not part of this CSS correction.


## P1 composition and adaptive-grid repair · 17.11.2026 (latest)

**Scope:** user explicitly **deferred P0 mockup**; this change addresses only Hero optical composition and conflicting responsive rules. Work performed on Titan, existing private `main`, without a new worktree, CI, packages or changing Hero copy.

**Implementation:**
- Consolidated notebook/desktop landscape styling in `src/features/hero/Hero.module.css`: one fluid, intrinsic five-row Grid for width 1024–2399 CSS px, aspect ratio at least 5:4, minimum height 608 CSS px. Sizes use existing design tokens and `clamp()`, without hard-coded absolute placements for H1/CTA/Rizzie.
- Replaced the overlapping legacy short-desktop and mid-wide overrides; media-block count reduced from the previous version, with separate accepted **Duo Open**, **tall iPad** and **ultrawide** layouts preserved. A tall horizontal 700–1023 composition now uses an intrinsic Grid rather than a fixed-size row matrix.
- Converted min/max width queries to complementary CSS Media Queries Level 4 range syntax, avoiding fractional CSS pixel gaps around 699/700 and 1023/1024. Corrected leftover named Grid areas, which were accidentally shifting the mid-width Ryze logo.
- Controlled Rizzie's **artwork scale inside its allotted stage** in both intermediate and laptop modes, so the painted sprite does not intrude into H1/description. Preserved the existing interactive mascot component and its drag/touch/bubble behavior.
- Consolidated H1/lead/description group and CTA + morphing Integrations into a consistent optical hierarchy. CTA and Integrations remain side-by-side; Rizzie stays above CTA.
- Aligned `src/features/hero/HeroAction.module.css` result-card positioning with the same aspect/width selection. Submitted-form result now stays below the form across the new responsive desktop regime rather than floating over Hero text.

**Chrome visual audit on Titan (no Mac):**
- Compared actual rendered viewport sizes 699×800, 700×800, 899×800, 900×800, 951×669, 1022×800, 1023×800, 1024×800, 1199×800, 1200×800, 1366×640, 1366×768, 1440×900, 1536×864, 1599×850, 1600×850, 1897×1024, 1920×960, 1999×960, 2000×960, 1024×1366 and 874×402. Also inspected 683×384 as a narrow/approximately-200%-zoom CSS viewport; document scrolling remains available.
- **Before:** at requested 1023×800, CTA at y≈785, below an 800px viewport; after: y≈595, fully visible. At 699/700×800, CTA now begins at the same y≈463 on both sides. At 1599/1600×850 the Hero geometry is continuous. Previous 1897×1024 vs 1920×960 hard composition swap was removed for landscape desktops.
- Form closed/open was captured at 14 widths/heights. Actual domain `example.com` submission produced a demo-result card at **1366×768** (result y≈546–668) and **1920×960** (result y≈679–801), outside the headline/lead and Cookies regions.
- `npm run build` PASS, including Next's TypeScript step; `git diff --check` PASS. Full test suite, CI and Safari were **not** run under express-mode instruction. 1px width differences in some CDP emulated viewports are attributed to fractional CSS pixel rounding; no larger horizontal document overflow was observed.
- Real Storybook Hero/Navigation/Form use the **same CSS modules** so these changes propagate to existing stories, but no separate full Storybook acceptance is claimed.

**Private Titan evidence:** `http://100.110.158.49:3090/_qa/p1-1023x800.png`, `/_qa/p1-1024x800.png`, `/_qa/p1-1366x768.png`, `/_qa/p1-1920x960.png`, `/_qa/p1-result-1366x768.png`, `/_qa/p1-result-1920x960.png`. All paths are temporary preview copies in `out/_qa`, not committed binaries. The preview-only measurement Grid (G toggle) was restored after build.

**Not claimed:** user-approved final optical design; automated Safari QA; completion of product mockup P0, explicitly postponed by the user.
