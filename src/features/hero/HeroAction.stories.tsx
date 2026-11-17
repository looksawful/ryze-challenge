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
    docs: { description: { component: "Real HeroAction. The real form fills its parent container when expanded. The width control switches between inline and drawer; check the full laptop layout in First screen with navigation." } },
  },
  render: ({ containerWidth }) => (
    <main style={{ inlineSize: "min(100%, var(--content-width))", maxInlineSize: containerWidth, minBlockSize: 320, marginInline: "auto", paddingInline: "var(--gutter)" }}>
      <div className={heroStyles.action} style={{ marginBlockStart: 40, inlineSize: "100%" }}>
        <HeroAction key={containerWidth} />
      </div>
    </main>
  ),
} satisfies Meta<Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
