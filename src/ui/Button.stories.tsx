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
