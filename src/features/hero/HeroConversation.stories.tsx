import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroConversation from "./HeroConversation";

/** Actual production form and its own response logic, without mocked replies.
 * The display scene uses the live Hero's dark background and bottom placement. */
const meta = {
  title: "Design System/Components/HeroConversation",
  component: HeroConversation,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    status: "review",

  },
  decorators: [
    (Story) => (
      <div
        style={{
          boxSizing: "border-box",
          minBlockSize: "100svh",
          display: "grid",
          gridTemplateRows: "minmax(12rem, 1fr) auto",
          padding: "clamp(1rem, 3vw, 3rem)",
          background: "var(--color-background)",
          color: "var(--color-foreground)",
        }}
      >
        <div />
        <div style={{ inlineSize: "100%", maxInlineSize: "66rem", justifySelf: "center" }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof HeroConversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Keep the former entry so existing links don't break. */
export const Interactive: Story = { name: "Interactive (manual)" };

export const MissingWebsite: Story = {
  name: "Empty website · actual validation",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Check for free" }));
    await canvas.findByRole("alert");
  },
};

export const ReadyPreview: Story = {
  name: "Valid website · animated chat reply",
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Website address" });
    await userEvent.type(input, "example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Check for free" }));
    await canvas.findByRole("status");
    await canvas.findByText("example.com");
  },
};
