# Ryze · CSS changes by breakpoint, viewport and theme · 2026-11-18

Source: Titan `D:\inwork\ryze-challenge`, Git private `main` `f73df05` = `origin/main`. Comparison baseline `93f823b`; committed changes `59de061`, `45cad15`, `9a1546a`, `92bf44c`, `cee3ea0`; PR #83 `fix/css-polish-20261118` remains separate. No code changes performed while authoring this report.

## Critical theme distinction

- Live page `src/app/page.tsx` hardcodes `data-theme="dusk"`. Dawn has token styles and component support but is not exposed as the public home-page theme.
- Dusk: background #030303; foreground #F7F7F7; H1 muted #999BA4; Hero description #777A83; Hero CTA #D9D9D9 on #050505; nav background #292929 and foreground white; integrations caption #C3C3C3.
- Dawn: background white; foreground #111; H1 muted #53545C; description #484952; Hero CTA #222228 on white; nav background white and foreground #19191C; caption #4D4D4D.
- Accent #FF5AF1 in both. None of the recent geometry/animation commits adds a new palette.
- Shared `Button.module.css` colors are fixed, NOT theme-switched; HeroAction form and drawer also retain fixed grays/dark colors. Rizzie bubble and Homework Cookies inherit page theme tokens.

## Breakpoint/device CSS contract (CSS viewport, not physical device)

| CSS viewport condition | Concrete resulting sizes and changes (in both themes unless noted) |
|---|---|
| width <360, e.g. 320x568 | Hero short-height override H1 34px, lead 16px, description 16px (was 14px); Hero may grow vertically rather than clip. On other heights, mobile H1 clamp(39px,12.3vw,50px). Dock labels at least 13px (was as low as 10px), columns intrinsic; integrations caption ≥13px. HeroAction drawer stacks field and submit at <=420px. |
| 360–419, e.g. 390x844 | H1 ~47.97px, lead 18px, description 16px. Dock labels 13–14px, compact Button min 44px; integration caption 13–14px and safer wrap. On <650px height use short-height layout instead. |
| 420–699 portrait, e.g. 430x932/466x678/490x480 | H1 max 50px normally; 16px description. Height <=720 has existing tighter Hero rhythm, height <=650 newly auto document height/reserved mascot poster. Existing Duo Closed 440–510px nav width override persists in main and is removed ONLY in PR #83. |
| 700–829 landscape height <=500 | H1 34–42px, lead 16px, description 16px (was 15px in compact landscape). New Rizzie text clearance applies to H1/lead/description via clamp(0,830px - 100vw,130px); Hero height auto. |
| 830–899 landscape height <=500, e.g. 874x402 | H1 clamp(34px,4.5vw,42px) ~39px at 874; description 16px; auto height; no special <=829 Rizzie clearance. |
| 900–1023 landscape, e.g. 951x669 Duo Open | Existing bespoke asymmetric composition remains; when aspect >=4:3, height >=600, H1 clamp(39px,5vw,52px) (~47.55px at 951), lead 18px, description 16px; navigation pane positions preserved. |
| 1024–1199 tall, e.g. 1024x1366 | If aspect <=5/4 and height >=608: H1 clamp(56px,5.3vw,72px)=56px at 1024; lead 20px; description 18px. Desktop Hero layout active from 1024; mobile/nav Dock continues until 1200. |
| 1024–1199 wide, e.g. 1024x768 | H1 72px, lead 22px, description 18px under 5:4+ and >=608 high. |
| >=1024 and height <=607 | H1 clamp(40px,4.4vw,58px); lead 16px; description 16px (was 14px); auto-height and document scrolling, not clipping. |
| >=1200 and <2400 desktop wide, e.g. 1440x900,1920x1080 | H1 clamp(72px,6.667vw,108px): 96px at 1440, 108px at 1920. Lead 22px; description 18px; Hero CTA type 16px; desktop navigation starts at 1200. Notebook nav special geometry also applies at 1200–1999 and viewport height 640–1000; this special query predates the CSS polish. |
| >=2400, e.g. 2400x1350 | H1 clamp(100px,5.7vw,160px), 136.8px at 2400; lead 22px; description 18px; CTA type 16px; HeroAction inline result relocates left of the form. Existing duplicate >=2400 layout rules and logo positioning are separate unresolved review. |
| any width, height <=350 | Existing Hero rule allows auto height and visible overflow; document can scroll. |
| integrations visual container <210px | Existing fallback grid goes 5 columns → 3 columns; caption now wraps within constrained track. |
| all widths, reduced motion | GSAP introduction disabled; CSS/GSAP exclusivity and static paths preserve readable content. CSS button transitions disabled; Rizzie static poster supported. |

## Changed component ledger

1. Typography: `ui/Typography.module.css` generic H1 clamp fallback px→rem (2–3rem); lead 21px→1.3125rem; paragraph 22px→1rem. Actual Hero overrides heading and lead sizes for device art direction. Fonts Karrik and Micro Grotesk already approved.
2. Hero: compact description 14/15→16px and auto growth for mobile <=650 high, 700–1023 landscape <=500 high and desktop >=1024 <=607 high; specific Rizzie and Duo clearance / containment; no new color palette.
3. Header: Dock labels previously as low as 10px→13–14px, 4 `max-content`-aware columns and x-scroll for zoom; menu GSAP/CSS exclusivity, transitions from tokens. `PR #83` (NOT in main): mobile width min(480px,100%-84px)→100%-84px, remove 440–510 Duo special cap; tablet 700–1199 Dock and hamburger 58→65px.
4. Integrations: caption 12–14px→13–14px; line-height 1.3→1.35; caption grid track capped at 50%, `overflow-wrap:anywhere`; 5-logo static/WebGL progressive modes unchanged.
5. Shared Button: regular min 100x50px, 15px type; compact min 44px and 14px type, 500 weight; added hover, active (scale .985), disabled, busy and reduced-motion states in `cee3ea0`; no new borders/shadows or new theme variants. CSS primary fixed dark (#080808; hover #292929; pressed #202020), secondary #35353b (hover #45454b; pressed #2a2a30) in both themes.
6. HeroAction: distinct from shared Button; no changes to main CTA palette; removed demo disclaimer; inline motion becomes 420ms subtle rise/scale instead of scaleX, example 220ms, response 420ms; narrow drawer stacks at <=420px; inline results at >=2400 positioned left. Dawn-specific HeroAction form/drawer surfaces NOT implemented; hard-coded colors are unchanged.
7. Rizzie: one fluid `--rizzie-art-size` using rem+vw capped by svh, same dimensions for poster/sprite/click target, aspect 12:13; eliminated old breakpoint-specific size jumps. Bubble no longer has decorative shadow, uses `--color-background` / `--color-foreground` from theme; <700px bubble width clamp(8rem,42vw,10.25rem); no new color palette.
8. Hero stage GSAP: brand/H1 t0; lead .22s; description/Rizzie .44s; CTA/logos .66s; navigation .9s; desktop Cookies 1.14s, relative to `ryze:assembled`. Prevent GSAP and CSS animating same targets simultaneously; 24s watchdog remains.
9. Desktop Cookies overlay: page-only Dusk, visible at >=1200 viewport width, pinned bottom-right. Fixed placement unchanged; CSS fallback entry disabled when GSAP owns animation. Cookie content CSS itself retains color token variables and earlier tablet/mobile media, but its live page wrapper hides it below 1200.

## Verification boundary
- This is a CSS contract/diff inspection, NOT proof that every theme, width, physical device and browser passed real UI tests. Existing reports have sampled Chrome and Safari viewport cases, but the live home page is Dusk. Dawn fully integrated QA outstanding.
- Current `main`/origin main SHA verified at authoring; only Git untracked media and research documents remained. No commit/PR or deploy executed.
