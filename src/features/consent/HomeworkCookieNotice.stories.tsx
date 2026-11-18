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
    state: { control: "select", options: ["notice", "settings", "closed"] },
    rememberChoice: { control: "boolean" },
  },
  parameters: {
    layout: "fullscreen",
    status: "review",

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
