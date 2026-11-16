import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";
import IntegrationLogos, { type IntegrationPreviewMode } from "./IntegrationLogos";
import styles from "./IntegrationLogos.stories.module.css";

type Theme = "dawn" | "dusk";
type RenderedMode = "static" | "marquee" | "webgl";

const descriptions: Record<IntegrationPreviewMode, string> = {
  auto: "Реальная автоматическая логика: WebGL, CSS-marquee при отказе GPU, статический набор при reduced motion.",
  static: "Исходный семантический HTML: все пять логотипов одновременно, без Canvas и анимации.",
  reduced: "Тот же статический результат, что при prefers-reduced-motion: reduce; Storybook сам требует JavaScript.",
  marquee: "Облегчённое CSS-представление при отсутствии WebGL или медленном рендеринге.",
  webgl: "Настоящий WebGL-морфинг из 3200 частиц. Если WebGL недоступен, компонент сам переключится на marquee.",
};

const modeLabel: Record<RenderedMode, string> = {
  static: "Static · 5 логотипов",
  marquee: "CSS marquee · 12 секунд",
  webgl: "WebGL · 3200 частиц",
};

function Stage({ mode, theme }: { mode: IntegrationPreviewMode; theme: Theme }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState<RenderedMode>("static");

  useEffect(() => {
    const host = previewRef.current?.querySelector<HTMLElement>("[data-mode]");
    if (!host) return;
    const readMode = () => {
      const value = host.dataset.mode;
      if (value === "static" || value === "marquee" || value === "webgl") setActual(value);
    };
    readMode();
    const observer = new MutationObserver(readMode);
    observer.observe(host, { attributes: true, attributeFilter: ["data-mode"] });
    return () => observer.disconnect();
  }, [mode, theme]);

  return (
    <section ref={previewRef} data-theme={theme} className={styles.stage}>
      <div className={styles.preview}>
        <IntegrationLogos key={mode} previewMode={mode} />
      </div>
      <div className={styles.information}>
        <strong>IntegrationLogos</strong>
        <span>5 платформ · реальный размер 88 × 64 px</span>
        <span className={styles.status} role="status">Фактический режим: {modeLabel[actual]}</span>
        <p>{descriptions[mode]}</p>
      </div>
    </section>
  );
}

function RuntimeLab() {
  const [mode, setMode] = useState<IntegrationPreviewMode>("auto");
  const [theme, setTheme] = useState<Theme>("dusk");
  const [restart, setRestart] = useState(0);

  return (
    <div className={styles.lab}>
      <div className={styles.controls}>
        <label>
          <span>Режим</span>
          <select value={mode} onChange={(event) => setMode(event.target.value as IntegrationPreviewMode)}>
            <option value="auto">Автоматически</option>
            <option value="static">01 · Static / HTML</option>
            <option value="reduced">02 · Reduced motion</option>
            <option value="marquee">03 · CSS marquee</option>
            <option value="webgl">04 · WebGL</option>
          </select>
        </label>
        <label>
          <span>Тема</span>
          <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>
            <option value="dusk">Dusk</option>
            <option value="dawn">Dawn</option>
          </select>
        </label>
        <button type="button" onClick={() => setRestart((value) => value + 1)}>
          Перезапустить
        </button>
      </div>
      <Stage key={mode + "-" + theme + "-" + restart} mode={mode} theme={theme} />
      <p className={styles.caveat}>
        Переключатели выбирают настоящие ветки компонента. WebGL может перейти на CSS-marquee;
        браузерный режим без JavaScript проверяется вне Storybook.
      </p>
    </div>
  );
}

const meta = {
  title: "RYZE/Integrations",
  component: IntegrationLogos,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Изолированные состояния реального IntegrationLogos из ryze-challenge. Исходный компонент остаётся static-first; в приложении автоматическое определение возможностей не менялось. Демонстрационные режимы доступны только через необязательный previewMode.",
      },
    },
  },
} satisfies Meta<typeof IntegrationLogos>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {
  name: "01 · Static / HTML without JS",
  render: () => <Stage mode="static" theme="dusk" />,
};

export const ReducedMotion: Story = {
  name: "02 · Reduced motion",
  render: () => <Stage mode="reduced" theme="dusk" />,
};

export const Marquee: Story = {
  name: "03 · No WebGL / lightweight marquee",
  render: () => <Stage mode="marquee" theme="dusk" />,
};

export const WebGL: Story = {
  name: "04 · Full WebGL morph",
  render: () => <Stage mode="webgl" theme="dusk" />,
};

export const Dawn: Story = {
  name: "05 · Dawn theme",
  render: () => <Stage mode="webgl" theme="dawn" />,
};

export const Dusk: Story = {
  name: "06 · Dusk theme",
  render: () => <Stage mode="webgl" theme="dusk" />,
};

export const ThemeComparison: Story = {
  name: "07 · Dawn / Dusk comparison",
  render: () => (
    <div className={styles.comparison}>
      <div>
        <h2>Dawn</h2>
        <Stage mode="auto" theme="dawn" />
      </div>
      <div>
        <h2>Dusk</h2>
        <Stage mode="auto" theme="dusk" />
      </div>
    </div>
  ),
};

export const RuntimeSwitching: Story = {
  name: "08 · Interactive modes & themes",
  render: () => <RuntimeLab />,
};
