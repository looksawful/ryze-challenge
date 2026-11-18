import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";
import type { ButtonSize, ButtonVariant } from "./Button";

type Controls = {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  label: string;
};

const meta = {
  title: "Design System/Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    status: "review",
    docs: {
      description: {
        component: "The production Button component. Use Playground for supported props and States for default, hover, pressed, busy and disabled appearances. This is the library primitive; the Hero CTA is documented separately as HeroAction. Copy and product promises are not changed here.",
      },
    },
  },
  args: {
    variant: "primary",
    size: "regular",
    disabled: false,
    label: "Continue",
  },
  argTypes: {
    variant: { control: "radio", options: ["primary", "secondary"], description: "Visual prominence" },
    size: { control: "radio", options: ["regular", "compact"], description: "Size supported by the live component" },
    disabled: { control: "boolean", description: "Prevents interaction" },
    label: { control: "text", description: "Visible button label for this demo" },
  },
  render: ({ label, variant, size, disabled }) => (
    <div style={{ display: "grid", placeItems: "center", minBlockSize: "18rem" }}>
      <Button variant={variant} size={size} disabled={disabled}>{label}</Button>
    </div>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)", maxInlineSize: "48rem" }}>
      <p style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
        Hover and pressed examples use the production visual-state hooks. Tab to a button to inspect actual keyboard focus.
        Busy is an accessibility state, not a fake spinner.
      </p>
      {(["primary", "secondary"] as const).map(variant => (
        <section
          key={variant}
          data-theme={variant === "primary" ? "dawn" : "dusk"}
          style={{ display: "grid", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--color-surface)", color: "var(--color-foreground)" }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>{variant}</h2>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <Button variant={variant}>Default</Button>
            <Button variant={variant} data-visual-state="hover">Hover</Button>
            <Button variant={variant} data-visual-state="pressed">Pressed</Button>
            <Button variant={variant} aria-busy="true">Preparing…</Button>
            <Button variant={variant} disabled>Disabled</Button>
          </div>
        </section>
      ))}
      <section style={{ display: "grid", gap: "var(--space-3)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Compact and long labels</h2>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <Button size="compact">Preview experience</Button>
          <Button size="compact" variant="secondary">Customize cookie settings</Button>
        </div>
      </section>
    </div>
  ),
};
