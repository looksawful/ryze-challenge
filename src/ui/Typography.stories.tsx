import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Typography } from "./Typography";
import type { TypographyElement, TypographyVariant } from "./Typography";

type Controls = {
  variant: TypographyVariant;
  element: TypographyElement;
  text: string;
  width: number;
};

const meta = {
  title: "RYZE/Foundations/Typography",
  parameters: { layout: "padded" },
  args: {
    variant: "heading",
    element: "h1",
    text: "AI autopilot for your Shopify",
    width: 620,
  },
  argTypes: {
    variant: { control: "select", options: ["heading", "lead", "paragraph"] },
    element: { control: "select", options: ["h1", "h2", "h3", "p", "span"] },
    text: { control: "text" },
    width: { control: { type: "range", min: 240, max: 1000, step: 20 } },
  },
  render: ({ variant, element, text, width }) => (
    <div style={{ inlineSize: "100%", maxInlineSize: width }}>
      <Typography as={element} variant={variant}>{text}</Typography>
    </div>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
