import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Typography } from "./Typography";

type Controls = ComponentProps<typeof Typography> & { width: number };

const meta = {
  title: "Design System/Foundations/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    status: "review",
    docs: {
      description: {
        component: "The production Typography primitive uses the real --font-heading, --font-body and --type-* CSS tokens. Playground controls the actual component props plus a story-only maximum line width. Compare dawn/dusk with the toolbar and responsive wrapping via Viewport. Source tokens, not a parallel Storybook type scale, determine the visual result.",
      },
    },
  },
  args: {
    variant: "heading",
    as: "h1",
    children: "AI autopilot for your Shopify",
    width: 620,
  },
  argTypes: {
    variant: { control: "select", options: ["heading", "lead", "paragraph"] },
    as: { control: "select", options: ["h1", "h2", "h3", "p", "span"], description: "Semantic HTML element" },
    children: { control: "text", description: "Real text content" },
    width: { control: { type: "range", min: 240, max: 1000, step: 20 }, description: "Story-only max width, in CSS pixels; viewport still constrains it" },
  },
  render: ({ variant, as, children, width }) => (
    <div style={{ inlineSize: "100%", maxInlineSize: width }}>
      <Typography as={as} variant={variant}>{children}</Typography>
    </div>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <section style={{ display: "grid", gap: "var(--space-8)", maxInlineSize: "65ch" }}>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>Heading</p>
        <Typography as="h2" variant="heading">AI autopilot for your Shopify</Typography>
      </div>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>Lead</p>
        <Typography as="p" variant="lead">A new way to grow your store.</Typography>
      </div>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>Paragraph</p>
        <Typography as="p" variant="paragraph">Paid ads, SEO, AI visibility &amp; CRO. One AI autopilot built around your business.</Typography>
      </div>
    </section>
  ),
};
