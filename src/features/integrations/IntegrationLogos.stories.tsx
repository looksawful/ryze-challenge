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
    docs: {
      description: {
        component: "Five production platform logos and their real caption. Auto uses the actual WebGL/progressive-enhancement behavior; Static shows all logos without WebGL. Static also serves reduced motion and unsupported browsers. Storybook cannot prove no-JavaScript rendering; check that on the actual site.",
      },
    },
  },
  args: { previewMode: "auto" },
  argTypes: {
    previewMode: { name: "Preview mode", control: "select", options: ["auto", "static"], description: "Only modes exposed by the real component. WebGL is capability-dependent." },
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
  parameters: { docs: { description: { story: "Guaranteed list of all five logos and caption, without the particle renderer." } } },
};
