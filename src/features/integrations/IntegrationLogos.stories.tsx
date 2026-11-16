import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import IntegrationLogos, { type IntegrationPreviewMode } from "./IntegrationLogos";

type Controls = {
  mode: Exclude<IntegrationPreviewMode, "reduced">;
  theme: "dawn" | "dusk";
};

const meta = {
  title: "RYZE/Integrations",
  parameters: { layout: "fullscreen" },
  args: { mode: "auto", theme: "dusk" },
  argTypes: {
    mode: { name: "Mode", control: "select", options: ["auto", "static", "marquee", "webgl"] },
    theme: { name: "Theme", control: "radio", options: ["dawn", "dusk"] },
  },
  render: ({ mode, theme }) => (
    <div
      data-theme={theme}
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--color-background)",
        color: "var(--color-foreground)",
      }}
    >
      <IntegrationLogos key={mode + theme} previewMode={mode} />
    </div>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = { name: "Preview" };
