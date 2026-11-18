# Ryze Motion System, 2026-11-18

Project: looksawful/ryze-challenge (PRIVATE), Titan local D:\inwork\ryze-challenge, main. No public deployment or GitHub push. Original visual composition, copy, images, breakpoints and sprite/world geometry preserved.

## Direction
- One cinematic introduction, restrained motion in interface controls.
- Typography leads: the two existing Karrik H1 lines rise first, followed by subtitles, copy, CTA, nav and Cookies.
- Controls are quick and precise; character animates softly; GSAP runs synchronized DOM entrance.
- GSAP 3.15.1 already installed; no new runtime dependency.
- Canvas/Three.js/particle effects keep independent clocks. They are not reimplemented or globally paused.

## Token families
- Control: 180ms, power2.out (Chevron, affordance).
- Exit: 200ms, power2.in (faster dismissal).
- Surface: 420ms, power3.out (mega-menu and form).
- Enter: 580ms, power3.out (Hero body).
- Emphasis: 760ms, expo.out (Karrik headline, two existing lines).
- Character: 680ms, power3.out (Rizzie's first appearance, not walking).
- Layout: 280ms CSS standard easing (dock shape).

Canonical JS values: src/motion/tokens.ts. CSS equivalents: src/app/foundation.css.

## Hero score, relative to ryze:assembled
- 0.00s: brand and H1 (two lines, 95ms between lines).
- 0.22s: subtitle.
- 0.44s: description and Rizzie.
- 0.66s: Start For Free and integration logos.
- 0.90s: Header/menu.
- 1.14s: desktop cookie panel.

All cues have purposeful overlap. The Canvas logo completes its original ~2s final pink-circle morph/shrink as text appears. 3D media cards remain temporarily disabled (SHOW_MEDIA_CARDS=false); sources retained.

## Implementation
- src/motion/hero-entrance.ts builds a single paused GSAP timeline with tracked targets.
- HeroWithNavigation.tsx preloads the existing GSAP chunk while Canvas assembles; on the validated same-origin ryze:assembled message it starts the score, with React phases playing/revealing/ready unchanged.
- gsap.context() tracks/reverts styles on teardown. The stage data-motion-driver=gsap disables duplicate CSS keyframes; if the chunk is unavailable, the original CSS stagger plays.
- Existing layout preserved; header and fixed Cookies only change opacity, never get transformed into new containing blocks.
- HeroAction entry and response: 420ms translate/soft scale rather than abrupt horizontal squash. Input examples 220ms.
- Mega menu: 420ms clip reveal with contained 260ms heading and 340ms link stagger; removed blur and exaggerated spring. Dock compacting 280ms, chevron 180ms.
- Rizzie speech bubbles: 220ms soft fade/rise; walking sprites (1100ms) and interaction logic untouched.
- Integration particle morphs and Canvas use their approved separate clocks; no fake GSAP reimplementation.

## Fallbacks
- Reduced Motion: no Canvas and immediate content/menu/Cookies. No entrance animation.
- No JS: static content with noscript navigation.
- GSAP import failure: CSS choreography.
- Canvas failure: original 24s watchdog.

## Checks and evidence
- 24 targeted tests passed before the final exclusivity adjustment; after that adjustment, all 20 selected regression tests passed; build and TypeScript passed, git diff --check passed.
- Chrome on Titan: 1440x900, 390x844, 874x402, GSAP driver active, no JS errors, no horizontal overflow. Earlier visual measurements: docs/notes/motion2-qa.json and PNG snapshots.
- Reduced-motion test after CSS specificity fix, against locally self-hosted static build: H1, nav, Cookies opacity=1; animations=none; no Canvas iframe or browser errors.
- Final Chrome mega-menu hover traversal: opened=true, remains open after moving pointer into panel, GSAP driver=true and CSS animation=none; no browser errors.
- Updated 2026-11-18 after rechecking main at 2768097: 9 targeted motion/hero tests, 47 repository tests, TypeScript and production build pass. Chrome desktop 1440×900, mobile 390×844 and reduced motion confirm full visibility, no overflow or browser errors. Motion changes are integrated through a dedicated small commit; other agents' Button WIP is excluded.

## Reference research
https://gsap.com/docs/v3/GSAP/Timeline/
https://gsap.com/resources/React
https://gsap.com/resources/a11y
https://polaris-react.shopify.com/design/motion/creating-motion
https://m3.material.io/styles/motion/easing-and-duration
https://gravity-ui.com/

GSAP/Polaris/Material are sources of principles; timing numbers in this document are original Ryze decisions. No unverifiable claim about Yandex proprietary timings.

## Implementation files
src/motion/tokens.ts; src/motion/hero-entrance.ts; src/features/site-shell/HeroWithNavigation.tsx and .module.css; SiteHeader.tsx and .module.css; src/features/hero/Hero.tsx and Hero.module.css; HeroAction.module.css; src/features/mascot/Rizzie.module.css; src/app/page.tsx and page.module.css; src/app/foundation.css; scripts/motion-system.test.mjs; scripts/hero-reveal-order.test.mjs.

Final menu rule: SiteHeader.module.css applies its CSS-only entry only when the panel lacks data-gsap-active=true. SiteHeader.tsx activates and cleans that attribute for the GSAP branch. The two animation mechanisms no longer fight for the same panel.
