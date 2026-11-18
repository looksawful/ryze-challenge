# Ryze: коммерческий motion-аудит первого экрана

> **Исторический снимок, не новый норматив.** Наблюдения сделаны до коммитов `9a1546a` (GSAP Hero) и `92bf44c` (HeroAction). По повторной проверке 18.11.2026 в 10:19 МСК `main` и `origin/main` совпали на `92bf44c`. Последующие изменения других исполнителей не изменяются этим документом. Критерии ниже — предложения для отдельного UX-review, не подтверждение дефектов нового HEAD.
Дата: 2026-11-18. Источник: Titan, `D:\inwork\ryze-challenge`, локальная рабочая копия; приватный `looksawful/ryze-challenge`, основной ref `main`.

## Границы и верификация
Объект: **прототип Hero и его интерактивные элементы**, не весь многостраничный лендинг. Рассмотрены код GSAP, CSS, локальные отчёты браузерных прогонов и три изображения фактического браузерного рендера: `docs/notes/hero-stagger-desktop-middle.png`, `hero-stagger-desktop-end.png`, `hero-stagger-mobile-end.png`. Проверены существующие результаты `hero-stagger-browser-measurements.json`, код и документы от 17–18 ноября. В ЭТОМ аудите не запускались независимые performance-профилировки/INP или новые сценарии переключения вкладок. Не вносились изменения в функциональный код, не выполнялись push/deploy.

Тип: descriptive audit: оценка существующей архитектуры и план проверяемых исправлений. Канон: (1) рабочий код локальной версии; (2) ранее сохранённые браузерные измерения/кадры; (3) официальные GSAP, web.dev и WCAG; (4) практические дизайн-референсы, не заменяющие измерения.

## Главный вывод
Проблема не в недостатке эффектов, а в том, что **motion управляет доступностью контента вместо того, чтобы сопровождать ясное предложение**. Конкурируют полноценная бренд-заставка, fade-up заголовков, движущийся розовый круг, непрерывно морфирующиеся 5 интеграционных брендов, анимации меню и персонаж. Нужны иерархия, немедленный CTA, спокойное состояние после вступления и демонстрация пользы продукта.

## Приоритизированные наблюдения

| Приоритет | Наблюдение | Доказательство / статус | Коррекция |
|---|---|---|---|
| P0 | До `ryze:assembled` скрыты и inert Hero и навигация. Текущий fallback таймер 24 с. | `src/features/site-shell/HeroWithNavigation.tsx`, `HeroWithNavigation.module.css`; подтверждено кодом. Старый прогон: assembly +4.66 с; более поздний desktop-прогон `hero-stagger-browser-measurements.json`: +5.724 с в отдельном запуске. Это не фиксированная константа. | Отвязать доступность CTA/навигации и смыслового текста от iframe. Показывать содержимое сразу после SSR; заставка только декорация, не блокирующий экран. Дать мягкий skip или завершение интро без запирания взаимодействий. |
| P1 | Розовый круг перекрывает строки оффера, снижая читаемость. | Визуально подтверждено `hero-stagger-desktop-middle.png`; также `docs/notes/hero-motion-background-2026-11-17.md`. | Развести объекты в пространстве; смещать/маскировать круг вне центрального текстового блока или затухать его до появления описания; не накладывать интенсивный цвет на смысловой текст. |
| P1 | CTA, интеграции, навигация и cookie входят заметно позже, чем H1. | `src/motion/tokens.ts`: CTA +0.66 при длительности 0.64; навигация +0.90/.42; cookie +1.14/.42 относительно assembly. | Семантически главный CTA функционален с первого кадра. Если сохранять вступление, сделать H1/подзаголовок 0–0.35 с, CTA 0.15–0.45 с, вторичные элементы позже, но без блокирования взаимодействия. |
| P1 | 5 интеграций в Full по очереди прячутся в единственном движущемся canvas; полный цикл 10.9 с. | `IntegrationLogos.tsx`, `logo-morph.ts`, `IntegrationLogos.module.css`; собственно рендер на кадрах. Режимы static/reduced показывают все сразу. | Все 5 статичных логотипов остаются разборчивыми одновременно, morph — вторичный акцент с коротким циклом/наведение или пользовательским управлением. Сохранить размер и геометрию при инициализации WebGL. |
| P1 | После intro отсутствует конкретная демонстрация механики AI-продукта; остаётся в основном текст и бренд-графика. | `Hero.tsx`, итоговые desktop/mobile screenshots. Это редакционная оценка, не функциональный баг. | Добавить одну точную, согласованную мини-сцену настоящего интерфейса: ввод задачи → понятное действие системы → результат. Не выдумывать работающие функции, показатели или заявки. |
| P1 | Лёгкий режим навигации не управляет полноценной сценой Hero: iframe отключается только при reduced motion. | `SiteHeader.tsx` и `HeroMotionBackground.tsx`, код. | Единый capability policy для Static / Reduced / Lightweight / Full; в Lightweight заменять full-screen WebGL постером/облегчённой графикой. |
| P2 | Mega menu entrance чрезмерно постановочный: 0.42 с clip-path+translate+scale, затем stagger. | `src/features/site-shell/SiteHeader.tsx`, код. | Для частого меню ~0.18–0.26 с; немедленное состояние, обратимость `play/reverse`, при быстро повторённом вводе без очередей/скачков; `clip-path` заменить transform/opacity, если paint-профиль это оправдает. |
| P2 | Desktop CTA по спецификации должен morph-иться в форму, но сейчас содержимое условно переключается без общего геометрического motion-контракта. Mobile native dialog без определённой анимации входа. | `HeroAction.tsx`, `HeroAction.module.css`. | Desktop: `Flip.getState()/Flip.from()` или ограниченный transform/opacity tween общего контейнера около 0.25–0.32 с, focus/input доступен сразу. Mobile: sheet от нижней границы 0.25–0.32 с и короткий выход; в reduced без перемещения. |
| P2 | Обработка WebGL избыточно отделена от общей motion-системы; реальная стоимость кадров не измерена в этом аудите. | Hero iframe + морф 3200 точек, DPR до 2; IntersectionObserver/visibility уже присутствуют у логотипов. | Ограничить активные дорогие эффекты одним фокусным, pause на hidden/offscreen, для fullscreen canvas тестировать DPR около 1, мерить frames/LoAF на телефоне до принятия решения о снижении качества. |
| P2 | При первом просмотре заголовок движется на `yPercent:66`; семантическая иерархия заменяется длинным общим fade-up. | `src/motion/hero-entrance.ts`, код. | На H1 8–20 px или аккуратный масочный reveal, слова не по буквам; stagger ~0.06–0.10 с между смысловыми строками. Стабильная читабельная композиция при отключённой анимации. |

## Что не переделывать
- Сохранять отдельный GSAP для DOM, WebGL для шейдеров; не затягивать всё в GSAP или новый universal motion engine.
- У `RizzieMascot` уже есть проверки видимости/reduced и остановка при активном CTA; не добавлять ещё один постоянно живущий аттракцион.
- У `IntegrationLogos` уже есть обработка WebGL ошибок, IntersectionObserver, 30fps на мобильном, reduced/static fallback. Исправлять **показ информации**, не переписывать рендер без доказательств проблемы.
- У GSAP таймлайна есть единые токены и cleanup context. Сохранить и упростить сцены.
- 12 медиа-карточек в актуальной версии отключены через `SHOW_MEDIA_CARDS=false`; не оценивать их как активное поведение.
- ScrollTrigger на данной первой странице не требуется. Для будущих секций использовать, только если скролл реально управляет сюжетной демонстрацией; простые появления решать IntersectionObserver/CSS.
- Не менять утверждённую верстку Hero, типографику или респонсивные композиции без отдельного согласования. Правки в первую очередь временные, структурные и послойные.

## Целевая драматургия
**Основной сценарий**: 0) доступный оффер и CTA сразу; 1) 0–0.5 с — мягкая семантическая расстановка внимания; 2) 0.5–1.2 с — одно узнаваемое бренд-действие вне площади основного текста; 3) далее спокойная статичная композиция с видимой пользой/мини-демо. Взаимодействия независимо от декоративного таймлайна. Это художественные стартовые интервалы для A/B просмотра, не измеренные значения текущей реализации.

**Поведение**:
- Static: без JS и WebGL весь смысл, навигация и CTA доступны.
- Reduced: без больших перемещений/автоплея, информация та же.
- Lightweight: без дорогостоящей fullscreen-сцены; минимальные CSS transitions и статичный обзор интеграций.
- Full: одна бренд-сцена + небольшая локальная реакция на действие, не непрерывное соревнование объектов.
- Вызывать `gsap.matchMedia()` и `.revert()` для breakpoint/reduced lifecycle лишь там, где есть GSAP. Не дублировать CSS и GSAP одну и ту же сцену.

## Проверка исправления
1. При отключении/срыве `iframe` заголовок/CTA/меню доступны, без ожидания `ryze:assembled` и 24-секундного таймера.
2. Ни на одном кадре нет розового круга за контрастно недостаточным текстом; проверить 1440×900, 390×844 и 874×402 landscape.
3. Пять интеграций доступны и читаемы без ожидания 10.9-секундного цикла.
4. Меню, CTA и drawer повторно открыть/закрыть до завершения tween: нет скачка, недоступных контролов, нарушенного фокуса.
5. `prefers-reduced-motion` и no-JS дают ту же семантику и функционал.
6. На представительных мобильных и desktop устройствах записать Performance trace: frame drops/Long Animation Frames; INP p75 ≤200 мс (ориентир web.dev) при реальных действиях. Этот аудит значения INP/FPS **не измерял**.
7. Анимацию продукта проверять на фактической интерфейсной правде; не выдавать прототип за работающий live AI.

## Ссылки на первичные руководства
- GSAP matchMedia/revert: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- GSAP accessible animation: https://gsap.com/resources/getting-started/accessibility/
- GSAP SplitText/resplitting (только при необходимости): https://gsap.com/docs/v3/Plugins/SplitText/
- web.dev CSS animation performance: https://web.dev/articles/animations-guide
- web.dev INP: https://web.dev/articles/inp
- WCAG animation from interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions

## Статус handoff
Исследование и приоритеты зафиксированы. Изменение исходного анимационного кода, новый PR/issue, push и deployment НЕ выполнялись. Некоторые цифры и восприятие взяты из сохранённых QA от 17–18 ноября, а не из нового измерительного прогона.


## Исследование GSAP: что берём для Ryze (18.11.2026, актуальная main `f7631b5`)

**Статус:** инженерно-дизайнерская рекомендация на обсуждение; не утверждённый редизайн. На момент повторной проверки `main` и `origin/main` совпадали на `f7631b5`. Исследованы официальная документация GSAP и первичные кейсы, включая Ponpon Mania, Monolith NYC и Moooi Paper Play. Изменений поведения сайта нет.

### Факты текущей реализации
- `gsap ^3.15.1` уже установлен; `@gsap/react` не обнаружен в package.json.
- `src/motion/tokens.ts` — общий словарь control .18s / exit .2s / surface .42s / enter .58s / emphasis .76s / character .68s и относительные cue Hero, отсчитываемые **после** `ryze:assembled`.
- `HeroWithNavigation.tsx` и `hero-entrance.ts` уже имеют `gsap.context()` и cleanup; отдельный iframe WebGL получает postMessage. `IntroPhase=playing` ставит интерактивные области в `inert` до сборки; watchdog 24s. Это ключевой продуктовый риск, а не повод вводить ещё один плагин.
- `SiteHeader.tsx` уже содержит timeline с `play()/reverse()`; `HeroAction.tsx` условно переключает `details` на inline-форму или мобильный `dialog`. В данный момент ни `Flip`, ни `SplitText`, ни `ScrollTrigger`, ни `gsap.matchMedia()` в `src/` не обнаружены.

### Решения-кандидаты
| Приём | Решение | Объект/польза | Ограничение |
|---|---|---|---|
| `timeline()` + labels + reusable `MOTION` | **Оставить, доработать** | Hero — читаемый порядок H1→пояснение→CTA→второстепенное, не блокируя действия; MegaMenu — reversible | Не переписывать WebGL-движок на сотни DOM-tweens; держать CSS fallback; не создавать второй набор токенов |
| `gsap.context()` | **Оставить существующее** | Очистка в React уже реализована | `useGSAP()` добавляет пакет `@gsap/react` и не нужен пока конкретные lifecycle-баги не выявлены; если переходить — только отдельным доказанным рефакторингом |
| `gsap.matchMedia()` | **Взять для breakpoint/motion** | Автоматический cleanup при смене viewport / prefers-reduced-motion; один контракт для всех motion islands | Это не детектор мощности устройства. Политика Static/Reduced/Lightweight/Full должна жить отдельно; статическая разметка остаётся доступной |
| `Flip` | **POC для CTA** | При реальной перестройке одного контейнера Start For Free→поле+submit визуально связывает до/после | Сначала выбрать DOM/фокус/aria, потом замерить. Если достаточно CSS transform+opacity, не внедрять Flip; мобильный dialog не обязан morph-иться |
| `SplitText` | **Только проба, не обязательный плагин** | При динамическом переносе строк H1: `type:'lines'`, `mask:'lines'`, `autoSplit:true`, `onSplit` | H1 уже содержит две утверждённые `span`-строки. Не переписывать типографику и не дробить её на буквы без показанной пользы; проверять aria/zoom/переносы |
| `ScrollTrigger` | **Отложить** | Одна смысловая сцена Product UI при появлении следующих секций: запрос → действие → результат; `once` или краткая scrub-последовательность | В текущей первой секции ему нечего делать. Не делать длинный pinned-scroll, scroll-jacking или подмену скролла |
| `quickTo()` | **Условно** | Маленький pointer-follow/возврат Rizzie, если текущий механизм дёргается | Не создавать постоянную дополнительную анимацию поверх спрайт-машины; только после измерений |
| `ScrollSmoother`, `Observer`, `Physics2D`, `Draggable`, `Inertia`, `MorphSVG`, `DrawSVG` | **Не вводить сейчас** | Нет функциональной потребности в текущем Hero | Не превращать лендинг в демонстрацию всех плагинов GSAP |

### Режиссёрская модель (предложение, не установленный бенчмарк)
- **Немедленно:** семантические H1/текст/CTA/навигация доступны с первого рендера (SSR/static); загрузка 118 фрагментов — декоративная параллельная дорожка. Событие `ryze:assembled` может запускать только необязательный акцент, не разблокировку кнопки.
- **Вступление:** H1 + lead со смысловым overlap, CTA уже работоспособна; текст не перекрывается розовым кругом. Отдельные visual-clocks WebGL/DOM остаются; связывать их через ограниченный протокол состояния (start/settle), а не один гигантский таймлайн.
- **Интеракции:** короткие, обратимые, прерываемые на середине; ориентиры для прототипирования control 120–200ms, menu 180–260ms, CTA/layout 240–350ms, H1 reveal 350–550ms, branded accent 0.9–1.4s. Это наши предлагаемые числа, не норма GSAP и не измеренный результат.
- **Показ пользы:** все 5 платформ узнаваемы одновременно; WebGL morph лишь дополнительный акцент. В будущей product-секции показать настоящие данные/интерфейс, не фиктивный результат.
- **Режимы:** Static = HTML/CSS без JS; Reduced = без camera travel/particles/разгона; Lightweight = CSS + краткий GSAP timeline без большой WebGL-сцены; Full = разрешённая optional WebGL + контролируемая GSAP-хореография. Порог «слабого устройства» должен основываться на runtime policy/реальном профилировании, не на ширине экрана.

### Примеры и вывод, который применим к Ryze
1. **Ponpon Mania (Codrops, 07.10.2025):** GSAP синхронизирует DOM и WebGL сцены; используются таймлайны, ScrollTrigger и SplitText. Взять принцип «GSAP-дирижёр, WebGL-рендерер» и отладочные сцены, **не** плотность эффектов. https://tympanus.net/codrops/2025/10/07/ponpon-mania-how-webgl-and-gsap-bring-a-comic-sheeps-dream-to-life/
2. **Monolith NYC (Awwwards, 12.02.2025):** смена представлений карточек продукта через Flip. Взять ясную связь двух состояний CTA/демонстрации, **не** копировать сложную сетку. https://www.awwwards.com/case-study-monolith-nyc.html
3. **Moooi Paper Play (Webby Awards):** сцены и переходы управляются GSAP timelines, PixiJS/GLSL остаются отдельной графической системой. Взять разделение ролей, **не** превращать продажный Hero в трёхактный фильм. https://www.webbyawards.com/crafted-with-code/moooi-paper-play/

### Контроль принятия
- Никаких `inert`/недоступных CTA из-за ожидания WebGL; fallback без JS и reduced-motion проверен по DOM/клавиатуре.
- После resize и смены motion preference нет удвоенных анимаций или скрытого контента.
- Hero/меню/CTA проверены при повторном клике и обратном взаимодействии в середине tween; фокус/aria не теряются.
- Для новых эффектов фиксируются before/after кадры, FPS/LoAF/INP где применимо, 320/390/490/Duo/700/874×402/1440/1920 и Safari/Chrome/Firefox; только после этого принимать дополнительные плагины.
- Не менять утверждённую типографику, историю чужих коммитов, не добавлять новый motion engine/зависимости/публичный деплой.

### Официальные источники
- GSAP timelines: https://gsap.com/docs/v3/GSAP/Timeline/
- GSAP React и `contextSafe`: https://gsap.com/resources/React
- `gsap.context()`: https://gsap.com/docs/v3/GSAP/gsap.context()
- `gsap.matchMedia()`: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
- `Flip`: https://gsap.com/docs/v3/Plugins/Flip/
- `SplitText`: https://gsap.com/docs/v3/Plugins/SplitText/
- `ScrollTrigger`: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- `quickTo`: https://gsap.com/docs/v3/GSAP/gsap.quickTo()
- Web performance: https://web.dev/articles/animations-guide


## Проект внедрения пяти приёмов GSAP: решение и тестовый контракт (18.11.2026)

**Статус:** исследование, предложение для технического и визуального согласования. Не меняет реализацию сайта, Storybook, ветки или релиз. Scope сознательно ограничен Timeline, gsap.context/useGSAP, gsap.matchMedia, Flip и SplitText. ScrollTrigger, ScrollSmoother, Observer, Physics, DrawSVG, MorphSVG, Draggable и Inertia исключены из данного этапа.

### Продуктовое решение (The Business Engineer: ограничение и контргипотеза)
Целевая работа посетителя: понять обещание сервиса и без препятствий начать доменный сценарий. Узкое место, **подтверждённое исходниками**, — доступность оффера и CTA зависит от сообщения WebGL \`ryze:assembled\`; блокирующий \`inert\` и визуальное скрытие Hero снимаются лишь после события, а fail-safe ждёт до 24 секунд. Это инженерная причина для P0, а не замерённая конверсия. Противогипотеза: длинная фирменная заставка повышает узнаваемость. Проверка решения: сохранить выразительность заставки, но пустить её параллельно с уже доступным H1/CTA. Сравнивать время до доступного CTA, успешное прохождение demo flow, ошибки и субъективную разборчивость. Не заявлять прирост конверсии без эксперимента.

### Сводная таблица решений

| Паттерн | Решение | Текущая база | Файлы и способ |
|---|---|---|---|
| Core Timeline + labels | **Улучшить уже установленный GSAP**, без новой библиотеки | \`src/motion/tokens.ts\`, \`hero-entrance.ts\`, \`HeroWithNavigation.tsx\` содержат timeline и cue от \`ryze:assembled\` | Задать семантические фазы \`content/brand/settled\`; не скрывать H1 и CTA до Assembly; меню как отдельный \`play/reverse\` timeline |
| \`gsap.context()\` / \`useGSAP()\` | **Оставить context, не устанавливать @gsap/react пока** | \`HeroWithNavigation\` вызывает \`gsap.context()\` и \`revert()\`; \`SiteHeader\` вручную \`revert/kill\` | Обеспечить scope по ref, cancellation для асинхронного import и created-after-effect callbacks. \`useGSAP()\` имеет смысл, только если из-за lifecycle появляются повторные баги |
| \`gsap.matchMedia()\` | **Взять в GSAP islands** | Есть собственные \`window.matchMedia()\` в SiteHeader, HeroMotionBackground, IntegrationLogos, Rizzie; GSAP matchMedia ещё нет | Ограничить им создание/отмену GSAP tweens при reduced/viewport. Общую политику Full/Lightweight/Reduced/Static **не** определять через matchMedia: условия WebGL, возможности устройства и fallback — отдельная детерминированная политика, одна на Hero и Header |
| \`Flip\` | **POC только для wide HeroAction, условно внедрить** | \`HeroAction.tsx\` размонтирует \`details/summary\` и монтирует \`inline\` форму при \`mode=inline\` | Захват \`Flip.getState\` до смены React-state; дождаться commit DOM в \`useLayoutEffect\`, вызвать \`Flip.from\` для стабильного shell или с \`data-flip-id/targets\` для замещённых узлов. Не менять DOM вручную вне React; не применять на мобильном drawer |
| \`SplitText\` | **POC в Storybook; без гарантии prod** | \`Hero.tsx\` уже имеет две семантические \`span\`-строки; \`hero-entrance.ts\` делает stagger по ним | Сравнить A: existing spans + небольшой масочный reveal и B: SplitText \`lines\`, \`mask:'lines'\`, \`autoSplit:true\`, \`onSplit\` с возвратом tween. Принять B только если переносы/шрифты/zoom и доступность лучше; не дробить в chars и не править утверждённый текст |

### Обязательный P0 до художественной доработки
1. В \`HeroWithNavigation.tsx\` больше не задавать \`inert\` для \`main#main\` и навигации из-за \`introPhase='playing'\`. В \`HeroWithNavigation.module.css\` не скрывать весь \`main\`/Header через \`opacity:0; pointer-events:none\` на период сборки. Нельзя просто изменить CSS и оставить \`inert\` или наоборот.
2. Оставить iframe как декоративный слой с \`pointer-events:none\`. \`ryze:assembled\` и \`ryze:intro-complete\` менять только **необязательный visual state**, не семантическую доступность.
3. На первом SSR/HTML-кадре H1, CTA и ссылки доступны, без JS всё работает в предусмотренном спецификацией fallback. Для GSAP движения H1 — небольшой transform без \`autoAlpha:0\` и невидимого начального состояния; CTA всегда интерактивна. Не создавать FOUC скрыванием через CSS до JS.
4. Статус Reduced и смена системной настройки в середине intro немедленно освобождают весь контент. 24-секундный timer можно оставить для остановки декоративной сцены, но не как механизм разблокировки UI.

### Техническая последовательность
**Срез A, без изменения геометрии:** \`HeroWithNavigation.tsx/.module.css\`, \`hero-entrance.ts\`, \`tokens.ts\`, \`Hero.module.css\`. Преобразовать cue в labels и убрать блокирующую видимость. Отдельно проверить, что \`desktopCookies\` и fixed Dock не получают transform-контейнер (существующее исключение оставить). Сцену 118 фрагментов оставить прежней.
**Срез B, адаптивность:** добавлять \`gsap.matchMedia()\` к DOM-анимациям на стороне Hero/Header. Внутри каждого island один scope и один cleanup; не дублировать \`motion tokens\` в третьем месте. Текущий \`HeroMotionBackground.tsx\` отключает iframe лишь при \`prefers-reduced-motion\`; синхронизировать его с единой capability policy для Lightweight и Full, не привязывать режим напрямую к размеру экрана.
**Срез C, desktop CTA POC:** Storybook \`HeroAction.stories.tsx\` показывает две реализации — базовую CSS и Flip. Общая визуальная оболочка сохраняет identity, input и доступность; у формы одна source of truth для значения/валидации. Если React заменяет элементы, дать им \`data-flip-id\` и передать новые \`targets\`. Брать layout-снимок ДО смены state, а применять Flip ПОСЛЕ commit; \`flushSync\` не использовать по умолчанию (React предупреждает о стоимости), предпочтительнее layout effect. При закрытии, Escape, повторном клике, быстрых переключениях kill/revert предыдущую анимацию. Фокус в поле выставляется после mount без ожидания завершения tween. ResizeObserver на границе 800px не должен стирать введённый домен; возврат фокуса на original trigger после закрытия. Если POC не превосходит CSS по ясности и стабильности — оставить CSS.
**Срез D, H1 POC:** \`Hero.tsx\`, \`hero-entrance.ts\`, Storybook stories. Вариант A существующие два span без изменения DOM; вариант B \`SplitText.create(headline, {type:'lines', mask:'lines', autoSplit:true, onSplit})\`, \`onSplit\` возвращает animation и \`revert\` восстанавливает исходную разметку. Сохранять вложенные muted spans, переносы Karrik/Micro Grotesk, читаемую строку для screen reader; при темы/resize/шрифтах пересоздание SplitText не должно спорить с React. Сравнивать только после загрузки шрифтов; TypeScript/SSR границу держать внутри client component.

### Тесты и доказательства принятия
| Уровень | Добавить/обновить | Проверяемое условие |
|---|---|---|
| Contract/unit | \`scripts/motion-system.test.mjs\`, \`scripts/hero-reveal-order.test.mjs\` | Старые тесты сейчас **требуют** \`ryze:assembled\` и \`24000\`. Изменить контракт на «не блокировать UI»; проверять отсутствие \`inert\` на этапе playing и сохранённые fallback, labels, cleanup и один GSAP/CSS-драйвер, а не застывшие magic numbers |
| Hero browser | Chrome/Safari/Firefox: JS off, offline/abort iframe, WebGL exception, slow chunk, Reduced on/off в процессе intro | H1/CTA/навигация доступны **до** \`ryze:assembled\`, нет hidden/inert, клики по CTA срабатывают, зависаний на 24с нет |
| Lifecycle | React StrictMode mount/unmount/remount, resize 699↔700, 799↔800, 1199↔1200, смена media в середине tween | Не копятся tweens и listeners, нет повторного старта intro и сломанной transform CSS при revert |
| HeroAction Storybook | Расширить \`HeroAction.stories.tsx\` состояниями \`idle/opening/editing/thinking/result/closing\`; тест настоящего ResizeObserver без смены React key | В текущей Storybook \`key={containerWidth}\` пересоздаёт компонент на каждый resize и **скрывает баги переноса состояния**; нужна отдельная история с постоянным key и изменяющимся контейнером |
| Flip E2E | Desktop 800/801/940/1440px, серия быстрых open→close→open, Escape/Tab/Enter, invalid→valid→result→edit, resize во время открытия | Нет скачка, CLS из-за промежуточного состояния, потерянного фокуса/значения. Сравнить вариант CSS и Flip на одинаковых viewport кадрах и timeline screenshots |
| SplitText visual+accessibility | 320/375/390/540/699/700/951 Duo/1024/1440/1920/2803, landscape 874×402, 200% zoom, поздняя загрузка шрифтов | Нет двоения/скрытия H1, перепрыгивания muted spans, разрыва строк или переполнения; accessible name полный до/после split/revert |
| Navigation Storybook | \`SiteHeader.stories.tsx\` для Full/Lightweight/Reduced/Static, mouse→panel gap, Escape, Tab, rapid hover | Не перекрывают друг друга CSS/GSAP driver; меню остаётся доступно без JS, \`play/reverse\` не конфликтуют при смене разделов |
| Performance | DevTools traces/LoAF, FPS, LCP, CLS, INP на тестовом стенде, один и тот же сценарий до/после | Нет ухудшения отзывчивости/предметной читабельности. Не объявлять достигнутые значения без результатов замеров |

**Граница тестирования:** Storybook «Static» — симуляция; настоящий no-JS проверяется отдельно в браузере. В первом проходе достаточны build, typecheck, адресные контрактные тесты, визуальный регресс и поведение. Mac Safari/iPhone и Titan Chrome/Firefox/Opera/Yandex сравнивать после локальных прототипов. Приватный сайт, без публичного деплоя.

### Решение о принятии
- **Принять без POC:** сохраняем \`timeline\` и \`gsap.context\`, внедряем \`matchMedia\` как ограниченный GSAP lifecycle. P0 по доступности Hero — необходим независимо от выбора плагина.
- **Принять только после сравнения:** Flip при визуально правильном desktop CTA и сохранённом form-state/focus; SplitText при доказанном преимуществе на адаптивном H1. Равный по качеству CSS = меньше кода и меньше риска.
- **Не начинать:** ScrollTrigger, ScrollSmoother, Observer, Physics и прочие отдельные плагины; нет соответствующих секций или пользовательских задач.

### Первоисточники для исполнения
GSAP timeline https://gsap.com/docs/v3/GSAP/Timeline/ ; GSAP context https://gsap.com/docs/v3/GSAP/gsap.context()/ ; matchMedia https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ ; GSAP React https://gsap.com/resources/React ; Flip https://gsap.com/docs/v3/Plugins/Flip/ ; SplitText https://gsap.com/docs/v3/Plugins/SplitText/ ; React flushSync https://react.dev/reference/react-dom/flushSync .


## CSS-first review: подход Кевина Пауэлла для Ryze (18.11.2026)

**Источник интерпретации:** это наш вывод на основе публичных материалов Кевина Пауэлла, а не его личное ревью Ryze. Он подчёркивает responsive layout, предсказуемость каскада, поиск корневой причины вместо CSS-заплаток и progressive enhancement:
- https://www.kevinpowell.co/article/dealing-with-the-webiness-of-css/
- https://www.kevinpowell.co/article/jumping-the-shark/
- https://www.w3.org/WAI/WCAG22/Techniques/css/C39

### Standards / CSS-first
1. **Базовое состояние без движения:** Hero, H1, CTA, меню и пояснения доступны с первого кадра. Отказ от \`main.inert\` и hiding CSS \`[data-intro="playing"]\` как механизма ожидания WebGL. Сначала отрисовка, после неё необязательный эффект; JS никогда не владеет доступностью смысла.
2. **CSS — раскладка и простой отклик:** flex/grid/intrinsic \`minmax\`, \`clamp\`, \`svh/dvh\`, @container для локальных размеров, \`transition\` на \`transform/opacity\`. Не задавать responsive-сдвиги через GSAP там, где их естественно решает CSS. Вписывать новые правила в существующие @layer и custom properties, без \`!important\`, лишних outline/shadow и нового визуального языка.
3. **GSAP — только сложная хореография:** текущие \`timeline\` и \`context\` сохранить; \`gsap.matchMedia\` ограничить созданием/cleanup GSAP эффектов по условиям viewport/reduced. Один motion driver на область, без одновременного CSS и GSAP tween одного свойства.
4. **Flip — условный:** сначала реальная широкая CTA и её устойчивое состояние на CSS/React; затем сравнить с GSAP Flip для геометрического морфа. Реакция на изменение размера контейнера определяется его размером, а не типом устройства. Состояние поля, focus, Escape и keyboard первичнее визуальной трансформации.
5. **SplitText — скорее отказаться:** H1 уже содержит две утверждённые span-строки. Сначала CSS masking + текущий stagger; SplitText только если отдельный Storybook POC докажет улучшение при font-load/resize/zoom без переписывания DOM или потери accessible name.
6. **Не добавлять новое ради примера:** \`@gsap/react\` можно обойти \`gsap.context\` и существующим cleanup. Отдельный plugin и абстракция допустимы лишь после воспроизводимой потребности.

### Spec / поведение и QA
- Проверить JS-off, WebGL error/slow/disabled, forced reduced-motion, переключение preference во время tween и интерактивность CTA до сборки логотипа.
- Проверить 320, 390, Duo 490/951, 699→700, 799→800, 1024, 1440, 1920 и короткий landscape; менять **ширину контейнера**, а не только viewport. На 200% zoom не должны возникать горизонтальные скроллы, недоступная CTA, переполнение текста.
- Проверить CTA по цепочке open→input→submit→result→edit→close, быстрые повторения и переход 799↔800 без потери введённого домена или фокуса.
- Сравнивать исходный CSS вариант и новые POC side-by-side в Storybook; реальный режим без JS тестировать отдельно, так как Storybook сам нуждается в JS.
- Не менять внешний вид утверждённой верстки, не мешать исходные motion-изменения других исполнителей. При одинаковом визуальном и UX-качестве выбрать меньшую и более предсказуемую реализацию.

**Итог решения:** first paint и доступность через семантику+CSS, координация через уже существующий GSAP timeline, matchMedia для cleanup, Flip/SplitText только после сравнительных тестов. ScrollTrigger и другие плагины вне этапа. Этот раздел — предварительное design/engineering review, никаких тестов и изменений кода им не подтверждено.


## Верифицированные веб-референсы GSAP для Ryze (18.11.2026)

**Сфера:** реальные публичные сайты и опубликованные авторами технические кейсы, отобранные для CSS-first + GSAP DOM + optional WebGL, responsive/reduced motion, Flip и SplitText. Это разные частичные соответствия, а не утверждение, что все сайты полностью воспроизводят наши четыре режима или гарантируют CTA доступной в первый кадр. Код Ryze не менялся; измерений сайтов инструментами браузера нет.

1. **Arnaud Rocca — близкий архитектурный эталон.** https://arnaudrocca.fr/ . Авторский кейс https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/ . Nuxt static-generation + GSAP/SplitText + OGL WebGL. Автор конкретно описывает fallback без JS (HTML/CSS), замену WebGL cross-fade для reduced motion, `gsap.matchMedia()`, обработчики hover с focus и проверку экранным диктором. Перенять: содержимое и навигация существуют независимо от WebGL; reduced и no-JS без потери смысла; собственный Canvas слой. Не перенимать: сложный slider/navigation, OGL миграцию.
2. **Flim (ToyFight) — наиболее полезный коммерческий/product референс.** https://flim.ai/ ; авторский разбор https://tympanus.net/codrops/2026/01/14/a-site-for-sore-eyes-combining-gsap-and-webflow-to-showcase-flim/ . GSAP labels/timelines, SplitText responsive line masking, Flip для переноса изображений в mock UI, `gsap.matchMedia()` и мобильное отключение desktop pinned scroll. Перенять: осмысленное раскрытие реального продукта, transition в UI, независимое mobile поведение. Не перенимать: физику/Rapier и scroll pinning на данном этапе.
3. **Trionn — GSAP/Three.js интеграция и слои, не эталон незаблокированного Hero.** https://trionn.com/ ; авторский разбор https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/ . Next/React, `useGSAP()`, `gsap.matchMedia()`, SplitText, Three.js отдельно от DOM заголовка и CTA. Перенять: разделение DOM/WebGL ответственности, scoped lifecycle, cleanup и адаптивные линии. Ограничение: автор прямо использует `transitionReady` и задержку перед reveal, поэтому **не** рассматривать сайт как доказательство немедленной доступности контента; избегать Web Audio/scroll hijack.
4. **Joffrey Spitzer — точный эталон Flip и адаптивной типографики.** https://joffreyspitzer.com/ ; авторский кейс https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/ . Astro static generation, GSAP Flip меняет положение и геометрию nav link→title и list→grid, SplitText `autoSplit + onSplit`, understated motion. Перенять: принцип непрерывности между состояниями, сравнение CSS и Flip для CTA, аккуратный line-mask. Не копировать preloader и длительную анимацию смены страниц в Hero.
5. **Maxima Therapy — React GSAP lifecycle + разделение интерактивной сцены.** https://maximatherapy.com/ ; технический разбор https://tympanus.net/codrops/2026/04/06/building-the-maxima-therapy-website-react-gsap-and-dabbling-with-ai/ . Static-generated React Router, `useGSAP` cleanup, интерактивная hero wheel и отдельный layout для route-changing content, видимая секция интерактивна. Перенять: разделение жизненного цикла главной сцены и меняющегося контента, stop on transition. Не добавлять `@gsap/react` только потому, что в кейсе оно используется; наш `gsap.context` уже есть.
6. **4WIDE — коммерческий баланс выразительности и читаемости.** https://4wide.jp/ ; кейс https://tympanus.net/codrops/2026/04/23/building-4wide-turning-distortion-blur-and-motion-into-a-coherent-experience/ . Сайт студии на Astro + GSAP + Three.js, автор описывает приоритет ясного сообщения наряду с фирменной визуальной подачей. Перенять: ограничение области и интенсивности шейдерного акцента, не конкурентного H1. Не перенимать screen distortion/blur поверх товарного текста.

**Матрица приоритетов для Ryze:** P0/no-JS/reduced Arnaud; product interface Flim; layering and responsive Next/React Trionn; CTA Flip & H1 Joffrey; lifecycle Maxima; restrained business brand 4WIDE. Каждый пример требует отдельного теста до переноса, но уже снабжён прямым сайтом и авторским разбором. Эти кейсы **не** являются доказательством measured FPS/INP/keyboard QA на сегодняшнюю дату.


## Flim.ai / ToyFight: глубинный разбор для Ryze (18.11.2026)

**Статус:** исследование, не решение о редизайне; никакой интеграции или реального тестирования сайта Flim на наших устройствах не производилось. Источники: живой https://flim.ai/ и MiroMiro browser extraction (Hero `section.hero-section`, intro `#intro-section`, Generate & Edit `section.section.generate-section`, Workflow `#cursor-trigger`; tokens); кейс разработчика ToyFight https://tympanus.net/codrops/2026/01/14/a-site-for-sore-eyes-combining-gsap-and-webflow-to-showcase-flim/ ; сайт студии https://toyfight.co/work/flim ; GSAP Flip https://gsap.com/docs/v3/Plugins/Flip/ .

### Установлено из кода/первичных материалов

- Flim Hero показывает крупный оффер, **видимый поисковый интерфейс** и визуальную галерею. Далее раскрывает платформу через четыре связки: поиск / базу референсов, AI-инструменты и Generate & Edit, Workflow (Save/Collaborate/Share). Отдельно используется шлейф изображений как доказательство назначения платформы. На странице также есть trust strip, но его фактическая применимость к Ryze не установлена.
- ToyFight документирует GSAP Timeline с labels, SplitText line masks, GSAP Flip, responsive matchMedia, Lottie, Rapier и Lenis. В секции What Is Flim изображения буквально **переходят из свободной композиции внутрь макета интерфейса** через `Flip.getState` / DOM-state change / `Flip.from`, активируемые ScrollTrigger. На телефоне для горизонтального скролл-контейнера используется иной режим вместо desktop pinned scroll.
- MiroMiro выявил на живой странице `#141414`, `#fecc33`, `#21935b` среди цветов и семейства `Swizzy` и `PP Neue Montreal Mono` в CSS; это **данные конкретной страницы**, не обязательная palette/brand spec. Найдено много плотных значений и breakpoint-правил, поэтому пересадка токенов на Ryze нецелесообразна. В Hero присутствует отдельный `header-animation.mp4` и AVIF изображения.
- Идея ограничивать единый источник изменения свойств подтверждается самим кейсом: ToyFight намеренно убивают старые циклические timeline при прерывании, чтобы они не конкурировали.

### Решение по ROI от механизма, а не визуальной похожести (Business Engineer: bottleneck / value demonstration, как аналитическая линза)

**Гипотеза:** для первого посещения Ryze ограничителем понимания/доверия является не нехватка красивых эффектов, а недостаток конкретной демонстрации того, что получает владелец Shopify. У Flim роль наглядного доказательства играют поисковое поле и реальные примеры библиотеки. У Ryze эквивалент — понятная операция AI-маркетолога и настоящий UI, а не творческий фотоколлаж. Это гипотеза, **не доказанный результат пользовательского теста или конверсионный эффект**.

**P1 / Точно стоит адаптировать (после существующего P0 разблокировки Hero):**
1. **Product proof:** после срабатывания уже существующего `HeroAction` показывать один компактный, честно помеченный *demo* сценарий: `Shopify domain → выбранная область (Ads/SEO/AI visibility/CRO) → один пример действия → доступная для проверки точка результата`. Основа — только согласованные настоящие скриншоты Ryze; не придумывать реальные метрики или выполнение анализа пользовательского магазина. Текущая реализация после `thinking` показывает текстовое сообщение про возможности, но **не экран продукта**.
2. **Visual transformation:** отдельная настоящая Storybook POC, где один заранее одобренный скрин/медиа карточка меняет положение и становится частью макета Ryze UI. CSS-first статическая и reduced версия показывает этот экран без анимации. Сначала тест CSS, потом сравнение с Flip. Не активировать существующие 12 Canvas медиа-карточек `SHOW_MEDIA_CARDS=false` и не менять 3D-вступление без отдельного решения.
3. **Choreography / interrupt:** использовать уже имеющиеся `MOTION` tokens, текущие timeline/context и контроль конфликта анимаций. Мобильная версия не обязана иметь ту же траекторию, но обязана сохранить тот же смысл и контент. Существующий CTA и drawer не нужно копировать с Flim.

**P2 / Проба, не обязательное внедрение:**
4. **Line mask reveal** только для H1/подзаголовков при подтверждённом преимуществе над существующими `span`, с font-load, resize, 200% zoom и screen-reader QA. Не воспроизводить character-stagger Flim на каждом элементе.
5. **Конкретные микропереходы** между состояниями Mini Demo, только с обратимостью и без ожидания завершения декорации; проверить Keyboard/Escape/reduced.

**Не копировать сейчас:** желтый/зеленый визуальный стиль и чужие шрифты, Webflow, Lenis/smooth-scroll, Rapier physics, бесконечные медиа-циклы, глаза за курсором (у нас уже Rizzie), pinned ScrollTrigger, мегаколлаж, якобы реальные показатели заказчика. В Flim сам продукт — медиатека, у Ryze — автоматизация, значит визуальный носитель должен отражать механизм последней.

### Минимальный протокол перед интеграцией

1. Согласовать **один** реальный экран Ryze, один истинный исходный формат медиа и один короткий сценарий; право выбора ассетов остаётся за дизайнером, не за агентом. Не засорять проект десятками новых неутверждённых материалов.
2. Storybook variants: исходный Hero/CTA, статичный Product Proof, CSS переход, Flip переход (optional). Сохранить copy, H1, CTA и реальные компоненты.
3. Проверить `390×844`, `874×402`, `1440×900`, `1920×1080`, интервал 799↔800, reduced/static/lightweight/full и 200% zoom; при вводе домена, resize, Escape, повторном запуске отсутствие потери формы/фокуса.
4. A/B оценить **понимание**, а не субъективную эффектность: после первого взгляда может ли зритель назвать конкретное действие Ryze, чем отличается демо от реального подключения, и где начинается взаимодействие. Измерения FPS/CLS/INP вести отдельно, только при реальном browser trace.
5. До отдельного утверждения не изменять source, не создавать новые ветви, Issue, CI или публичный деплой. Текущий план находится в `docs/spec/gsap-motion-integration-2026-11-18.md`.

**Результат оценки:** наибольшая полезность у способа Flim **визуально доказывать функцию продукта** и у изолированного Flip для одной осмысленной метаморфозы. Наименьшая — у переноса их широкого набора визуальных технологий.
