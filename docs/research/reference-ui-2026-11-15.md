# RYZE reference UI: external evidence and implementation differences

Date: 2026-11-15. Scope: menu/footer architecture and future HeroAction motion references; not a page clone or publication approval.

## Observations (read-only browser inspection)

### Ryze public product page
Source: https://www.get-ryze.ai/shopify-claude-ai-for-paid-ads-geo-cro

- The site navigation contains AI Marketer, MCP, Muse, SEO, Shopify CRO, About Us, Pricing and Book a call, with some secondary destinations under MCP.
- Actual navigation Pricing points to `/payment-setup`; another Pricing anchor on the page points to `/pricing`. Both are **real but different** destinations. The preview header preserves the first, and footer preserves the second.
- Book a call is a link to `https://ryze.cal.com/hello/partner-program` (target _blank), but a separate final CTA submits an email form labelled Book a call. Do not conflate these actions.
- Start For Free occurs on two domain forms, not as an anchor. The public DOM has a required URL-mode text input, placeholder `Type your domain` and a submit button. Form submission's JavaScript outcome was **not** exercised or verified.
- Source marketing/product wording and addresses were checked on the public page only. Group labels and short descriptions below are independently authored for this preview, not official Ryze taxonomy.

### Lovable public marketing site
Source: https://lovable.dev/

- Desktop navigation: hover-open large menu; mobile/narrow: dedicated full-height dialog with separate nested screen, Back and Close. Menu switches at 1024 px in inspected browser.
- Footer: six open columns at >=1024 px, three at 640–1023 px, two below 640 px; groups do not change into accordions.
- The prompt composer types, holds and erases example copy; text-entry hides its separate visual placeholder and reveals a send control. The site uses Camera Plain Variable and Roboto Mono Variable. **Do not install/copy those fonts**.
- A Lovable CTA-to-input morph and mobile bottom drawer were **not** observed. Those are original RYZE decisions in #12, not Lovable replicas.
- Production chat response animation was **not** exercised in this session.

### GSAP public homepage
Source: https://gsap.com/

- Main headline is visually assembled from animated decorative spans (marked aria-hidden), while the semantic H1 exists separately as visually hidden text.
- Measured headline CSS font size: ~84 px at viewport 390 px, ~112 px at 600 px, ~134 px at 768 px, ~169 px at 1024 px, ~224 px at 1440 px. These sizes are **not tokens to import**.
- Responsive menu layout differs between 1200 and 1279 px in tested screenshots. Exact rule was not established.
- GSAP's site uses Mori. **Do not install/copy it**; the RYZE system retains Segoe UI.
- Website-specific brand animations/assets are not reused. Later effects can use GSAP Flip/Timeline under existing progressive-enhancement spec, once approved and dependency changes are authorized.

## Current isolated shell prototype

Implementation branch: `feat/reference-shell-components` from `origin/dev`. The current working tree for Issue #8 remains untouched.

Files:
- `src/features/site-shell/link-model.ts`: one verified URL map for navigation and footer
- `SiteHeader.tsx` and CSS module: desktop mega panel; mobile dialog, nested navigation, Back, Close; preview links emit feedback instead of navigation
- `SiteFooter.tsx` and CSS module: six/three/two-column grouped links
- `scripts/site-shell.test.mjs`: destination and preview state tests

The shell is **not mounted into the Hero route**; it awaits Issue #8/#9 integration and #10 mascot handling. Avoid treating it as complete Issue #11, a final footer, or approved motion.

## Intentional differences and provisional decisions

| Item | Reference evidence | RYZE implementation | Status |
| --- | --- | --- | --- |
| Typography | Lovable: Camera Plain; GSAP: Mori | Existing `--font-body`, Segoe UI | Approved constraint |
| Menu breakpoint | Lovable 1024 px | 68rem / 1088 px | Provisional; measure collisions after integration |
| Footer column thresholds | Lovable 640 / 1024 px | 40rem / 68rem | Provisional; match available content, not brand identity |
| Header taxonomy | Ryze current direct links | Products / Solutions / Resources as grouped menus | Authored preview taxonomy; needs review |
| Preview selection | Ryze navigation follows links | React intercepts clicks to stay on preview; callback for future Rizzie | Required by #7/#11 |
| Mascot bubble | #10 asks for Rizzie | Current status text fallback until mascot integration | Incomplete |
| Brand mark | Approved Ryze symbol | Shell takes optional brand prop; text-only default | Incomplete; reuse Hero mark after integration |
| Motion | GSAP Flip/Timeline reference | Simple CSS enter motion only; no new dependency | Provisional; full choreography #12/#13 |
| Footer inclusion | First-screen Hero only | Standalone unmounted component | Needs explicit integration decision |
| No-JS | Static link fallback | `noscript` full navigation; JS preview prevents navigating | Needs browser test |

### One-off hardcoded values to revisit after visual verification

- Breakpoints: `68rem` duplicated in CSS and `matchMedia` to close the mobile dialog when entering desktop; a contract test should detect drift. `40rem` for footer layout.
- Shell header height: `4.5rem`, dialog starts below it; device height and safe-area tested later.
- UI radii: `0.75rem`, `1rem`, `1.5rem` for shapes not yet represented by global tokens.
- Decorative motion durations: `180ms` mega, `230ms` mobile, only under `prefers-reduced-motion: no-preference`.
- Max panel width: `47rem`, not copied from Lovable; revise only after matching target screenshots.
- Tooltip/fallback uses a text status until Rizzie artwork and placement are approved.

## Debug and verification checkpoint, 2026-11-15

- Initial `npm run typecheck` failed at `src/app/layout.tsx(9,50)`: `LayoutProps` was missing. The separate worktree had no generated `.next/types` yet; `npm exec --no -- next typegen` then `npm run typecheck` passed without touching the layout.
- Minimal persistent fix on this feature branch: `package.json` runs `next typegen && tsc --noEmit`. No dependencies, fonts or Next configuration were added.
- First `npm run build` attempt failed because `node_modules` was a junction to a separate worktree; Turbopack refuses resolution outside its project root. The junction was removed, the branch got its own `npm ci` install, and the normal `npm run build` then passed.
- Verified: `npm run lint` passed; `npm run typecheck` passed; 4 existing foundation tests and 4 new link-model tests passed; Next static build and `npm run test:static` passed. Extra warning: Node warns about module typing for direct `.ts` import in a test; do not change package module mode solely to silence it.
- **Ponytail:** no added dependency or custom animation engine. Future scope discipline: shell components remain unmounted pending real browser interaction tests and review. A 257-line header plus 298-line CSS is not yet proven by use; avoid expanding until behavior is verified. Standalone footer is not part of current Hero route.
- Git working state: all changes are on the isolated `feat/reference-shell-components` branch; neither `dev` nor the concurrent Issue #8 worktree was modified.

## Evidence still required

- Actual browser screenshot comparison of this preview at 390, 640, 1023, 1088 and 1440 widths; keyboard Escape, focus return, body scroll lock, dialog open/close and reduced motion.
- Confirm real semantics of `Start For Free` and Book a call submissions **without sending user data to third-party services**.
- Integrate only after Issue #8/#9 and mascot decision; do not merge to dev/prod or deploy without separate approval.
