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
