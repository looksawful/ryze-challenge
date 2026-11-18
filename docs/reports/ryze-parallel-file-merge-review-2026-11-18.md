# Ryze: сравнительный аудит параллельных файлов и план консолидации

> **Исторический сравнительный снимок.** Факты о dirty-файлах и HEAD относятся к `59de061` на момент первоначальной проверки. На 18.11.2026 в 10:19 МСК `main` и `origin/main` уже совпадают на `92bf44c`: изменения Rizzie (`45cad15`), motion (`9a1546a`) и HeroAction (`92bf44c`) коммитами сохранены. Нельзя повторно cherry-pick этих изменений. Каноническая краткая сводка уже существует: `docs/reports/ryze-parallel-merge-review-2026-11-18.md`; этот файл — подробное приложение, не конкурирующий источник истины.
Дата: 2026-11-18. Область: фактические исходники проекта Ryze на Titan. Режим: read-only review, кроме создания **этого отчёта**. Код, Git-история, PR и деплой не изменялись.

## Источник истины
- Репозиторий: `looksawful/ryze-challenge` (private).
- Текущий рабочий каталог: `D:\inwork\ryze-challenge`; локальный `main` HEAD `59de0610dfa16124fded1aa3fc62f731a5fdad84` на момент просмотра.
- `git worktree list --porcelain`: 54 зарегистрированных worktree.
- `git status --short`: **17 изменённых отслеживаемых файлов**, плюс untracked motion-файлы, отчёты, тесты и снимки. Эти изменения не приписываются конкретным агентам без проверяемой истории.
- Для сравнения использованы `git status`, `git diff HEAD` (включая staged), `git log main..HEAD`, `merge-base --is-ancestor`, локальные файлы и старый реестр `docs/reports/ryze-parallel-worktree-inventory-2026-11-18.json`. Для отдельных негитовых прототипов — побайтовые SHA и `git diff --no-index`.
- Старый отчёт `docs/reports/source-of-truth-consolidation-2026-11-17.md` говорит про `dev` как предыдущую SoT. Это исторический факт 17 ноября; **для текущего аудита SoT — локальная `main`**.

## 1. Что сейчас не сохранено коммитами в main
| Файлы | Фактическая дельта к HEAD | Портирование |
|---|---|---|
| `src/motion/tokens.ts` и `src/motion/hero-entrance.ts` (untracked); `src/app/foundation.css` | Система длительностей/easing и GSAP hero-таймлайн: brand+H1 0с, lead +.22, description+Rizzie +.44, CTA+integrations +.66, nav +.90, cookies +1.14. | **Это уже в рабочей main**, не переносить из других копий. Сначала зафиксировать связанным тестируемым набором. |
| `src/features/site-shell/HeroWithNavigation.tsx`, `.module.css`; `src/features/hero/Hero.tsx`, `.module.css`; `src/app/page.tsx`, `.module.css`; `scripts/hero-reveal-order.test.mjs` | `data-motion-slot`, динамический GSAP импорт, один timeline, `data-motion-driver` исключает двойные CSS-keyframes, cleanup по `gsap.context`, fallback CSS. | Сохранять вместе. **Риск:** Hero/навигация до assembly скрыты/inert; watchdog 24с. Не считать это готовым идеальным коммерческим поведением. |
| `src/features/site-shell/SiteHeader.tsx`, `.module.css` | GSAP mega menu 0.42с через motion tokens вместо 0.64с + back/blur; `data-gsap-active` убирает конкурирующую CSS-анимацию; обновлён переход Dock/chevron. | Сохранять текущий вариант, отдельно проверить быстрый hover/reverse и fallback импорта. |
| `src/features/hero/HeroAction.module.css`, `.tsx` | Переход формы теперь вверх на 10px+scale(.985) вместо scaleX(.86); удалён видимый текст `Demo only. No data is sent.` и его ARIA-ссылка. | Motion оставить кандидатом; удаление предупреждения сверить с UX/юридической честностью демо. Геометрический FLIP-морф ещё не доказан. |
| `src/features/mascot/Rizzie.module.css`, `RizzieMascot.tsx`, `Rizzie.stories.tsx` | Вместо разрозненных `--rizzie-width` и `--sprite-scale` введён единый адаптивный `--rizzie-art-size` с `min(clamp(rem,vw),clamp(rem,svh))`; background-position стал процентным для responsive атласа, добавлен `draggable=false`; Storybook 10+ размеров. | Сохранять вместе, не брать ранние реализации пета поверх. Проверить pixel-frame alignment/drag/hit target. |
| `src/ui/Button.module.css`, `Button.stories.tsx` | Унифицированы hover/pressed/focus/disabled/busy, reduced-motion; добавлена Storybook States. | Сохранять кандидатом после проверки CSS-приоритетов и контраста. |

## 2. Уникальные и устаревшие параллельные рабочие каталоги
| Каталог | Состояние и предмет изменений | Что делать |
|---|---|---|
| `ryze-css-polish-20261118` | Ветка `fix/css-polish-20261118` **ahead 2 / behind 1** от `main`. `3809ddc` изменяет `SiteHeader.module.css`: width mobileDock при ширине до 699px с `min(480px, calc(100% - 84px))` на `calc(100% - 84px)`; на промежуточных размерах высота Dock и hamburger 58→65px; убрано Duo Closed-исключение 440–510px, высота до 720px. `ffbfb93` добавляет QA-документацию. | **Единственная явно новая относительно `main` близкая CSS-ветка**. Не cherry-pick вслепую: последний коммит `main` `59de061` как раз сохраняет читаемость на компактных размерах, а ветка удаляет Duo-исключение. Подтвердить на 390/490/Duo/landscape и вручную перенести одобренные отдельные селекторы. |
| `ryze-integrated-review-20261117` | Нет новых коммитов. **7 staged файлов, +87/-7**: `HomeworkCookieNotice` — tablet 700–1199 static flow и вычисление отступа только при нижнем Dock; `HeroWithNavigation.module.css` — мобильная nav строка `position:relative; min-height:82px`; `SiteHeader` — перенос нижнего Dock наверх и hide-on-scroll (scroll down >96/возврат вверх, удержание при фокусе/открытом меню). | Обновление cookies/проверка нижнего Dock уже присутствует в `main`; hide-on-scroll НЕ реализован в `main` (там `data-scroll-hidden=false`). Требует отдельного UX-решения. `position:relative` противоречит текущей `absolute`; не накладывать. |
| `ryze-unified-20261117` | Нет новых коммитов. **9 modified файлов, +218/-22** + отчёт: те же cookie/dock изменения, укрупнённая мобильная навигация, иные отступы Hero, landscape до 500px, wide до 900px, удаление footer settings. Своя версия `SiteHeader.module.css` (+~110 строк). | Это альтернативная композиция, не «патч на 218 строк». Часть уже появилась в `main` (`bottomDock`, cookie media, mobileSection, landscape rules). Вручную сравнивать только оставшиеся координаты. Не переносить CSS целиком. |
| `ryze-nav-unified-20261116` | 7 dirty файлов, ~+142/-425 строк, крупная переделка `SiteHeader.module.css`, `SiteHeader.tsx`, Storybook и fallback. База существенно старее; ветка `fix/unified-megamenu-20261116` является предком `main`. | Не восстанавливать старую реализацию: риск потери GSAP, современного меню и Storybook. Сохранить её лишь как исторический эталон альтернативного UX. |
| `ryze-navigation-preview-20261116` | 3 dirty файла + локальные DESIGN/artifacts. Pointer hover, восстановление focus после диалога, иконки без glyph, CSS-wrap, тесты. | Pointer/focus решения уже присутствуют в текущем `SiteHeader`. Сравнить уникальные визуальные иконки отдельно, не заменять компонент. |
| `ryze-notice-20261116` | 2 dirty файла: пятсекундное закрытие сообщения с паузой на hover/focus, тест. | Текущее `SiteHeader.tsx` уже имеет 5s timeout и hover/focus state: перенос не нужен. |
| `ryze-cookies` | Старый `CookieConsent.module.css` + Hero/Page, untracked browser script. | `main` использует `HomeworkCookieNotice`; не возвращать прежний CookieConsent. |
| `ryze-rizzie-from-dev-20261116`, `ryze-rizzie-mvp` | Старинные staged/untracked версии исходного маскота и атласа; текущая модель значительно развилась. | Не портировать. При необходимости сохранить только отсутствующие regression tests после сравнения по семантике. |
| `ryze-rizzie-motion-lab-20261117`, `ryze-rizzie-review-fixes-20261117` | Clean, без новых коммитов; оба HEAD являются предками `main`. | Уже интегрированы исторически, дополнительных cherry-pick не нужно. |
| `ryze-storybook-design-system` | Старый worktree, 19 локальных CSS-строк для tablet dock в диапазоне 42–64rem. Прочая история уже в `main`. | Сравнить лишь accessibility/tablet-композицию с текущим Dock. Не накладывать @media поверх новой верстки без визуальной сверки. |
| `ryze-hero-figma-ship-20261117` | Нет уникальных коммитов, один untracked документ `docs/spec/final-grill-contracts-2026-11-17.md`. | Не переписывать Hero. Отдельно сохранить/сверить контракт. |
| `ryze-integration-modes`, `ryze-integration-variants-temp` | Старые ветки с несведённой историей, но текущая `main` уже содержит `IntegrationLogos.tsx` и WebGL/static fallback. | Не брать их код целиком; сравнить лишь неутверждённую UX-вариацию, если нужно восстановить lightweight marquee. |
| `prod` в каталоге `ryze-dev` | Отдельная старая release-линия; имя папки не равно ветке. | **Не объединять в main**. Только отдельный release-review. |

## 3. Отдельные версии анимационной сцены
- `D:\inwork\ryze-motionpath-local-preview`: негитовый ранний Canvas2D / GSAP POC. В `TECH-DECISION-3D-20261117.md` прямо указано «не реализовано/не утверждено для prod». Для продуктовой сборки не использовать как источник готового кода.
- `D:\inwork\ryze-blender-scene`: оригинальный `.blend`, редактируемые Camera/NURBS/118 элементов. Поздний локальный Blender-экспорт сокращён до 6 пустых карточек, 2.75с и 201 точка. В этом проекте есть оригинальный файл/кривая, которые ценны для ручного настройки геометрии, но это не готовая версия сайта.
- `D:\inwork\ryze-motionpath-3d-component\src` и `main\public\ryze-canvas\src`: все четыре файла `main.js/orbit.js/blenderPath.js/media.js` побайтово различались по SHA; по `git diff --no-index` у `orbit.js` единственное смысловое отличие — основной `SHOW_MEDIA_CARDS=false`, у `media.js` совпадает каталог 12 медиа, у `blenderPath.js` значимой текстовой дельты не показано. `main.js` основной версии содержит `postMessage ryze:intro-complete`, alpha:true, интеграцию с Hero и опциональное отсутствие карточек, тогда как лаборатория имеет свои gizmo/grid отладочные слои, альфу и 3D-эксперименты. **Нельзя заменять `main.js` из прототипа целиком**, иначе потеряется текущий протокол Hero/рендер/fallback.

## 4. Перекрытия по конкретным файлам
| Файл | Главная версия | Иные версии / конфликт |
|---|---|---|
| `SiteHeader.module.css` | GSAP/CSS разграничение, Dock, mobile grid, Duo-исключение | `css-polish`: новые ширины/высоты + удаление Duo; `unified`: top mobile dock и иная mobile grid; `nav-unified`: переписанная старая база; `storybook-design-system`: tablet override. **Главная точка CSS-конфликта.** |
| `SiteHeader.tsx` | GSAP reversible mega, cookie settings, focus, mouse pointer, `scrollHidden=false` | `integrated` и `unified`: hide-on-scroll; `navigation-preview`: старая pointer/focus реализация; `notice`: timeout. Нельзя переносить `scrollHidden` без решения о поведении Dock. |
| `Hero.module.css` | Актуальная адаптивная сетка и эксклюзивный GSAP/CSS reveal | `unified`: иные hero offsets/height; `cookies`: старая компоновка; `rizzie-mvp`: другая посадка пета. Только выборочная визуальная сверка. |
| `HeroWithNavigation.tsx` + CSS | Текущий JS GSAP choreography и iframe event protocol | `integrated`/ `unified` меняют mobile Nav positioning; `nav-unified` старый fallback. Портировать всю старую пару опасно. |
| `HomeworkCookieNotice` | Поддержка lower dock и планшетной раскладки присутствует | `integrated`/`unified` повторяют логику, без уникального функционального новшества. |
| `Rizzie.module.css` + `RizzieMascot.tsx` | Новый единый responsive размер/спрайты и drag | Ранние `rizzie-*` версии несовместимы по размерам; модели/lab уже интегрированы в историю. |
| `HeroAction.tsx` + CSS | Текущая анимация переходов и удалённый дисклеймер | Сравнение по честности демо, доступности и контенту, не брать старое поле целиком. |
| `src/motion/*`, `Button.*` | **Новые изменения только в рабочей main**, не версия из чистых старых веток | Требуют сохранения и проверки; не затирать переключением worktree. |

## 5. Порядок объединения без потери работ
1. Сделать **неизменяемый снимок** текущей dirty `main` (все tracked, untracked, тесты и отчёты). Старые worktree не удалять. Эта операция пока **не выполнена**.
2. Зафиксировать согласованный motion-набор в `main` отдельным небольшим коммитом: `src/motion/*`, CSS tokens, Hero slots/orchestrator, regression. Убедиться, что выполняется 20+ заявленных тестов и build/typecheck, особенно reduced/no-JS, и что GSAP/CSS не анимируют одно и то же.
3. Следующий независимый коммит: Rizzie responsive sprite sizing + тесты + Storybook. Проверить совпадение кадров атласа, hit-target, drag, Duo, 320px/699px/700px.
4. Затем Button/HeroAction. Не маскировать неопределённость правил демо удалением информации без решения.
5. Ручной 3-way разбор `css-polish` (base перед 59de061, theirs 3809ddc, ours текущая dirty main). Принять или отклонить изменения ширины/высоты после измерения на настоящих брейкпоинтах. Сам `ffbfb93` QA-документ можно изучить без merge.
6. Только после этого выборочно сверить `unified` и `integrated` для nav/cookie overlap и hide-on-scroll. Один UX-контракт: top-fixed или hide-on-scroll; **не оба одновременно**.
7. Старые ранние Rizzie, Cookies, nav, MotionPath POC не подмешивать, если нет явно отсутствующего теста или утверждённого поведения. Публикации/merge/prod только отдельно после проверки.
8. Сверить скриншоты 320×568, 390×844, Duo 490×1091 и 951×669, 699/700 breakpoint, 874×402 landscape, 1440×900, 1920×1080, ultrawide; reduced/static/light/full.
9. Новые потоки должны писать в ту же `main` после согласования файлов/момента коммита; не создавать параллельные «официальные» версии.

## Review axes
- **Standards:** ADR static-first, существующие GSAP и CSS Modules, сохранение reduced/no-JS. Опасные переносы: старый `nav-unified` против современной структуры; прототипный `main.js` против актуального message/fallback; расхождение `css-polish` с compact-layout исключениями. Это не результат компиляции всех альтернатив.
- **Spec:** Hero должен оставаться доступным без ожидания WebGL, но текущий `HeroWithNavigation` прячет основной контент до assembly и имеет 24s watchdog. Видимый демо-дисклеймер удалён: нужно решить, где остаётся честное описание симуляции. Текущее `main` остаётся прототипом первого экрана, не всей страницы.
- **Не проверено в этом проходе:** свежий build/typecheck, конфликтная пробная интеграция, браузерные сцены по всем 54 worktree, производительность и авторство незакоммиченных правок. Имеются отчёты предыдущих проверок в `docs/notes` и `docs/changes`; они не заменяют тест после merge.

**Итог:** автоматически переносить только потому, что ветка ahead, нельзя. Первым делом защитить dirty `main`; главные кандидаты на ручной перенос — геометрические изменения `css-polish`, отдельные идеи responsive nav из `unified` и ещё не включённые тесты. Всё остальное либо уже в main, либо заметно устарело.

## Дополнение: ветки интеграций и брендовой заставки
- `feat/issue-15-three-logo-modes` имеет два старых не являющихся предками `main` коммита: `aff5a4b` (progressive three-mode logo morph), `1e35a6f` (slow WebGL recovery / Shopify decode). Затронуты `IntegrationLogos.tsx`, `.module.css`, `logo-morph.ts`, ассеты и тесты. **В актуальной main уже есть** slow-frames fallback, `IntersectionObserver`, reduced/static и Shopify asset, но **не доказана полная parity трёх режимов**. Решение: сравнивать контракт modes и поведение, не брать старый компонент целиком.
- `preview/integration-variants-temp`: `a16d4b0` добавляет отдельные routes/компоненты для сравнения вариантов `IntegrationComparison`/`IntegrationVariantSite`; `2b3de4c` фиксирует конфликт логотипов с CTA и Dock в мобильном превью. Эти preview routes не входят в текущую единственную Hero-страницу; при необходимости сохранить как исследовательские результаты/Storybook states, но **не добавлять устаревшие routes в main**.
- `feat/issue-15-brand-intro-demo` и `release/issue-15-brand-intro-prod` содержат раннее `public/ryze-logo-intro.html` с чёрной particle-заставкой и тестами. `main` уже содержит отдельную интро-реализацию и полноценный `ryze-canvas`. Не объединять системы без отдельного утверждения.
