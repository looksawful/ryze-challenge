import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import IntegrationLogos, { type IntegrationPreviewMode } from "./IntegrationLogos";

type Controls = {
  mode: IntegrationPreviewMode;
};

const meta = {
  title: "Design System/Components/Integrations",
  parameters: { layout: "fullscreen" },
  args: { mode: "auto" },
  argTypes: {
    mode: { name: "Mode", control: "select", options: ["auto", "static"] },
  },
  render: ({ mode }, context) => (
    <div
      data-theme={context.globals.theme === "dawn" ? "dawn" : "dusk"}
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
        <IntegrationLogos key={mode + context.globals.theme} previewMode={mode} />
      </div>
    </div>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = { name: "Preview" };
