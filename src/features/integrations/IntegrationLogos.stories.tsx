import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import IntegrationLogos from "./IntegrationLogos";

type Controls = ComponentProps<typeof IntegrationLogos>;

const meta = {
  title: "Design System/Components/Integrations",
  component: IntegrationLogos,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    status: "review",

  },
  args: { previewMode: "auto" },
  argTypes: {
    previewMode: { name: "Preview mode", control: "select", options: ["auto", "static"] },
  },
  render: ({ previewMode }, context) => (
    <div
      data-theme={context.globals.theme === "dawn" ? "dawn" : "dusk"}
      style={{
        minBlockSize: "min(62svh, 28rem)",
        display: "grid",
        placeItems: "center",
        padding: "var(--space-4)",
        background: "var(--color-background)",
        color: "var(--color-foreground)",
      }}
    >
      <div style={{ inlineSize: "min(100%, 36rem)" }}>
        <IntegrationLogos key={previewMode + context.globals.theme} previewMode={previewMode} />
      </div>
    </div>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {};
export const Static: Story = {
  args: { previewMode: "static" },
  parameters: {  },
};
