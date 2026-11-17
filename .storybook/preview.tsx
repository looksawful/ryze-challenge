import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/foundation.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Component theme",
      toolbar: { icon: "circlehollow", items: ["dawn", "dusk"] },
    },
  },
  initialGlobals: { theme: "dusk" },
  decorators: [
    (Story, context) => (
      <div
        data-theme={context.globals.theme === "dawn" ? "dawn" : "dusk"}
        style={{
          background: "var(--color-background)",
          color: "var(--color-foreground)",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
};

export default preview;
