import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import IntegrationLogos, { type IntegrationPreviewMode } from "./IntegrationLogos";

type Controls = {
  mode: IntegrationPreviewMode;
  theme: "dawn" | "dusk";
};

const meta = {
  title: "RYZE/Integrations",
  parameters: { layout: "fullscreen" },
  args: { mode: "auto", theme: "dusk" },
  argTypes: {
    mode: { name: "Mode", control: "select", options: ["auto", "static", "webgl"] },
    theme: { name: "Theme", control: "radio", options: ["dawn", "dusk"] },
  },
  render: ({ mode, theme }) => (
    <div
      data-theme={theme}
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "var(--color-background)",
        color: "var(--color-foreground)",
      }}
    >
      <div style={{ width: "min(100%, 358px)" }}>
        <IntegrationLogos key={mode + theme} previewMode={mode} />
      </div>
    </div>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = { name: "Preview" };
