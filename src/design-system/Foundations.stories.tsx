import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const colors = ["--accent-current", "--color-background", "--color-foreground", "--color-surface", "--color-muted", "--color-border"] as const;
const spacing = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-6", "--space-8", "--space-12"] as const;

const meta = { title: "Design System/Foundations/Tokens", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxInlineSize: "48rem" }}>
      {colors.map(token => (
        <div key={token} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <span aria-hidden="true" style={{ inlineSize: "3.5rem", blockSize: "3.5rem", flexShrink: 0, background: "var(" + token + ")", border: "1px solid var(--color-border)" }} />
          <code>{token}</code>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxInlineSize: "48rem" }}>
      {spacing.map(token => (
        <div key={token} style={{ display: "grid", gridTemplateColumns: "8rem 1fr", alignItems: "center", gap: "var(--space-4)" }}>
          <code>{token}</code>
          <span aria-hidden="true" style={{ display: "block", inlineSize: "var(" + token + ")", blockSize: "1rem", background: "var(--accent-current)" }} />
        </div>
      ))}
    </div>
  ),
};
