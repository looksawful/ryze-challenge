# RYZE Challenge · Integrations Storybook
Дата: 2026-11-16. Один Storybook, ветка dev.

## Текущий результат
- Раздел `RYZE/Integrations`: **одна история `Preview`** (`ryze-integrations--preview`).
- В стандартной панели Storybook Controls два аргумента: `Mode = auto | static | marquee | webgl` (по умолчанию auto) и `Theme = dawn | dusk` (по умолчанию dusk).
- Размер экрана регулируется штатным Viewport Storybook.
- Превью рендерит реальный `IntegrationLogos`. Обычная страница не передаёт `previewMode` и продолжает использовать автоматическую деградацию.
- Reduced motion показывает static через существующий `prefers-reduced-motion`; не выделяется в отдельную историю.
- WebGL действительно инициализируется; при неподдерживаемом окружении срабатывает реальный marquee fallback.
- Удалены 7 лишних историй, пользовательский UI переключения, информационная панель, CSS-модуль, кнопка перезапуска.
- Это упрощение предыдущей версии с 8 историями в commit `eb033b5`; решение пользователя: **одна история с Controls, не набор отдельных страниц**.

## Проверки
- `node --test scripts/integration-logos.test.mjs`: 5/5 PASS (RED → GREEN при смене структуры).
- `npm run typecheck`: PASS.
- `npm run build-storybook`: PASS.
- Собранный `storybook-static/index.json`: ровно 1 история `RYZE/Integrations`.
- Живой `http://127.0.0.1:6007/index.json`: ровно 1 история.
- Адрес: `http://127.0.0.1:6007/?path=/story/ryze-integrations--preview`.

## Ограничения
- Storybook требует JS: Static лишь показывает HTML/CSS-представление, не тестирует браузер с отключённым JS.
- Проверка на физическом iPhone/Safari и аппаратный GPU/FPS не выполнялась в рамках этой правки.
- Нет правок Figma, других компонентов, `prod`, Asana или системных настроек. Другие незакоммиченные изменения в локальной dev-копии оставлены без изменений.
