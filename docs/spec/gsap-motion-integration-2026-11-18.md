
# Ryze GSAP motion integration: draft spec and tickets

**Status:** DRAFT, approval pending. No implementation permission or public deployment.
**Date:** 2026-11-18
**Authority:** Existing CONTEXT.md, docs/adr/0002-component-and-motion-architecture.md and docs/spec/hero.md remain authoritative for previously agreed behavior. Detailed evidence lives in docs/research/2026-11-18-commercial-motion-audit.md.
**Tracker:** docs/agents/issue-tracker.md defines GitHub Issues as the single executable tracker. Current Asana Ryze task mirrors the decision log; do not create a duplicate ready backlog. This draft is not ready-for-agent.

## Problem Statement

Meaningful Hero content, navigation and the Start For Free action are hidden and made inert until the WebGL intro emits ryze:assembled. A 24-second watchdog is the fallback. Decorative motion currently gates user access, despite the accepted static-first contract. Responsivity, JS lifecycle and interruption handling are fragmented. We must improve motion without changing approved appearance or trampling concurrent edits.

## Solution

Keep native semantic HTML and CSS-first layout. Make headline, CTA and navigation immediately available and independently functional, regardless of the progress or failure of WebGL. Let existing Canvas render independently. Keep existing GSAP timelines and scoped contexts; introduce GSAP matchMedia only where responsive GSAP instances need automatic setup/revert. Compare CSS versus Flip for the desktop CTA and existing headline spans versus SplitText in real Storybook, shipping plugins only with measured advantage. Add timeline scrubbing only to the private debug laboratory.

## User Stories

1. As a first-time visitor I can read the headline and reach CTA and menu while brand motion is still running.
2. As a visitor without JavaScript or WebGL I see meaningful content and native fallbacks.
3. As a keyboard or assistive technology visitor I can focus controls in DOM order, without invisible/inert obstacles.
4. As a reduced-motion visitor I see stable content rather than heavy movement.
5. As a visitor changing the motion preference during an animation, nothing stays hidden or stuck.
6. As a visitor rotating or resizing the screen, animations are cleaned up and the layout remains readable.
7. As a visitor switching menu categories rapidly I get an immediately responsive, reversible MegaMenu.
8. As a wide-layout visitor I open an inline form that visually relates to the Start For Free trigger.
9. As a mobile visitor I get the existing accessible native bottom drawer.
10. As a visitor resizing an open form through the wide/narrow boundary, input, error and focus survive.
11. As a visitor retrying the demo, validation, thinking, response and edit continue working.
12. As a visitor at 200% text zoom, the headline is neither clipped nor repeated by animation.
13. As a screen-reader user I hear one meaningful H1 regardless of animation strategy.
14. As a reviewer I see real component Storybook stories for CSS/GSAP alternatives.
15. As a developer I can pause and scrub the Hero timeline in dev without shipping debug tooling.
16. As a release reviewer I can inspect actual test revision, browser evidence and measured regressions.

## Implementation Decisions

### Already supported by project architecture

- Native semantic content and CSS Modules own layout, typography, visibility and simple feedback. GSAP owns sophisticated DOM choreography, WebGL owns particles, Three.js only where genuinely needed. Preserve current appearance, themes, assets, and static fallback.
- Leave the working GSAP context ownership in place rather than add @gsap/react without an observed lifecycle failure.
- GSAP matchMedia creates its own Context. Do not wrap redundant context layers around the same animations. Use one lifecycle owner and one motion driver per animated region; do not let CSS and GSAP animate the same property simultaneously.
- A GSAP media query does not measure GPU capability; Full/Lightweight/Reduced/Static remain a separate coherent feature policy. Do not infer low-power devices from viewport width.
- The existing MegaMenu already has a reversible timeline with GSAP 3.15 easeReverse. Do not recreate it. Verify rapid reverse, focus and partial progress before changing its timing or clip-path.
- Prefer real headline span elements and masking over arbitrary SplitText character wrapping. If SplitText improves responsive line behavior, isolate it to H1 with autoSplit/onSplit and a full semantic cleanup.
- For wide CTA Flip, React owns DOM state, focus and input values. Read Flip state before React update, apply from() after commit; use target identification for substituted nodes. Do not manually re-parent nodes. Keep mobile dialog native. Avoid flushSync unless justified by testing.
- GSDevTools with timeline IDs/labels and explicit animation instance belongs only in an optional Storybook debug view. No debug overlay or package loading on the public route.
- Chris Gannon-style SVG experiments belong in isolated asset-specific stories only, not a shared new SVG engine.
- For frequent interactions aim for short, interruptible visual feedback, without making any button wait for an animation. Compare the existing MegaMenu 420ms against a candidate 180-280ms with real visual review. Brand narrative can remain slower than recurring controls. Timings are proposals, not measured results.
- Do not add ScrollTrigger, ScrollSmoother, Observer, Draggable, Physics or unrelated plugins in this effort.

### Decisions pending GrillMe

- Q1: first-frame visual state: A = H1, CTA, navigation visibly and interactively available immediately (RECOMMENDED); B = technically interactive but visually staged. Either choice must preserve usable visibility for focus/AT.
- Q2: WebGL intro scope: A = preserve current geometry and duration while decoupling access (RECOMMENDED); B = retime and restage the scene in this effort.
- Q3: plugin acceptance gate: A = mandate Flip and SplitText in Full; B = only accept when a real comparison proves improvement over CSS (RECOMMENDED).

Do not promote this document or any draft ticket to ready-for-agent until human decisions are recorded.

## Testing Decisions

Highest test seam: actual rendered Hero route with real semantics, interactions, CSS and Canvas. Reuse existing browser tests and Storybook, not a separate demo implementation.

- Test with JS off, WebGL failure, delayed or absent iframe message, and reduced motion switched during intro: H1/CTA/menu visible, focusable and functional before assembly.
- Update older source-matching tests that assert event timing or a 24-second watchdog; verify observable behavior instead. Retain validation of iframe event origin and one CSS/GSAP driver.
- Check React mounting/unmounting, late GSAP import, theme change, viewport resize and 799/800 container transition. No duplicate listeners or lingering inline transforms.
- Test rapid hover or mouse leave, click, Escape and keyboard navigation for the actual menu before proposing timing changes.
- Extend the real HeroAction Storybook story with a stable mounted component: the existing key tied to containerWidth remounts HeroAction and conceals state-preservation bugs.
- Compare CSS and Flip at 800/940/1440, including focus, Escape, repeat-click, invalid/valid domain, response and edit, resize while typing, reduced motion and no-JS.
- Compare two-span H1 with SplitText under delayed font loading, 200% zoom, 320/390/490/Duo/700/800/1024/1440/1920, short landscape. Preserve one accessible H1 and intended muted spans.
- Add development-only GSDevTools play/pause/scrub/seek and 0/25/50/75/100% screenshot review for the named Hero timeline.
- Run typecheck, build, targeted tests, real-browser Chrome/Firefox and Mac/iPhone Safari when available; record measured frame/long-animation-frame/CLS/INP evidence. Do not label emulation real device QA.

## Proposed tickets (not yet published)

| ID | Demoable vertical outcome | Blocked by |
| --- | --- | --- |
| T1 | Content, CTA and navigation available before/without WebGL; update browser contract tests | Q1 and Q2 |
| T2 | Responsive GSAP setup/revert, reduced/resize and coherent CSS/GSAP ownership | T1 |
| T3 | MegaMenu interruption fixes if demonstrated + dev-only named timeline scrubber Storybook | T2 |
| T4 | Desktop CTA CSS vs Flip POC with state/focus tests, select proven version | T2 and Q3 |
| T5 | Two-line H1 existing spans vs SplitText POC, zoom/AT tests, select proven version | T1 and Q3 |
| T6 | End-to-end cross-browser acceptance; evidence and no-deploy review | T3, T4 and T5 |

Once approved, first reconcile these with existing Hero issue #7, CTA issue #12 (already closed), and QA issue #16; do not create competing tickets for already implemented or assigned work. Dependencies should become native issue links only after ticket approval.

## Out of Scope

Rewriting typography, copy, mascot sprite engine, WebGL scene, other designers' concurrent edits, backend and new pages. Scroll animations and long pinned stories. New branches, public deployment and worktree proliferation. New universal motion engine.

## Expert evidence

- Cassie Evans: adaptive GSAP motion and reduced motion via matchMedia, Flip demonstrations. https://frontend.horse/shows/ ; https://frontend.horse/episode/flip-animations-with-gsap/
- Carl Schooff: inspect timelines, labels, use GSDevTools, compare intermediate frames. https://www.creativecodingclub.com/pages/free-lesson ; https://gsap.com/docs/v3/Plugins/GSDevTools/
- Jack Doyle / GSAP: precise reversible tween control, scoped overwrite and change of direction. https://okaydev.co/articles/jack-doyle ; https://gsap.com/docs/v3/GSAP/gsap.to()/
- Chris Gannon: isolate SVG experiments, simplify exported scenes. https://codepen.io/chrisgannon/post/seven-stages-of-svg
- Emil Kowalski: purpose/frequency, responsive interaction, fast easing, interruption, reduced motion and performance. https://emilkowal.ski/ui/great-animations ; https://emilkowal.ski/ui/7-practical-animation-tips
- GSAP technical specifics: matchMedia includes Context and reverts on change; SplitText autoSplit requires onSplit lifecycle. https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ ; https://gsap.com/docs/v3/Plugins/SplitText/


## Concrete implementation plan: exact Ryze changes

**Status:** proposed execution order, not implementation authorization. Prefer defaults pending GrillMe: Q1=A (H1, CTA, nav available immediately), Q2=A (keep 118-piece WebGL scene's duration and art), Q3=B (Flip and SplitText are conditional POCs). No new source-of-truth or second tracker. Existing issue #7 and QA issue #16 are related; issue #12 is already closed. Resolve ownership with these issues before creating new ready-for-agent tasks.

### Dependency diagram

```text
T1: Hero accessible without waiting for Canvas
  ├─> T2: responsive GSAP lifecycle and same-driver ownership
  │      ├─> T3: MegaMenu + Storybook timeline debugger
  │      └─> T4: desktop CTA CSS-vs-Flip with preserved form state
  └─> T5: H1 span-vs-SplitText (can research/POC after T1)
T3 + T4 + T5 -> T6: device matrix, regressions, review
```

### T1. Unblock meaningful Hero before WebGL (P0)

**Files to touch:** src/features/site-shell/HeroWithNavigation.tsx and HeroWithNavigation.module.css, src/motion/hero-entrance.ts; targeted browser test and the existing scripts/hero-reveal-order.test.mjs.

**Specific edits:**
- Remove `introPhase === 'playing'` control of the main and header inert property. Remove CSS rule that makes the *entire* main/header `opacity:0; pointer-events:none` during intro. Do not confuse inert with visual opacity; both restrictions must go.
- Keep `data-intro` for visual decoration only, and validated postMessage handling (`ryze:assembled`, `ryze:intro-complete`), including event.origin / event.source checks.
- Ensure first-frame heading and action have readable default CSS, without GSAP `fromTo(autoAlpha:0)` that races clicks or focus. Move any brand entrance movement to a separate decorative layer or to nonblocking transforms.
- If preserving a watchdog to fade/stop a broken decorative Canvas, it must not gate visitor access. Keep current WebGL code and artistic trajectory unchanged.

**Acceptance:** load with disabled JavaScript, missing iframe, missing assembled event, low-performance delay and reduced-motion toggle. Immediately see, focus and click H1/CTA/navigation. No 24-second wait or invisible focus. Existing two-line typography and safe viewport geometry preserved.

**Verification:** actual browser behavior (not only source regex), keyboard click and pointer test, screenshot before assembled event; rerun `node --test scripts/hero-reveal-order.test.mjs scripts/motion-system.test.mjs`, `npm run typecheck`, `npm run build` after revising obsolete literal test expectations.

### T2. Make one owner for each DOM tween (P1)

**Files to touch:** src/motion/tokens.ts, src/motion/hero-entrance.ts, src/features/site-shell/HeroWithNavigation.tsx, and relevant existing tests. Consider src/features/site-shell/HeroMotionBackground.tsx only when the enhancement-mode contract is coordinated with its owner.

**Specific edits:**
- Add semantic labels `content`, `brand`, `settled` to the existing Hero timeline; preserve existing token registry and named motion slots. No new animation engine.
- Use `gsap.matchMedia()` only to construct GSAP tweens under responsive/reduced-motion conditions. It already manages a GSAP Context. Revert on dismount/media change, cancel async imports, and ensure no CSS keyframe concurrently drives the same element/property.
- Treat Static (no JS), Reduced (skip decorative travel), Lightweight (without costly full-screen WebGL), and Full as a common behavior contract across Hero/Header. SiteHeader's `useNavigationMode` currently considers reduced motion, deviceMemory and hardwareConcurrency, but `HeroMotionBackground` currently checks only reduced motion; reconcile without inferring GPU capability from viewport width.
- Preserve fixed-position Dock's no-transform parent rule and existing iframe message verification.

**Acceptance:** resize 699↔700 and 1199↔1200, change `prefers-reduced-motion` mid-tween, switch Dawn/Dusk, mount/unmount/remount. No duplicate animation owner, leaked ticker, hidden text or incorrect WebGL mode.

### T3. Optimize reversible MegaMenu + debug real timelines (P1)

**Files to touch:** src/features/site-shell/SiteHeader.tsx, SiteHeader.module.css and existing navigation Storybook/tests; optional new debug-only Storybook helper.

**Specific edits:** retain existing `timeline.play()/reverse()` and `easeReverse`; first test 3 rapid pointer interactions and keyboard Escape/Tab during motion. Compare current `MOTION.surface.duration=.42s` versus a candidate ~.18-.28s using screenshots and perceived clarity; alter duration only if justified. No extra GSAP controller when existing one works. Add a dev-only control to pause/scrub/seek the actual Hero timeline (GSDevTools where available, otherwise the native timeline `progress()` API), exposed through Storybook without importing debug UI into the shipped route.

**Acceptance:** rapid direction changes do not leave overlays stuck, keyboard focus remains correct, not more than one menu timeline controls the panel; debug tooling cannot enter the production bundle. Storybook is the actual app component, not a duplicated fake.

### T4. Desktop HeroAction: stable-state CSS vs Flip (P2, conditional)

**Files to touch:** src/features/hero/HeroAction.tsx and HeroAction.module.css, HeroAction.stories.tsx, relevant browser interaction tests.

**Specific edits:** remove `key={containerWidth}` from Storybook: this currently force-remounts HeroAction on resize and conceals state losses. First make the existing CSS state transition and ResizeObserver handle 799↔800 with current domain, validation/error and focus intact. Then compare an optional Flip implementation **on desktop only**: capture `Flip.getState` before React state change, after DOM commit animate a stable shell via `Flip.from`; if React remounts targets, use `data-flip-id` plus targets. Kill/revert interrupted tweens, no direct DOM reparenting, no default `flushSync`. Maintain native mobile dialog and CSS no-JS fallback.

**Acceptance:** 800px+ wide CTA transforms to input/submit; narrower layout uses accessible native dialog; retries preserve value/focus, Escape closes, screen keyboard doesn't clip controls, reduced motion has instant state transitions. Ship Flip only if visually better than CSS without regressions.

### T5. Compare existing H1 spans with SplitText (P3, conditional)

**Files to touch:** src/features/hero/Hero.tsx, src/motion/hero-entrance.ts, Hero heading Storybook story and visual tests. Do not change actual heading copy, nested muted spans, font choice, or approved layout.

**Specific edits:** version A uses the two existing spans and simple reveal. Version B experiments with SplitText `type:'lines'`, `mask:'lines'`, `autoSplit:true` and a returned tween inside `onSplit`; manage revert and accessibility carefully. Never split into characters by default.

**Acceptance:** consistent accessible H1 with late font loading, 200% zoom, narrow landscape, 320/390/490(Duo)/700/1024/1440/1920/2803 widths. Select A by default unless B is clearly and measurably better.

### T6. Cross-browser evidence, no release (P1)

**Files to touch:** pre-existing QA scripts/stories, a bounded review report, and the linked existing GitHub QA issue after approved execution.

**Runs/checks:** `npm run typecheck`; `npm run build`; `node --test scripts/hero-reveal-order.test.mjs scripts/motion-system.test.mjs`; relevant pre-existing browser smoke tests; targeted Storybook interaction tests. Real browser verification on Titan in available Chrome/Firefox/Opera/Yandex; Safari on Mac/iPhone where available, with screenshots tagged by device, browser and tested git SHA. Viewports: 320×568, 390×844, Duo 490×1091/951×669, breakpoint 699/700 and 799/800, 874×402 landscape, 1440×900, 1897×1024, 1920×1080, 2803×1024; 200% zoom and reduced/static/lightweight/full modes.

**Acceptance:** no regression in actual CTA and menu interaction, body overflow, focus, reduced motion, typography, or static fallback. Compare visual frames 0/25/50/75/100% in private Storybook; measure frame drops/Long Animation Frames and layout changes before claiming an optimization. Never call a source-code regex check alone proof of behavior.

### Engineering process and safe integration

- Do not checkout/pull/stash/rebase or blanket `git add -A` in a dirty shared worktree. Re-check `main`, `origin/main`, worktrees and specific changed paths immediately before edits. Preserve other agents' untracked assets and tests.
- One existing canonical `main` with tiny path-scoped commits, or review-isolated changes only when branch policy explicitly allows it. No parallel variants promoted to new SoT. No force-push.
- Proposed approval checkpoints: (1) T1 actual accessible first frame; (2) T2/T3 lifecycle and navigation; (3) CSS vs Flip and H1 variants; (4) full QA and two-axis review.
- Trace work in the existing GitHub Issues according to docs/agents/issue-tracker.md once the plan is approved; do not invent a new Asana implementation backlog. Report technical findings to the existing Asana Ryze handoff task only as a mirror.
- No public deployment, changes to CI/repository visibility or other artists' 3D scene without explicit approval.

### Primary documentation

Timeline labels: https://gsap.com/docs/v3/GSAP/Timeline/ 
React cleanup: https://gsap.com/resources/React 
matchMedia: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ 
Flip: https://gsap.com/docs/v3/Plugins/Flip/ 
SplitText: https://gsap.com/docs/v3/Plugins/SplitText/ 
Storybook interaction tests: https://storybook.js.org/docs/writing-tests/interaction-testing 
Playwright reduced-motion emulation: https://playwright.dev/docs/emulation 
Playwright screenshot baselines: https://playwright.dev/docs/test-snapshots 
