import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";
import { useArgs } from "storybook/preview-api";
import { HomeworkCookieNotice, HomeworkCookieSettingsButton } from "./HomeworkCookieNotice";

type CookieState = "notice" | "settings" | "closed";
type CookieStoryArgs = { state: CookieState; rememberChoice: boolean };
const storageKey = "ryze-cookie-preferences";
const changedEvent = "ryze:cookie-preferences-changed";

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
  const rootRef = useRef<HTMLDivElement>(null);
  const previousState = useRef(state);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (state === "notice" && previousState.current !== state) {
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event(changedEvent));
    }
    previousState.current = state;

    const frame = requestAnimationFrame(() => {
      if (state === "settings") {
        window.dispatchEvent(new Event("ryze:cookie-settings"));
      } else if (state === "closed") {
        const buttons = [...(rootRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
        buttons.find((button) => button.textContent?.includes("Reject all cookies"))?.click();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [state, revision]);

  function reset() {
    localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event(changedEvent));
    onReset();
    setRevision((value) => value + 1);
  }

  return (
    <div ref={rootRef} style={{ minHeight: "100svh", background: "var(--color-background)", color: "var(--color-foreground)", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <HomeworkCookieSettingsButton />
        <button type="button" onClick={reset} style={{ color: "inherit", background: "transparent", border: 0, padding: "10px 0", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
          Reset
        </button>
      </div>
      <HomeworkCookieNotice key={state + revision} rememberChoice={rememberChoice} />
    </div>
  );
}

export const Interactive: Story = {
  render: function CookieStoryRender(args) {
    const [, updateArgs] = useArgs<CookieStoryArgs>();
    return <Preview state={args.state ?? "notice"} rememberChoice={args.rememberChoice ?? true} onReset={() => updateArgs({ state: "notice" })} />;
  },
};