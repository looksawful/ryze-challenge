import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/foundation.css";
import "./storybook-canvas.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      toolbar: { icon: "circlehollow", items: ["dawn", "dusk"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "dusk" },
  decorators: [
    (Story, context) => (
      <div
        data-theme={context.globals.theme === "dawn" ? "dawn" : "dusk"}
        style={{
          minHeight: "100svh",
          boxSizing: "border-box",
          padding: context.parameters.layout === "fullscreen" ? 0 : "var(--space-6)",
          background: "var(--color-background)",
          color: "var(--color-foreground)",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["Design System", ["Foundations", "Components", "Patterns", "Screens"]],
      },
    },
    viewport: {
      options: {
        phoneCompact: { name: "Compact 320 × 568", styles: { width: "320px", height: "568px" }, type: "mobile" },
        phoneStandard: { name: "Phone 390 × 844", styles: { width: "390px", height: "844px" }, type: "mobile" },
        phone: { name: "Mobile 402 × 874", styles: { width: "402px", height: "874px" }, type: "mobile" },
        phoneLandscape: { name: "Landscape 874 × 402", styles: { width: "874px", height: "402px" }, type: "mobile" },
        duoClosed: { name: "Duo Closed 466 × 678", styles: { width: "466px", height: "678px" }, type: "mobile" },
        duoOpen: { name: "Duo Open 951 × 669", styles: { width: "951px", height: "669px" }, type: "tablet" },
        ipad: { name: "iPad 1024 × 1366", styles: { width: "1024px", height: "1366px" }, type: "tablet" },
        ryzeLaptop: { name: "Laptop 1366 × 768", styles: { width: "1366px", height: "768px" }, type: "desktop" },
        ryzeLaptopMedium: { name: "Laptop 1440 × 900", styles: { width: "1440px", height: "900px" }, type: "desktop" },
        ryzeLaptopWide: { name: "Laptop 1920 × 960", styles: { width: "1920px", height: "960px" }, type: "desktop" },
        wide: { name: "Desktop 2803 × 1024", styles: { width: "2803px", height: "1024px" }, type: "desktop" },
      },
    },
  },
};

export default preview;
