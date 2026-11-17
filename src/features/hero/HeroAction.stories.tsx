import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroAction from "./HeroAction";
import heroStyles from "./Hero.module.css";

type Controls = { containerWidth: number };

const meta = {
  title: "Design System/Components/HeroAction",
  args: { containerWidth: 940 },
  argTypes: {
    containerWidth: { control: { type: "range", min: 320, max: 1200, step: 20 } },
  },
  parameters: {
    layout: "padded",
    docs: { description: { component: "Real HeroAction. The width control switches between inline and drawer interaction. Click the action to open the form." } },
  },
  render: ({ containerWidth }) => (
    <main style={{ inlineSize: "100%", maxInlineSize: containerWidth, minBlockSize: 320 }}>
      <div className={heroStyles.action} style={{ marginBlockStart: 40 }}>
        <HeroAction key={containerWidth} />
      </div>
    </main>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
