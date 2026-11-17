import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Hero from "./Hero";

const meta = {
  title: "Design System/Screens/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    status: "review",
    docs: {
      description: {
        component: "Current Hero from issue #9 for responsive review, not an approved final design. Resize the canvas to compare portrait, landscape and desktop layouts.",
      },
    },
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = {
  render: (_args, context) => <Hero theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />,
};
