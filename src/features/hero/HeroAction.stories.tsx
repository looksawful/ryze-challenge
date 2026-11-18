import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroAction from "./HeroAction";
import heroStyles from "./Hero.module.css";

type Controls = { containerWidth: number };

/** Archive only: deliberately not the CTA used on the current landing page. */
const meta = {
  title: "Design System/Archive/HeroAction (legacy)",
  tags: ["autodocs"],
  args: { containerWidth: 940 },
  argTypes: {
    containerWidth: { control: { type: "range", min: 320, max: 1200, step: 20 } },
  },
  parameters: {
    layout: "padded",
    status: "deprecated",
    docs: {
      description: {
        component: [
          "Legacy domain-entry HeroAction, not used in the current Hero. The actual live CTA is the email-first HeroConversation under Components.",
          "**Historic observation:** \"Start For Free\" opened a local domain demo rather than free registration. This copy-versus-behavior issue was recorded for review; the original wording is not changed here.",
          "Keep this example only as historical reference while other developers finish the migration. Do not reuse it in new screens.",
        ].join("\n\n"),
      },
    },
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
