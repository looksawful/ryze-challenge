# RYZE Challenge · Контракты финальной сборки · Grill, 2026-11-17

Состояние: **DRAFT / SELECTIVE ACCEPTANCE THROUGH R8**. Новые ответы от 17.11.2026: 24 из 39 пунктов получены, включая неполные/неоднозначные. Только явно определённые части отмечены ACCEPTED; все остальные OPEN. Не считать рекомендации утверждёнными. Код приложения не менялся. Этот документ хранит подтвержденные решения и открытые вопросы. Запрещено принимать предложенный ответ за согласованный до ответа пользователя.

Источники: сегодняшнее обсуждение пользователя, девять локальных PNG в `A:\Users\awful\Downloads\Hero\new\with pet\Hero`, текущая приватная dev после PR #81, Storybook. Выводы из кода помечаются AS-IS и не приравниваются к контракту.

## Подтвержденные решения (MUST)

- Hero использует CSS Grid там, где это позволяет композиция, без насильственной универсальной сетки.
- На mobile, mobile landscape, tablet, Duo Closed, Duo Open, desktop и ultra-wide **весь контент Hero целиком виден в пределах первого доступного viewport**: Brand, H1, lead, description, Rizzie, IntegrationLogos + подпись, HeroAction. Никаких спрятанных обязательных блоков.
- У Hero нет внутренней прокрутки; нельзя обрезать обязательный контент или допускать пересечения.
- Адаптивность зависит от ширины, высоты, ориентации, соотношения сторон, safe-area; эталоны Figma: 402×874, 874×402, 466×678, 951×669, 918×874, 1024×1366, 1440×1024, 1897×1024, 2803×1024, плюс дополнительные Storybook viewport и промежуточные размеры.
- Меню закреплено **сверху** и не сдвигается по вертикали. Не меняет положение Hero в потоке при скролле.
- На desktop меню находится **по центру сверху, собственной компактной ширины**, не заполняет ширину окна. При прокрутке вниз сужается, оставаясь на той же Y-координате.
- Ранее согласованные визуал и тексты не меняются без отдельного разрешения. Поздние решения имеют приоритет над старыми экспортами PNG.
- До отдельной команды не исправлять Dock. Нельзя путать «контракт записан» и «уже реализовано».
- Состояние и альтернативы каждого компонента должны быть доступны в Storybook; примеры Storybook — реальные компоненты, не новые независимые дизайны.
- Приватный репозиторий; без публичного деплоя. `prod` отдельно от `dev`.

## RAUND 1 — ACCEPTED 17.11.2026 (со слов пользователя)

1. **Fit и доступность:** при эталонном масштабе весь Hero без прокрутки. При увеличении текста до 200%, увеличении масштаба браузера или физически слишком низкой высоте допустима прокрутка **документа**, но не вложенный scroll-container Hero; клиппинг запрещён. Пользователь подтвердил вариант A («1ок»).
2. **Cookies только в desktop-прототипе:** в текущем **прототипе** показывать Cookies только на desktop. На mobile, mobile landscape, Duo и tablet прототипный Cookie UI не показывать. Это НЕ контракт отключать consent на production; продакшн-правила согласуются отдельно. Пользователь: «2 в прототипе добавляй только в десктопе».
3. **Минимумы:** H1 **32px**, lead **16px**, description **14px**, кликабельная область CTA **44px**, видимая высота Rizzie **110px**. Эти значения являются нижними пределами, а не целевыми размерами; пользователь подтвердил («3 пойдет»). При недостатке места сначала grid reflow/уплотнение отступов, затем постепенное изменение размеров до этих пределов; нет скрытия контента.
4. **Приоритет поздних согласований:** вариант A, сохранять явно утверждённые поздние решения и максимально приближать геометрию остальных элементов к Figma **только после согласования конкретных конфликтов**; без самовольной замены композиций. Пользователь: «4 а по согласованию».

## RAUND 2 — ACCEPTED PARTIALLY 17.11.2026 (Navigation)

1. **Desktop centered menu: ACCEPTED 1A.** В исходном состоянии собственная ширина верхнего меню **944 px**, при прокрутке вниз сужается до **720 px**. Горизонтальный центр неизменен, `position: fixed`, координата Y не изменяется; не расползается на всю ширину окна, не вызывает layout shift. Возврат к полной ширине при прокрутке вверх. Точные высоты, анимация и отступ сверху отдельно при проверке.
2. **Mobile Dock 2.1C: ACCEPTED (уточнение пользователя 17.11).** Сохраняем всё ранее запланированное **кроме кнопки `Start` в Dock**; `Start` переносится в **глобальное мобильное меню, открываемое hamburger**. Существующие остальные назначения Dock сохраняются (Ads / SEO / AI / CRO / Pricing), текстовое представление без иконок согласовано прежней задачей. Не заменять `Start` автоматически на Book/Book a call. Конкретная подпись пункта после переноса и URL остаются OPEN до отдельного подтверждения; после удаления Start количество пунктов Dock предполагается четыре, а не пять. Исполнение Dock на время Grill запрещено.
3. **Tablet navigation: ACCEPTED 3B.** Планшеты имеют **отдельную композицию меню**, а не просто мобильный Dock до 1023px или сжатую десктопную навигацию. Конкретные брейкпоинты/состав tablet-композиции и поведение Duo требуют отдельной проверки на Figma; ширина устройства сама по себе не отменяет договорённость.
4. **Mobile expanded navigation: ACCEPTED 4B.** Правая выдвижная панель, как в текущем прототипе, со встроенной **горизонтальной лентой продуктов**. Нативный диалог, модальное поведение, закрытие через Escape/backdrop/кнопку, блокировка фоновой прокрутки и доступность сохраняются.
5. **Product cards: ACCEPTED 5B, с уточнением пользователя.** В **десктопном** меню уже имеющаяся сетка **2×2** из четырёх продуктовых карточек сохраняется, она устраивает пользователя, **не переделывать**. В **мобильном раскрытом меню** те же по назначению «другие продукты» оформляются в **горизонтально прокручиваемую ленту**. Не разрабатывать с нуля: в `D:\inwork\awful-homework\src\design\ryze-home\RyzeProductShelf.tsx` найден готовый `RyzeCatalogShelf` с `AppleProductShelf` и четырьмя мокапами (AI Marketer, MCP, Muse, SEO), а в текущем `src/features/site-shell/SiteHeader.tsx` есть четыре карточки `FeaturedProducts` (Paid Ads, SEO & AI Visibility, CRO, Reporting). Это **два разных набора** и их соответствие ещё требуется сверить: нельзя молча заменить одни продукты другими. Визуальная и функциональная проверка ассетов обязательна.
6. **Общее:** меню остаётся fixed сверху и не сдвигается по Y; изменение ширины desktop не сдвигает Hero. Документ фиксирует цели, не утверждает их текущей реализацией.

**Открыто после R2:** точная последовательность/подписи мобильного Dock (2C), точная tablet-композиция и соответствие четырёх макетов карточкам. Эти детали надо получить до правок соответствующих компонентов.

## RAUND 3 — ACCEPTED 17.11.2026 (Typography, colors, surfaces, interaction states)

1. **1A Fonts:** сохранить существующий визуальный язык шрифтов: Hero / контент — Segoe UI (system-ui fallback), навигация — Satoshi (400/500/700). Унифицировать роли, размеры и веса без смены утверждённой внешности. Никакой полной миграции на Satoshi.
2. **2A Palette:** сохранить существующие Dusk / Dawn и `#030303`, `#FF5AF1`. Остальные цвета привести к семантическим токенам и проверить WCAG AA (обычный текст >=4.5:1, крупный >=3:1). Без нового редизайна.
3. **3A Surfaces, с оговоркой:** три смысловых уровня: page background, elevated surface, dropdown/overlay. При нормализации токенов и контрастов **сохранить существующие вид, характер, материалы, скругления и визуальный вкус**; не заменять дизайн на однотипные flat-карточки.
4. **4A/B Hybrid Hover:** там, где ещё нет hover/focus/active, добавить деликатную реакцию A (цвет, фон, рамка, акцент; видимый keyboard focus без layout shift). Там, где уже есть собственные анимации/GSAP/scale или иной B, **сохранить текущее поведение**, исправляя только реальные баги и доступность, без унификации в одно скучное состояние. Reduced Motion выключает несущественное движение.
5. **5A Sizes, с корректировкой:** функциональные размеры кнопок по ролям; допускается **небольшое уменьшение всех кнопок**, но hit target не ниже **44px** (RAUND 1). Главную Hero CTA уменьшить примерно **на 5%** относительно текущих размеров (ширину/высоту в допустимых границах, пропорции сохранить); минимум 44px остаётся неприкосновенным. Остальные проценты не утверждены; нельзя уменьшать до нечитаемости или ломать макет/CTA fit.

**Acceptance:** визуально близко утверждённому дизайну, контрактные цвета/шрифты; hover и focus работают на всех интерактивах; 200% zoom не обрезает контент; CTA не менее 44px и ~5% компактнее; нет layout shift от состояний. Изменения компонентов в этой Grill-сессии не выполняются.

## RAUND 4 — OPEN (HeroAction, domain entry, chat interface)

Согласовать вопросы, не меняя уже утверждённой логики: название главной CTA, роль отдельного чат-интерфейса, внешний вид результатов и drawer.

## Следующие раунды, все 29 пользовательских пунктов

- R1 Hero, устройства, scroll (3, 5, 6, 13, 25; также общие контракты)
- R2 Desktop/Mobile/Tablet Navigation, Dock, меню, ссылки и продуктовые ленты (4, 7, 14–18, 23, 27)
- R3 Typography, цвета, поверхности, контрасты и интерактивные состояния (5, 11, 19–22, 25)
- R4 CTA, ввод домена, чат, размеры, состояния (13, 22, 23, 29)
- R5 Rizzie, IntegrationLogos, Motion modes, Brand/GSAP/H1, изображения и спираль (6, 8–10, 12, 24–26)
- R6 Секции лендинга, клиентская лента, медиа, мокапы, анимации (9, 10, 27–29)
- R7 QA-матрица, Storybook coverage и скролл/меню/типографика/маскот (3–6)
- R8 Приватный Git ship, новая чистая локалка, архивирование/удаление worktree только после проверки уникальных изменений, release/acceptance (1–2)

После согласования каждого решения: заменить OPEN на ACCEPTED с датой и конкретными критериями приемки; затем аудит текущего сайта against contracts. Никаких правок приложения в рамках Grill.

## Implementation ledger — 17.11.2026, approved contracts only

Source branch: fix/approved-hero-nav-contracts-20261117, base origin/dev at ec11205. Production and public deployment unchanged.

- R1: Hero CSS Grid and height-aware composition; 100svh at reference scale; 19 of 19 screen sizes (320×568 to 2803×1024, both Duo) pass browser checks: no page/inner scroll, no missing/outside Hero components, no nav/cookie overlap, no horizontal overflow. For extreme accessibility zoom/height, document overflow is allowed rather than clipping.
- R1: menus fixed top, no Y-scroll motion. Desktop centred 944px full to 720px compact with stable 12px top; mobile 10px top. No bottom→top relocation or hide-on-scroll.
- R1: Cookie UI desktop prototype only (viewport >=1200px); on short wide screens repositioned to avoid overlap. This is not the production consent rule.
- R1: min H1 32px, lead 16px, description 14px, CTA 44px, Rizzie >=110px at tested reference viewports.
- R2 implemented: desktop 2×2 cards unchanged, expanded mobile right drawer includes horizontally scrollable shelf with same four verified current cards and links; open/scroll/Escape checked on Chrome 402×874 and 951×669. Mobile top Dock names/icons remain unchanged because 2C still open. Specific separate tablet menu design and Duo composition pending approval.
- R3 implemented: Hero CTA ~5% smaller preserving 44px min; semantic Hero Dusk/Dawn color variables with distinct contrast; subtle hover/focus, existing animation/GSAP untouched; existing Segoe UI/Satoshi retained.
- QA: npm run build PASS; npm test PASS 46/46; git diff --check PASS; Chromium 19/19 viewports PASS; mobile shelf browser interaction PASS.
- Limits: default closed UI geometry only; not full physical Safari, zoom/200%, animation or all expanded states. More manual acceptance needed.
- OPEN: exact Dock labels/links; tablet nav layout; relationship between old AI Marketer/MCP/Muse/SEO product shelf and current Paid Ads/SEO/CRO/Reporting; rounds 4–8. No speculative change of unapproved details.

- Cookie overlay correction: desktop prototype notice is now a separate fixed full-screen pointer-transparent layer (z-index 110), with interactive notice bottom-right (16px from right/bottom + safe area). Removed the former viewport-centred and bottom-centred rules. Integrations on affected desktop layouts use a separate row so they remain uncovered. Browser geometry PASS 19/19 viewports and source tests PASS 47/47. Mobile/tablet prototype still hides Cookie notice.

## Express mode / single trunk · 17.11.2026
- Approved latest visual is the current Hero/Navigation build (PR #82 merged into private `dev`), not any older `prod` variant.
- Fixed CTA hover: Dusk variable `--hero-action-background` no longer self-references; normal and hover background now use one valid semantic token and retain foreground contrast.
- WebGL integration morph + caption grouped in a compact flex row with a bounded 70–90px animated visual and 4–8px gap; static logo grid remains unchanged.
- CI workflow removed per user request; local quality gate is only `npm run build` plus `npm run typecheck`. No public deployment.
- Migration intent: one active `main` branch locally and on private GitHub; archive old branch histories before cleanup; do not discard dirty parallel worktrees without saving their changes.
