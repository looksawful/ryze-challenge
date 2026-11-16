# Ryze Challenge · Storybook интеграций
Дата: 2026-11-16
Репозиторий: looksawful/ryze-challenge, локальная ветка dev.
Статус: разработка превью, без отдельного Storybook и без изменений Figma / prod.

## Реализовано
- Созданы `src/features/integrations/IntegrationLogos.stories.tsx` и локальные стили превью.
- Восемь историй зарегистрированы в одном действующем Storybook, раздел `RYZE/Integrations`:
  `Static`, `ReducedMotion`, `Marquee`, `WebGL`, `Dawn`, `Dusk`, `ThemeComparison`, `RuntimeSwitching`.
- Каждая история использует действующий `IntegrationLogos`, не копию, и реальные ассеты пяти платформ.
- Для обзора добавлен необязательный `previewMode`. **При отсутствии пропса** автоматическое поведение страницы не изменено.
- Static/Reduced используют настоящую статическую DOM-ветку; Marquee — существующую CSS-анимацию; WebGL — реальную GPU-попытку с существующим fallback. При системной настройке reduced motion анимация не запускается.
- Интерактивный просмотр позволяет менять режим, тему и перезапускать компонент; отображается фактический `data-mode`, а не предполагаемый.

## Проверка
- Целевой тест `node --test scripts/integration-logos.test.mjs`: 5/5 PASS (первый RED с отсутствующим story, затем GREEN).
- `npm run typecheck`: PASS.
- `npm run build-storybook`: PASS.
- Живой Storybook `http://127.0.0.1:6007/index.json`: обнаружены все 8 историй.
- Основная история: `http://127.0.0.1:6007/?path=/story/ryze-integrations--runtime-switching`.

## Границы
- Сам Storybook требует JavaScript: история Static иллюстрирует то же HTML/CSS-состояние, но не заменяет реальную проверку браузера с отключённым JS.
- WebGL-история не симулирует графический адаптер: при невозможности создать настоящий контекст показывает Marquee. Подпись фактического режима отражает этот переход.
- Не проводились ручные проверки физического iPhone/Safari, GPU FPS/энергопотребления, пиксельной точности.
- Не переносились стили/компоненты из `awful-homework`, не менялись другие компоненты, Figma, Asana, настройки Windows и prod.
- Права и финальная визуальная приёмка логотипов остаются в Issue #15 / #16.
