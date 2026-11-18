import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Hero from "../hero/Hero";
import { HomeworkCookieNotice } from "./HomeworkCookieNotice";

type CookieState = "notice" | "settings" | "closed";
type CookieStoryArgs = { state: CookieState; rememberChoice: boolean };

const meta = {
  title: "Design System/Components/Cookies",
  tags: ["autodocs"],
  args: { state: "notice", rememberChoice: false },
  argTypes: {
    state: { control: "select", options: ["notice", "settings", "closed"], description: "Visible state of the real cookie component" },
    rememberChoice: { control: "boolean", description: "Production persists the decision. Off by default for repeatable visual review." },
  },
  parameters: {
    layout: "fullscreen",
    status: "review",
    docs: {
      description: {
        component: [
          "Current compact Homework Cookie Consent: optional tracking notice, Settings/Reject/Accept and an accessible preferences form. See it in the context of the real email-first Hero, not a blank test canvas.",
          "Use Controls to preview notice, settings or dismissed. Storybook defaults to non-persistent state so previous local cookie choices do not hide the example.",
          "The full application uses persistent preferences. Use Screens / Full page · Cookie Consent to inspect how the fixed overlay competes with the CTA on desktop. Without JavaScript, the notice does not appear.",
        ].join("\n\n"),
      },
    },
  },
  render: ({ state, rememberChoice }, context) => {
    const theme = context.globals.theme === "dawn" ? "dawn" : "dusk";
    return (
      <div data-theme={theme}>
        <Hero theme={theme} />
        <div data-motion-slot="cookies">
          <HomeworkCookieNotice key={state + String(rememberChoice)} initialView={state} rememberChoice={rememberChoice} />
        </div>
      </div>
    );
  },
} satisfies Meta<CookieStoryArgs>;

export default meta;
type Story = StoryObj<CookieStoryArgs>;

export const Interactive: Story = { name: "Notice · interactive" };
export const Settings: Story = {
  name: "Preferences · expanded",
  args: { state: "settings" },
};
export const Dismissed: Story = {
  name: "Consent dismissed",
  args: { state: "closed" },
};
