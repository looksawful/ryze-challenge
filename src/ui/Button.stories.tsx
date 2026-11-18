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
  title: "RYZE/Foundations/Button",
  parameters: { layout: "centered" },
  args: {
    variant: "primary",
    size: "regular",
    disabled: false,
    label: "Continue",
  },
  argTypes: {
    variant: { control: "radio", options: ["primary", "secondary"] },
    size: { control: "radio", options: ["regular", "compact"] },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  render: ({ label, variant, size, disabled }) => (
    <Button variant={variant} size={size} disabled={disabled}>{label}</Button>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** One source component, inspected at rest and in its interaction states. */
export const States: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ display: "grid", gap: "1.5rem", maxWidth: "42rem" }}>
      <p style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
        Tab through the controls for real keyboard focus. Switch the OS motion preference
        to inspect reduced motion. The hover and pressed samples are static previews.
      </p>
      {(["primary", "secondary"] as const).map((variant) => (
        <section key={variant} style={{
          display: "grid", gap: "0.625rem",
          padding: variant === "primary" ? "1rem" : undefined,
          backgroundColor: variant === "primary" ? "#d9d9d9" : "transparent",
          color: variant === "primary" ? "#080808" : "inherit",
        }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>{variant}</h2>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <Button variant={variant}>Default</Button>
            <Button variant={variant} data-visual-state="hover">Hover</Button>
            <Button variant={variant} data-visual-state="pressed">Pressed</Button>
            <Button variant={variant} aria-busy="true">Preparing…</Button>
            <Button variant={variant} disabled>Disabled</Button>
          </div>
        </section>
      ))}
      <section style={{ display: "grid", gap: "0.625rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Compact and long labels</h2>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <Button size="compact">Preview experience</Button>
          <Button size="compact" variant="secondary">Customize cookie settings</Button>
        </div>
      </section>
    </div>
  ),
};
