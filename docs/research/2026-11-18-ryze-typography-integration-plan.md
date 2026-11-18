# Ryze · внедрение практик Richard Rutter и Oliver Schöndorfer

**Дата:** 2026-11-18  
**Статус:** предложение на согласование; реализация, браузерные прогоны и деплой не выполнялись  
**Репозиторий:** приватный `looksawful/ryze-challenge`, только существующий `main`  
**Применение:** текущий первый экран / Storybook. Сохранить утверждённый визуал, текст, темы, motion и специфические адаптивные композиции.

## Зачем

Вместо нового шрифта или большой дизайн-системы нужна управляемая типографика:
- один источник семантики типографики для реализации и Storybook;
- сохранение утверждённых реальных размеров при стандартных настройках;
- возможность масштабирования текста и корректного reflow;
- меньше повторных CSS-переопределений и несогласованности компонентов.

## Проверенные факты о коде

- `src/app/foundation.css`: Karrik Regular/Italic (400), Micro Grotesk Variable (объявлен диапазон 100–900), `font-display: swap`. `text-wrap: balance` для заголовков, `pretty` для абзацев уже применены, повторно не внедрять. Root font-size не переопределён.
- `src/ui/Typography.tsx` и `.module.css`: роли `heading`, `lead`, `paragraph`, CSS-переменные `--type-heading-size`, `--type-lead-size`, `--type-paragraph-size`.
- `src/features/hero/Hero.tsx`: сознательные две строки H1, явный `<br />` в lead; копирайт и эти переносы не менять.
- `src/features/hero/Hero.module.css`: около 892 строк и несколько перекрывающихся блоков размера текста. Последний блок `Hero typography study` задаёт реальную экранную шкалу. Значения, которые нужно сохранить как исходный эталон (обычный размер текста пользователя): примерно 48px H1 и 18px lead при 390px; 96px H1 и 22px lead при 1440px, с другими композициями Duo/landscape/ultrawide. Эти цифры из существующих отчётов, не свежего полного браузерного замера.
- `Typography.module.css` даёт `lead` вес 600, тогда как `Hero.module.css` переопределяет для Hero вес на 400. Storybook `Typography.stories.tsx` изолированно не показывает реальное оформление Hero.
- `SiteHeader.module.css`, `HeroAction.module.css`, `Button.module.css`, `IntegrationLogos.module.css`, `Rizzie.module.css`: собственные размеры UI; `HomeworkCookieNotice.module.css` использует системный UI-шрифт по референсу Homework. Не применять ко всем компонентам один размер/шрифт.
- `--text-measure: 65ch` в foundation: проверять использование и оптику, **не менять автоматически**; `ch` равен advance цифры 0, не фактическому количеству символов.
- Текущие QA-отчёты привязаны к разным прежним коммитам. Любой дефект подтверждать заново перед исправлением.

## Архитектурное решение

Оставить `font-family` и тему как есть. В `@layer tokens` разместить семантические токены для **только используемых** ролей: `display` (H1), `lead`, `body`, `control` (CTA/поля/кнопки), `ui-label` (навигация), `caption` (небольшие подписи). Не вводить сейчас H2–H4, 15–20 стилей, отдельный генератор токенов, Sass или новую библиотеку.

У каждой роли где это реально полезно: family, weight, font-size, line-height, letter-spacing. Нужные местные отклонения оставить под компонентными CSS custom properties. Темы Dawn/Dusk меняют цвет, но не автоматически геометрию текста. Роли в Storybook должны показывать те же вычисленные CSS значения, что и в реальном Hero.

Рекомендация Rutter: define min/max visual anchors, interpolate selectively via `clamp(rem, rem + vi, rem)`, не `vw`-only. Не менять `html { font-size }`. Для Hero НЕ использовать один глобальный clamp с 320 до 2803: арт-направленные landscape, Duo, короткие экраны и ultrawide сохраняют отдельные условия.

## Порядок внедрения (одна задача = небольшой отдельный diff)

### T0. Базовый контракт. Read-only, перед любыми CSS-правками
**Файлы:** план/отчёт и существующий QA-скрипт только после отдельного решения запускать тестирование.  
**Действия:** снять текущие computed values (font-family/weight/size/line-height/tracking), строки H1, ширину блока, рамки текста, canvas и CTA для 320×568, 390×844, 466×678, 874×402, 951×669, 1024×768, 1366×768, 1440×900, 1920×960, 2803×1024; Dawn/Dusk в Storybook. Сохранить скриншоты эталона. Учесть локальные незакоммиченные файлы других агентов.  
**Приёмка:** таблица текущих рендерных значений, снимки с известным commit SHA и список целевых отклонений. **Пока не запускать; пользователь отделил тесты в самостоятельный проход.**

### T1. Семантические токены без визуальных изменений
**Файлы:** `src/app/foundation.css`, `src/ui/Typography.module.css`.  
**Действия:** выделить только повторно используемые typography roles, переиспользовать существующие `--font-body`, `--font-heading`, `--type-*-size`, явно определить weight/line-height/tracking при необходимости. Не вводить 6 объектов токенов на каждый компонент и не изменять root font-size.  
**Приёмка:** обычный UI и Hero имеют тот же computed style; нет новых шрифтов, лишних вариантов или изменённого текста; токены не дублируют старые без причины.

### T2. Выпрямить каскад Hero и сделать размеры масштабируемыми
**Файлы:** `src/features/hero/Hero.module.css`; `src/ui/Typography.module.css` только по необходимости.  
**Действия:** определить реальные выигрывающие декларации, перенести итоговую систему в однозначные правила, удаляя только подтверждённо затенённые типографические значения. Геометрию grid и motion оставить неизменной. Заменять `px`-only текстовые clamps на `rem`-минимумы/максимумы и `rem + vi` там, где визуальный эталон сохраняется. Сохранить отдельные условия для short-height, landscape, Duo, laptop и ultrawide. Не менять forced line breaks.  
**Приёмка:** at default user font settings размер H1/lead/body, количество строк, bbox и арт-композиция совпадают с эталоном (допуск 1 CSS px для измеряемых текстовых размеров; содержимое/порядок не меняются). Увеличение текста не приводит к потере функций; сложные переходы тестировать отдельно.

### T3. Подключить UI к ролям, не стирая исключения
**Файлы:** `src/features/site-shell/SiteHeader.module.css`, `src/features/hero/HeroAction.module.css`, `src/ui/Button.module.css`; отдельным небольшим diff — подписи Integrations/Rizzie, если действительно дублируют роль.  
**Действия:** только повторяемые font sizes/weights/leading перенести на роль; сохранить локальные исключения, включая плотность menu, характер Hero CTA и системный шрифт Cookies. `white-space: nowrap` на интерактивном тексте проверить при 200% зуме, не удалять без знания компоновки.  
**Приёмка:** состояния hover/focus/disabled, длинные названия, интерактивные области и реальная компоновка CTA не ухудшились; параметры совпадают с T0.

### T4. Storybook как зеркало настоящей типографики
**Файлы:** `src/ui/Typography.stories.tsx`, `src/design-system/Foundations.stories.tsx`; существующие Hero stories использовать, не дублировать.  
**Действия:** добавить в рамках уже существующих историй матрицу используемых ролей со значениями, длинные фразы, контроль ширины, темы Dawn/Dusk, сценарий увеличенного шрифта. Тестировать не произвольную typographic demo, а реальные значения Hero/Navigation/CTA.  
**Приёмка:** нет противоречия между Storybook typography и тем, как тип реально выглядит на сайте; не создаётся второй источника истины.

### T5. Современные CSS-возможности только при доказанной пользе
**Файлы:** максимум 1–2 целевых CSS modules, только после конкретной причины.  
**Действия:** экспериментально сравнить `text-box-trim` + `text-box-edge: cap alphabetic` в **однострочных** label/button/icon парах с fallback через `@supports`. `cap`/ `lh` использовать, если они уберут реальное измеренное смещение. Проверить загрузку web fonts и CLS на cold cache; `size-adjust` fallback вводить только при измеренном скачке. Не применять trim к многострочному H1 вслепую, не внедрять drop-caps/hanging punctuation.  
**Приёмка:** исправляется измеренное выравнивание/CLS, не ломается Safari/Firefox; иначе эксперимент отклонить без новых правил.

### T6. Отдельный QA- и acceptance-проход
**Инструменты:** текущие Node/CDP scripts, браузеры Titan (Chrome/Firefox/Opera/Яндекс), Lilith (Safari/Chrome), iPhone Safari для touch и динамического текста; Storybook.  
**Проверки:** `npm run typecheck`, `npm run build`, `npm test` + реальные браузерные сравнения. Последовательный zoom 100/200/400%, viewport 320px, browser default font size 16/20/24px, 699/700, 799/800, 1023/1024, 1199/1200, 2399/2400. Reflow без горизонтального скролла документа; сохранность текста, CTA, меню, фокуса и двух тем; no-JS/reduced/full/lightweight.  
**Приёмка:** никакой P0-регрессии, базовый визуал тот же; JS ошибки отсутствуют. Ошибки фиксируются со скриншотами, средой, SHA и точным шагом воспроизведения. Не смешивать с T0–T5: QA по отдельному запросу пользователя.

## Зависимости и координация

`T0 → T1 → T2 → T3/T4 → T5 (опционально) → T6 (отдельно)`. T3 и T4 могут выполняться параллельно только после фиксации T1 и только с непересекающимися файлами. Не открывать вторую ветку и не перезаписывать локальные незакоммиченные изменения других исполнителей. Публикация запрещена без явной команды. Сохранять один canonical план и ссылку на него в существующей задаче Asana; не размножать Issues, ADR и отдельные TODO для того же решения.

## Основания и ссылки

- Richard Rutter, *In defence of fluid typography* (2025): https://clagnut.com/blog/2441
- Richard Rutter, *Retrofitting fluid typography* (2024): https://clagnut.com/blog/2428
- Richard Rutter, *What’s new in web typography?* (2026): https://clagnut.com/blog/2447
- Richard Rutter, *Use of ch unit considered inappropriate* (2024): https://clagnut.com/blog/2432
- Oliver Schöndorfer, *The State of Typography in Design Systems* (October 2026): https://pimpmytype.com/typography-design-systems/
- MDN, `text-box-trim`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-trim
- Chrome Modern Web Guidance, text scaling: https://developer.chrome.com/docs/modern-web-guidance/guides/accessibility/respect-os-text-scale
- W3C WCAG Understanding Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- Исторический контекст в репозитории: `docs/changes/2026-11-18-hero-typography-preview.md` и `docs/reports/ryze-design-system-audit-2026-11-18.md`, оба требуют проверки на свежем HEAD перед утверждением дефекта.

**Approval gate:** документ планирования; реализация не одобрена автоматически, никаких тестов/релиза в рамках этого исследования.
