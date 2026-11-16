import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/foundation.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Surface color context",
      toolbar: { icon: "circlehollow", items: ["dawn", "dusk"] },
    },
  },
  initialGlobals: { theme: "dusk" },
  decorators: [
    (Story, context) => (
      <div data-theme={context.globals.theme === "dawn" ? "dawn" : "dusk"}
        style={{
          background: "var(--color-background)",
          color: "var(--color-foreground)",
          minHeight: "100vh",
          padding: context.parameters.layout === "fullscreen" ? 0 : "2rem",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
};

export default preview;
