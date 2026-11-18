# RYZE — аудит кнопок и CTA (18.11.2026)

Статус: research-only, код не изменён. Проверено в приватном репозитории looksawful/ryze-challenge, локально D:\inwork\ryze-challenge (Titan), ветка main, HEAD 93f823b (18.11.2026 02:34 +0300). Рабочее дерево имело посторонние незакоммиченные изменения; они не трогались.

## Charter
- Цель: проверяемая спецификация улучшения кнопок Ryze, CTA, GSAP-отклика и конверсии без смены утверждённой композиции.
- Scope / Object / Subject: коммерческий SaaS UX и доступность / кнопки лендинга Ryze / HeroAction, ui/Button, SiteHeader, consent, Storybook, GSAP intro.
- Тип: descriptive; проект известен, требуется точный план исправлений.
- Вопросы: (Q1) верно ли сообщает CTA о результате; (Q2) где отсутствуют состояния и единые токены; (Q3) какие движения уместны; (Q4) какие доступность и адаптивность нарушаются; (Q5) как измерить изменения.
- Методы: прямое чтение кода на Titan, проверка сохранённых рендеров desktop/mobile/landscape/reduced, существующий локальный Chrome Playwright timeline; внешние первоисточники GSAP, W3C WCAG, Shopify. Live hover/touch browser-tests непосредственно в этом аудите НЕ запускались.

## Canonical sources
1. Первичный код и материалы конкретной версии: src/ui/Button.tsx, src/ui/Button.module.css, src/ui/Button.stories.tsx; src/features/hero/{Hero.tsx,Hero.module.css,HeroAction.tsx,HeroAction.module.css}; src/features/site-shell/{HeroWithNavigation.tsx,HeroWithNavigation.module.css,SiteHeader.tsx,SiteHeader.module.css,link-model.ts}; src/features/consent/HomeworkCookieNotice.tsx; src/motion/tokens.ts (untracked на момент проверки). [R3]
2. Замер браузера: docs/reports/hero-element-timeline-2026-11-18.md и docs/notes/hero-element-timing-probe.json; Chrome Playwright Titan 1440×900, один прогон. [R3]
3. Визуальные снимки: docs/notes/motion2-desktop-final.png, motion2-mobile-final.png, motion2-landscape-final.png, motion2-reduced-final.png. Это снимки финальных кадров, не доказательство работы hover/focus. [R3]
4. Официальный GSAP: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ ; https://gsap.com/docs/v3/GSAP/gsap.quickTo()/ ; https://gsap.com/resources/a11y/ . [R1]
5. W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/ , SC 2.4.7/2.4.11, 2.5.8, 2.3.3, 1.4.11. [R2]
6. Shopify CTA practitioner guide (17 July 2026): https://www.shopify.com/blog/call-to-action-button-examples . [R1] Pattern, not a guarantee of conversion gains.
7. Better Design UI/UX principles and comprehension tool, executed 18.11.2026. Automated copy heuristic: 3 serious findings; NOT real user timing.
8. SOFA post 'HERESY-015' on focused native disabled button: https://agents.stackoverflow.com/ ; limited Chromium fixture, trust status not_enough_evidence. Secondary supporting caution, not proof in Ryze. [R4]

## Findings ledger
| ID | Observation | Evidence / scope | Priority |
|---|---|---|---|
| F01 | Hero CTA 'Start For Free' opens local domain-entry demo rather than free account creation; domain submission produces a 900 ms simulated result and acknowledges no real store analysis. | HeroAction.tsx (lines ~149-219, 229); direct code [R3] | P0 |
| F02 | Intro sets Hero and navigation inert/opacity:0 until canvas ends; existing Chrome measurement reveals CTA only ~6.78–7.46 s after DOMContentLoaded; watchdog 24 s. | HeroWithNavigation.tsx, HeroWithNavigation.module.css, hero-element-timeline report (single 1440×900 run) [R3] | P0 |
| F03 | Shared Button component defines primary/secondary and regular/compact only; no explicit focus-visible/active/loading in its own CSS. Compact size lacks min-block-size. | src/ui/Button.tsx/.module.css [R3] | P1 |
| F04 | Main CTA itself DOES have an explicit :focus-visible outline and 76px/86px height, falling to 50px in landscape; avoid regression and preserve effective mobile size. | Hero.module.css and screenshots [R3] | retain |
| F05 | HeroAction 'Continue' becomes 'Preparing…' with disabled=true during pending; can resize label and lose keyboard focus in some browsers. Exact effect not tested live here. | HeroAction.tsx ~204 [R3]; SOFA bounded Chromium observation [R4] | P1 |
| F06 | HeroAction close control is 34x34 CSS px, drawer close 42x42 px; button Compact lacks a minimum height. | HeroAction.module.css lines ~71-85, 145-157; Button.module.css [R3] | P1 |
| F07 | Header booking CTA uses 'Book a call' and cal.com /hello/partner-program; Main Hero CTA uses a different demo. Header Shopify Start anchor https://reports.get-ryze.ai/o/all. They represent different funnels. | SiteHeader.tsx, link-model.ts [R3] | P1 |
| F08 | Consent button visual hierarchy differs: Accept all full-width pale white in observed desktop screenshot; Reject all dark/compact. Consent should not be confused with sales CTA; test choice equivalence and contrast. | Screenshot motion2-desktop-final.png; HomeworkCookieNotice code [R3] | P1 |
| F09 | Storybook Button has only Playground, missing systematic state stories across variants, no-JS, reduced, keyboard and touch. | src/ui/Button.stories.tsx [R3] | P2 |
| F10 | Current local src/motion/tokens.ts already defines control 0.18s power2.out, surface 0.42s, enter 0.58s; make controls follow these instead of another clock. | src/motion/tokens.ts local untracked [R3] | P2 |
| F11 | Better Design copy checker flags four actions across the sampled journey and ambiguous 'Continue', heuristic estimated explain time ~23s; this is NOT measured visitor time. | Better Design check_comprehension, 18.11.2026 [tool] | P1 |

## Scope filter
- 44x44 CSS px is a practical project design target for touch; WCAG 2.2 AA 2.5.8 has a 24x24 CSS px minimum with exceptions. Do not mislabel 44 as AA.
- Motion aesthetics are recommendations, not experimentally proved conversion lifts. Do not claim uplift.
- Not all button-like surfaces should be the same: primary CTA, navigation, form, cookie consent, close control have distinct hierarchy.

## Object filter
- Do not apply shared Button CSS claims to Hero summary; it already has :focus-visible and a large hit area.
- Do not promise AI analysis or trial when only demo is implemented.
- Timing ~6.8–7.5s comes from one measured Chrome desktop run; mobile and slow devices may differ and require capture.
- Header links can be genuine destinations while HeroAction demo stays local; preserve distinct semantics.
- The visual render is not an interactive audit. Hover, focus, iOS touch, keyboard and throttled loading still require acceptance tests.

## Conclusions / design specification
### P0: Fix promise and access to action
1. Preserve the existing large, high-contrast rounded 'Start For Free' visual, including accessible outline. With current demo, use copy that predicts the next action: e.g. 'Try the demo' or 'Preview Ryze'; an actual signup CTA 'Start free' only after it leads to real free onboarding. Do not change offer facts.
2. Prefer native <button type="button"> in JS-enhanced state; retain separate native <details>/<summary> as no-JS fallback. Verify duplicate targets do not appear.
3. Decouple availability from cinematic assembly: make at least a static usable Hero/CTA available immediately; if preserving cinematic intro, defer/decorate it, never trap the action for ~7s. Do not remove approved motion without design review.
4. Avoid labels such as 'Analyze my store' when the system returns only a simulated example. For current demo form, 'Show example' is accurate. Actual analysis later can use 'Analyze my store'.

### P1: One state contract
- All interactive controls: resting, hover, :focus-visible, pressed, busy, success/failure, unavailable. Semantic functional states in native attributes, not GSAP-only.
- Shared CSS primary, secondary, utility/destructive/quiet variants by semantic tokens. Do NOT simply repaint all controls the same.
- Control heights: primary Hero current 76px mobile/86px desktop preserved (50px landscape); other medium 48-52px; icon and compact hit areas >=44px project target, with adequate spacing and visual density.
- Disabled/async: reserve label width; leave focus stable when possible, block duplicate commands in JS and expose aria-busy/status; restore logical focus when close/dialog changes. Native disabled is still valid when truly unavailable.
- Respect pointer coarse/fine, keyboard and reduced-motion; no hover-only informative labels.
- Consent: no promotional animations; same access to accept and reject; keyboard order and focus visible.

### P1: Commercial labels
- Current 'Start For Free' -> 'Try the demo' for demo-only prototype, OR 'Start free' if signup implemented.
- Current 'Continue' -> 'Show example' for simulated domain response.
- Current 'Preview experience' -> remove until actual usable preview exists, OR point to real preview with accurate label.
- 'Book a call' can remain if booking page is genuine and purpose is clear. Header 'Start' destination must be checked end-to-end, not assumed to match Hero's demo.
- Test copy and position against signup/demo-complete, not click-through alone. Instrument cta_view, cta_click, domain_submit, demo_complete, actual_signup_complete by mode and device.

### P2: Motion: selective GSAP, CSS default
- CSS 150-200ms ease-out background/border/color for ordinary hover; ~100ms press scale .98-.99 on inner surface only, never resize/layout shift; 180ms control token from existing motion score. Reduced keeps color/focus and removes travel.
- If desired, one signature primary CTA fill wipe or inner label/arrow movement limited 4-6px, play/reverse on single GSAP timeline, guard interruption and focus styles. Do not use magnetic chasing on every button. GSAP quickTo only for optional desktop fine-pointer motion within 4-6px; transforms affect visual rather than hitbox and remain user-friendly.
- gsap.matchMedia to mount only relevant GSAP effects; cleanup listeners and reversals on unmount/resizes. Do not animate width/height/top/left, avoid racing hover/focus and CSS/GSAP ownership of same transform.
- Storybook: full matrix of states (primary, secondary, icon, compact, loading, disabled, focus-visible, keyboard, touch), Full/Lightweight/Reduced/Static, 320/390/874 landscape/900 Duo/1440/1920 and browser actual screenshots.

## Acceptance criteria
- CTA and nav accessible without waiting for ~7-second intro; measure DOM-ready -> CTA actionable across target viewports and slow machines.
- One truthful primary destination; the label matches resulting screen for every CTA.
- Keyboard-only Tab -> focus-visible -> Enter/Space works and focus does not vanish around 900 ms pending.
- No clipping, overflow, or loss of label in hover/focus/pressed; widths stable, buttons >=44px touch targets by design.
- Reduced Motion maintains same actions, labels, and outcomes with minimal movement.
- Button Storybook contains state and mode coverage; passed after visual + browser checks on target devices.
- No code changes were made during this research; implementation and tests remain open.

## Next steps / Risks
1. Agree on whether Hero leads to a real trial, onboarding, or demo, before changing copy.
2. Make P0 changes only after explicit implementation request; otherwise preserve code and approved visual.
3. Test true keyboard/touch behavior, actual mobile/landscape layout and real conversion events.
4. Local working tree already contains modifications from other agents. Avoid merging/staging unrelated work.


## Implementation pass · 18.11.2026
Scope: shared Button and its Storybook story only. CSS of Hero, header and consent is actively changed by parallel executors and deliberately not staged. Source of truth for controls remains src/ui/Button.module.css and theme tokens in src/app/foundation.css; no duplicate theme package or Git branch was created.

Changes:
- Retained the pre-existing concurrent compact-height fix (2.75rem = 44px) and regular control size in rem.
- CSS-only color change in 180ms, visual press scale 0.985 without layout-size mutations, hover restricted to fine hover pointers, reduced-motion fallback.
- Keyboard focus remains visible through global foundation.css :focus-visible; no decorative borders, shadows, or gradient.
- Storybook States gallery now displays primary controls on the actual light form-colored slab, secondary controls on dark, with disabled/busy and long labels.

Verification:
- node --test scripts/button-css-contract.test.mjs: 6/6 PASS (RED first, then GREEN).
- npm run typecheck: PASS.
- npm test: 47/47 PASS.
- npm run build: PASS.
- scripts/button-browser-qa.mjs: Chrome 11 viewport/mode configurations PASS, Yandex 11 PASS; assertions include viewport widths 320, 390, 700, 874 landscape, 900 Duo, 1200, 1440, 1920; no overflow or clipped labels; hit-target >=44px; reduced motion duration 0; hover rgb(8,8,8)->rgb(41,41,41); press scale=0.985. Evidence: docs/notes/button-browser-qa.json and button-browser-qa-yandex.json.
- Lilith macOS via Tailscale: Safari 1440-class site + Storybook visually rendered; Chrome Storybook and reduced-motion screenshots captured. Screenshots live on Lilith /tmp/ryze-qa-*.png, not committed; no claims about macOS full browser automation.
- Opera CDP test FAIL (no page exposed by headless launch), Firefox screenshot CLI did not create image. Treat as unverified, not passes. iOS real-device test not executed.
- Chrome headless screenshot at width 390 cropped composition due browser window-viewport mismatch. DOM matrix uses explicit device metrics, but tests of homepage at width 390 were not completed. Avoid interpreting screenshot as proven responsive issue.

Outstanding and not in this scoped patch:
- Main Start For Free CTA is a <summary> under Hero.module.css, not the shared Button. It remains unaltered.
- HeroAction close targets 34px and 42px; possible screen issues need follow-up without overwriting parallel changes.
- Hero intro accessibility/latency and marketing copy mapping need separate approval/owner.
- Full interactive GUI QA for Opera/Firefox/Safari/mobile phone, Mac at all breakpoints remains open.

Source references: GSAP matchMedia https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ ; Google Chrome CSS responsive guide https://developer.chrome.com/docs/modern-web-guidance/guides/css/responsive-design ; Yandex button semantics https://yandex.com/dev/id/doc/ru/codes/buttons-design ; WCAG 2.2 https://www.w3.org/TR/WCAG22/ .
