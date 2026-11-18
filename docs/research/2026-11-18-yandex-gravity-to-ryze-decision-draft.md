# Ryze × Yandex Gravity UI — схема применения (проект решения)

Дата: 2026-11-18. Статус: **предложение, не утверждённое изменение дизайна**. Работа: Research / Taste / Wayfinder. Сайт и компоненты не изменены. Репозиторий: looksawful/ryze-challenge, main.

## Главное решение

**Заимствовать правила, а не устанавливать UIkit или Page Constructor и не копировать стиль Яндекса.** Ryze остаётся авторским лендингом: Karrik, Micro Grotesk, монохром, акцент #ff5af1, Rizzie, действующая композиция и 4 режима progressive enhancement. Не добавлять SaaS-градиенты, декоративные рамки, тени, generic cards или новый font stack.

## Проверенные факты

- Официальная Gravity UI Button выделяет уровни значимости, состояния default/hover/disabled/loading/selected, размеры XS/S/M/L/XL; XL предусмотрен для лендингов. Навигация между страницами — ссылка, операция — кнопка. https://gravity-ui.com/design/guides/button
- Gravity UI использует модуль 4px, изредка 2px для оптических микрокоррекций, ограниченное семейство spacing-токенов. https://gravity-ui.com/design/branding/module
- Gravity UI описывает 12/8/4-колоночную сетку, контейнеры и exclusion zones, но не требует копировать конкретную сетку в Ryze. https://gravity-ui.com/design/branding/grid-and-container
- Gravity UI разделяет Body/Caption/Header/Subheader/Display; разрешает менять шрифты по бренду. https://gravity-ui.com/design/branding/typography
- Gravity Page Constructor — отдельная библиотека декларативных блоков для промостраниц, не необходимая в существующем авторском React/Next проекте. https://gravity-ui.com/libraries/page-constructor
- Актуальный исходник Ryze: src/app/foundation.css уже содержит --space-1/2/3/4/6/8/12, --gutter, --content-width, шрифты, semantic dawn/dusk colors, motion tokens и глобальный :focus-visible. src/ui/Button.module.css уже содержит regular min-height 50px, compact 44px, hover/pressed и reduced-motion. src/ui/Typography.module.css содержит heading/lead/paragraph. Значит, не нужно дублировать системы.
- docs/reports/ryze-design-system-audit-2026-11-18.md — **исторический снимок**. Его наблюдения о Duo, ultrawide, ритме и Storybook требуют повторной проверки на свежем HEAD, не объявлять дефектами без ретеста.

## Решения к реализации после согласования

| Приоритет | Что сделать | Где | Критерий |
|---|---|---|---|
| P0 | Один коммерчески главный CTA в конкретном экране; названия обещают реальный следующий шаг (нынешний Start For Free запускает demo). Отдельно решить trial/signup vs demo, не менять контент без согласования | HeroAction.tsx / Hero.tsx | Предсказуемый переход, проверка клавиатурой и на устройстве |
| P1 | Выделить 3 **роли**, не набор красок: Hero action (собственная выразительная форма), standard action (Button), quiet/link action (Nav/служебные). Существующие размеры Hero 76/86px и landscape 50px оставить до визуального теста; regular 50px, compact 44px | ui/Button, HeroAction, SiteHeader | Единые состояния; нет случайных одинаково ярких CTA |
| P1 | Семантическая типографика Display/Heading, Lead, Body, Caption **через существующие Karrik/Micro**; вместо глобальной замены всех px согласовать роль и ритм каждого сценария | ui/Typography, foundation.css, Hero.module.css | Заголовки/пояснения одинаковы по смыслу в Storybook и на сайте, допускаются обоснованные оптические исключения |
| P1 | Системный ритм 4px как стартовая шкала. Уже существующие --space-* использовать в структурных отступах; оставлять локальные art-direction размеры по необходимости | foundation.css, Hero.module.css, HeroAction.module.css | Понятная связь headline → lead → description → CTA в каждой ширине, нет случайных провалов |
| P1 | Контейнерно-ориентированная адаптация: intrinsic Grid/Flex, max-width, minmax/clamp и исключения для 320, 390, 700, landscape 874×402, Duo 951×669, desktop 1440/1920/2400; не навязывать фиксированную сетку 12/8/4 во все устройства | Hero.module.css, SiteHeader.module.css | Нет наложений, горизонтального overflow и скачка бренда; верхний правый угол на desktop |
| P1 | Storybook отображает реальные визуальные стили: HeroAction без контекстных потерь селекторов; реальные dawn/dusk; keyboard, touch, disabled, loading, focus, Full/Lightweight/Reduced/Static | *.stories.tsx | Storybook соответствует реальному CTA |
| P2 | CSS отвечает за hover/focus/pressed (уже реализовано в Button); GSAP только для фирменных choreographed интро/переходов, не смешивая два драйвера одних transforms | CSS и src/motion/tokens.ts | Reduce-motion и no-JS сохраняют функциональность |

## Не переносить

Пакеты @gravity-ui/uikit и @gravity-ui/page-constructor, Inter, жёлтый Яндекс, копирование пиксельных размеров, все разновидности Yandex Button (raised/outlined) и системные боксы, shadows, декоративные обводки, SaaS-карточки. Существующие фокусные outline не удалять: это доступность, не украшение.

## Порядок

1. Сверить свежий Git/main и живые рендеры; сохранить чужие незакоммиченные изменения.
2. Зафиксировать дизайн-правила на существующих tokens/Storybook, не заводить альтернативный system source-of-truth.
3. Исправить Storybook parity и структурный ритм/Duo/ultrawide **после** воспроизведения на свежем HEAD.
4. Уточнить коммерческий CTA по реальному назначению, только после решения о trial vs demo.
5. Проверка: build, typecheck, component tests, CSS contracts, browser matrix Chrome/Yandex/Opera/Firefox/Safari Mac/Titan и реальное touch/iOS при наличии. Каждый неподтверждённый браузер отмечать как непроверенный.

## Не решено

Коммерческий маршрут Hero CTA: оставлять исследовательское демо с честной подписью `Try the demo` или переходить к реальному внешнему onboarding `Start free`? Поскольку docs/spec/hero.md требует локального демонстрационного сценария и запрещает неожиданный внешний переход, по умолчанию **сохраняем функциональность демо**; изменение копирайта и маршрута требует отдельного решения.

## Границы

Этот файл фиксирует предложение и источники. **Ни одна CSS/JS/Storybook правка этим исследованием не утверждена и не выполнена.** Не переносить старые worktree целиком и не выполнять публичный деплой.
