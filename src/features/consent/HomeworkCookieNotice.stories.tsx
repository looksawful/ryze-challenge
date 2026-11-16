import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { useArgs } from "storybook/preview-api";
import { HomeworkCookieNotice, HomeworkCookieSettingsButton } from "./HomeworkCookieNotice";

type CookieState = "notice" | "settings" | "closed";
type CookieStoryArgs = { state: CookieState; rememberChoice: boolean };
const meta = {
  title: "RYZE/Cookies",
  args: { state: "notice", rememberChoice: true },
  argTypes: {
    state: { control: "select", options: ["notice", "settings", "closed"] },
    rememberChoice: { control: "boolean" },
  },
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "One Homework cookie component. Use Controls for state and persistence, global toolbar for theme and viewport. No-JS: absent; reduced motion, no WebGL and low-end use the same version. Component also used on Challenge site." } },
  },
} satisfies Meta<CookieStoryArgs>;
export default meta;
type Story = StoryObj<CookieStoryArgs>;

function Preview({ state, rememberChoice, onReset }: CookieStoryArgs & { onReset: () => void }) {
  const [revision, setRevision] = useState(0);

  function reset() {
    onReset();
    setRevision((value) => value + 1);
  }

  return (
    <div style={{ minHeight: "100svh", background: "var(--color-background)", color: "var(--color-foreground)", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <HomeworkCookieSettingsButton />
        <button type="button" onClick={reset} style={{ color: "inherit", background: "transparent", border: 0, padding: "10px 0", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
          Reset
        </button>
      </div>
      <HomeworkCookieNotice key={state + revision} initialView={state} rememberChoice={rememberChoice} />
    </div>
  );
}

export const Interactive: Story = {
  render: function CookieStoryRender(args) {
    const [, updateArgs] = useArgs<CookieStoryArgs>();
    return <Preview state={args.state ?? "notice"} rememberChoice={args.rememberChoice ?? true} onReset={() => updateArgs({ state: "notice" })} />;
  },
};