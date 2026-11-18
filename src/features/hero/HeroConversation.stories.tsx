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
    docs: {
      description: {
        component: [
          "Current Ryze CTA: a dark email composer with a pink \"Start for free\" button. It is not the older domain-entry HeroAction.",
          "Enter an email, not a Shopify URL. The prototype only generates local example replies; it does not create an account, analyze a store, or send email.",
          "Playground is manual. Empty Email and Ready Preview exercise the actual component's validation and response states through Storybook interactions.",
          "The animated placeholder runs only after Hero intro release in the full-page screen. For reduced motion, the form is usable without the decorative text animation.",
        ].join("\n\n"),
      },
    },
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

export const MissingEmail: Story = {
  name: "Empty email · actual validation",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Start for free" }));
  },
};

export const ReadyPreview: Story = {
  name: "Valid email · AI preview",
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email address" });
    await userEvent.type(input, "hello@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Start for free" }));
    await canvas.findByRole("region", { name: "Ryze capability examples" }, { timeout: 8000 });
  },
};
