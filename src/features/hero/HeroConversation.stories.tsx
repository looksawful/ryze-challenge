import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroConversation from "./HeroConversation";

const meta = {
  title: "Design System/Components/HeroConversation",
  component: HeroConversation,
  tags: ["autodocs"],
  parameters: { layout: "centered", status: "review",
    docs: { description: { component: "Flim-inspired Ryze conversation. Email-first, local demo only; no data sent. Compare static, reduced, lightweight and full behavior with real input." } } },
  decorators: [Story => <div style={{ width: "min(92vw, 680px)" }}><Story /></div>],
} satisfies Meta<typeof HeroConversation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
