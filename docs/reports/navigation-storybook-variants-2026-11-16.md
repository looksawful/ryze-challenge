# Navigation / MegaMenu · Storybook variants

> Historical QA/release snapshot. Current behavior: source code; open work and acceptance: GitHub Issues. Dates and branch status below refer only to this checkpoint.
Date: 2026-11-16. Repository: looksawful/ryze-challenge. Local branch: dev.

## Scope completed in working tree
- Existing Storybook location: `Site shell / SiteHeader`; no duplicate Storybook instance.
- Interactive story plus 5 separately addressable stories: static/no JS, reduced motion, no WebGL, low-power, full GSAP.
- Both dawn/dusk themes; ryze/header, overlay Hero, and bottom-to-top dock variants.
- One SiteHeader consuming shared verified destinations in `link-model.ts`.
- JS preview clicks stay on the page and show either the existing toast fallback or dispatch `rizzie:message` to the actual Rizzie mascot.
- Real href retained. Without JavaScript, external links may open normally, by user decision.
- GSAP 3.15.1 added as a runtime dependency and lockfile entry. Premium animation dynamically imports GSAP; static/reduced/lightweight render without it.
- Product highlights, desktop MegaMenu and mobile dialog are included in SiteHeader.

## Verification
- `npm run typecheck`: pass.
- `npx eslint src/features/site-shell/SiteHeader.tsx src/features/site-shell/SiteHeader.stories.tsx`: pass.
- `npm run build-storybook`: pass (nonblocking Storybook bundler warnings).
- Storybook local HTTP 200 and stories present in index.json.
- Tailnet-only preview endpoint HTTPS 200:
  https://titan.tail85619a.ts.net:8451/?path=/story/site-shell-siteheader--navigation-preview

## Limitations and handoff
- Visual approval and real iPhone/Safari/screen-reader behavior not yet claimed.
- This is local work-in-progress, not committed, merged, or deployed to prod.
- Parallel executor also has uncommitted changes to Hero and Storybook inventory. Do not stage, reset, or merge those files without reconciliation.
- The historical GSAP reference remains in D:\inwork\awful-homework; do not delete that worktree.
- GitHub issue #11 and Asana were not changed.


## Homework / Lovable navigation restoration — 2026-11-16

Scope: updated the existing Site shell / SiteHeader Storybook stories and reusable SiteHeader. Historical design-only reference: D:\inwork\awful-homework, commits 4fa6361, 32d3973, 2f04161. Sources reviewed: RyzeMegaMenu.tsx, prototypes.module.css, RyzeProductShelf.tsx, NavScrollMotion.tsx, RyzeMobileNavigation.tsx, RYZE_DESIGN_SYSTEM_BASELINE.md, and the approved browser annotations.

Implementation:
- Restored Satoshi, actual Ryze wordmark, original neutral Eclipse dawn/dusk colors, 944px 2:1 MegaMenu, 2×2 Ryze product screenshots and actual product URLs. No placeholder glyphs or pink navigation accent.
- Full: reversible GSAP clip-path originating from the trigger, item stagger, and bottom full-width dock repositioned at the exact end of the dark showcase. Dock fades briefly and settles at the top, without flying across the page; reverse restores the bottom.
- Reduced: same visual content with no decorative motion. No-WebGL: same GSAP behavior, no WebGL dependency. Low-power: lightweight CSS only. Static: native HTML details and genuine links.
- Mobile: original five-item bottom dock (Home, Products, Cases, Pricing, More), right-edge dialog, Back/Close, illustrated Products submenu.
- Preserved existing challenge link registry; extra original capability cards added to that registry. JS-enabled link clicks show the existing Toast and never leave the demo. Without JS links may navigate, as agreed.
- Existing Storybook section now has one interactive switcher plus all ten mode-by-theme fixed stories, and Header/Hero variations. No Rizzie UI or mascot code modified, and no new Storybook instance.

Browser observations, 1440 and 390 Chromium (local artifacts: D:\inwork\_pr_completion_tooling\ryze-nav-qa-*.png and ryze-nav-browser-report.json):
- Full GSAP menu rendered with 944px width, 7 links and no runtime errors.
- Paid Ads click displayed Toast; URL remained unchanged.
- Dock stayed at the bottom at scrollY=1000 inside the dark area. After crossing the dark/light boundary at scrollY about 1808, it appeared at top=12px. On scrolling back to 0 it returned to the bottom.
- On mobile the five Dock actions were visible. More opened the dialog with body scroll locked; Products showed four original illustrated cards and Back.
- Dawn and static Storybook controls worked. Static contains three native details disclosure groups and genuine href.
- TypeScript, targeted ESLint, and Storybook build: PASS. Existing nonblocking bundler warnings.

Access: http://127.0.0.1:6007/?path=/story/site-shell-siteheader--navigation-preview
Private HTTPS (HTTP 200 tested): https://titan.tail85619a.ts.net:8451/?path=/story/site-shell-siteheader--navigation-preview

Limits: visual parity not pixel-compared against every Figma screen; Safari/physical iPhone, manual screen-reader audit and real JavaScript-disabled page still require checking. The static story is a native-HTML demonstration inside JavaScript-enabled Storybook. WebGL-off and low-power conditions have not been hardware-tested.

Handoff: the work remains local and uncommitted on dev. Other developers concurrently modified Hero, Consent and Inventory; no interference or staging. No prod push, GitHub issue, Asana change, or change to awful-homework.

## Storybook simplification (2026-11-16)

User approved one Storybook story with Controls instead of separate mode/theme/position stories.
- Existing SiteHeader.stories.tsx now exports only Navigation / Interactive (id navigation--interactive).
- Controls: enhancement mode (five options), Dawn/Dusk theme; breakpoint uses Storybook's built-in Viewport toolbar.
- Default: Full GSAP / Dusk / responsive Desktop. No custom controls, position selector, mascot, large hero copy, hint chips or duplicated stories.
- Nav remains the real reusable SiteHeader with original Homework/Lovable UI. A minimal dark + light scene remains only to inspect dock transitions while scrolling. No navigation source files changed in this simplification.
- Storybook index verified exactly one export for SiteHeader.stories.tsx; preview local HTTP 200, private Tailscale HTTPS 200; TypeScript, targeted ESLint and Storybook build successful.
- Current preview: https://titan.tail85619a.ts.net:8451/?path=/story/navigation--interactive
- All changes still local/uncommitted, prod untouched. Visual manual iPhone/Safari review remains outstanding.
