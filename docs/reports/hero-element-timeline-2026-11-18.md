# Ryze Hero: текущий таймлайн появления элементов (2026-11-18)

Измерения: Chrome Playwright на Titan, 1440×900, обычная анимация (не reduced-motion). Старт отсчёта: событие DOMContentLoaded родительской страницы. Приватный локальный предпросмотр http://100.110.158.49:8793/, ветка main. События записаны в docs/notes/hero-element-timing-probe.json.

| Время от открытия | Событие | Источник |
|---|---|---|
| 0.00 c | DOM готов. Hero и навигация скрыты (opacity=0), пока не придёт intro-complete | HeroWithNavigation.tsx/CSS |
| ~0.60 c | Canvas запускает сборку 118 SVG-фрагментов | ryze-canvas/index.html |
| ~2.25 c | Срабатывает сигнал cards-start, но карточки отключены переключателем SHOW_MEDIA_CARDS=false | index.html, orbit.js, main.js |
| ~4.66 c | Фрагменты собраны: ryze:assembled | index.html |
| 4.67–6.05 c | Превращение собранного логотипа в круг, продолжительность 1.35 c | index.html |
| ~6.05 c | Круг готов: ryze:circle | index.html |
| 6.05–6.78 c | Круг уменьшается/исчезает, GSAP duration .72 c | src/main.js |
| ~6.78 c | postMessage ryze:intro-complete, parent data-intro=ready | src/main.js, HeroWithNavigation.tsx |
| 6.78–7.46 c | Одновременно проявляются: Ryze бренд, H1, lead, описание, Rizzie, CTA, подпись и логотипы платформ; header/navigation | HeroWithNavigation.module.css (.68 c) |
| 6.78–7.26 c | Canvas подложка затухает, CSS duration .48 c | HeroWithNavigation.module.css |
| 6.78–7.46 c | Отдельная desktop cookie-панель тоже проявляется за .68 c, если показывается пользователю | page.module.css |
| ~7.58 c | В конкретном прогоне зафиксировано transitionend у nav; дрейф из-за браузера | timeline probe |

Нет последовательного stagger по элементам Hero. В исходном DOM они есть сразу, но opacity всего контейнера равна 0 до завершения заставки.

Фактические события в одном прогоне от DOM parent: iframe ready +0.595 с; cards-start +2.245; assembled +4.664; melting +4.668; circle +6.054; intro-complete +6.785; nav transitionend +7.581.

Независимое поведение после входа: анимация интеграционных логотипов циклическая, длительности 1.8/1.62/2.02/1.74/1.92 c, пауза .36 c на логотип; суммарный цикл 10.9 c, запуск не синхронизирован с общим reveal. Rizzie может случайно перемещаться спустя 30–60 секунд, если выполнены условия видимости/режима/отсутствия взаимодействия.

Reduced motion: Canvas не монтируется, Hero становится видим сразу. Без JS: предусмотрен noscript fallback. Ошибка загрузки iframe: watchdog раскрывает Hero через 24 с. Тайминги могут отличаться на разных устройствах из-за загрузки и рендеринга.

Не вносились изменения в CSS/JS или GitHub. Исследование и файл docs/notes/hero-element-timing-probe.json сохраняются локально.
