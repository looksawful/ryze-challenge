"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Hero from "../hero/Hero";
import RizzieMascot from "./RizzieMascot";
import type { AnimationName, RizzieScenario } from "./mascot-model";

type Playback = AnimationName | "natural";
type Props = {
  scenario: RizzieScenario;
  theme?: "dawn" | "dusk";
  playback?: Playback;
  message?: string;
};

const animations: Playback[] = [
  "natural", "idle", "running-right", "running-left", "waving",
  "jumping", "failed", "waiting", "working", "review",
];

function RizziePlayground({ scenario, theme = "dusk" }: Props) {
  const [resetKey, setResetKey] = useState(0);
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "absolute", zIndex: 100, insetBlockStart: 8, insetInlineStart: 8,
        display: "flex", gap: 6, flexWrap: "wrap",
      }}>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("rizzie:message", {
          detail: { text: "On the live site, this opens the destination. This preview stays here." },
        }))}>Show response</button>
        <button type="button" onClick={() => setResetKey(key => key + 1)}>Reset position</button>
      </div>
      <Hero mascotScenario={scenario} mascotResetKey={resetKey} theme={theme} />
    </div>
  );
}

function RizzieMotionPreview({ scenario, playback = "natural", message = "" }: Props) {
  const [resetKey, setResetKey] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const hidden = scenario === "no-js";

  function showMessage() {
    window.dispatchEvent(new CustomEvent("rizzie:message", { detail: { text: message } }));
  }

  return (
    <section aria-label="Rizzie animation preview" style={{ position: "relative", minHeight: "min(70svh, 600px)" }}>
      <div aria-label="Preview actions" style={{
        position: "absolute", zIndex: 2, insetBlockStart: 12, insetInlineStart: 12,
        display: "flex", flexWrap: "wrap", gap: 8,
      }}>
        <button type="button" disabled={hidden} onClick={() => setReplayKey(key => key + 1)}>Replay</button>
        <button type="button" onClick={() => setResetKey(key => key + 1)}>Reset position</button>
        <button type="button" disabled={hidden || !message.trim()} onClick={showMessage}>Show message</button>
      </div>
      <RizzieMascot
        key={`${scenario}:${resetKey}`}
        scenario={scenario}
        actionOpen={false}
        previewAnimation={playback}
        previewReplayKey={replayKey}
        onActivate={showMessage}
      />
    </section>
  );
}

const meta = {
  title: "Design System/Components/Rizzie",
  component: RizziePlayground,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: {
        mobilePortrait: { name: "490 × 1091", styles: { width: "490px", height: "1091px" }, type: "mobile" },
        mobileShort: { name: "572 × 846", styles: { width: "572px", height: "846px" }, type: "mobile" },
        mobileLandscape: { name: "874 × 402", styles: { width: "874px", height: "402px" }, type: "mobile" },
        tabletPortrait: { name: "897 × 1211", styles: { width: "897px", height: "1211px" }, type: "tablet" },
        desktopSmall: { name: "1189 × 837", styles: { width: "1189px", height: "837px" }, type: "desktop" },
        desktopMedium: { name: "1273 × 909", styles: { width: "1273px", height: "909px" }, type: "desktop" },
        desktopWide: { name: "1688 × 908", styles: { width: "1688px", height: "908px" }, type: "desktop" },
        desktopUltraWide: { name: "2048 × 746", styles: { width: "2048px", height: "746px" }, type: "desktop" },
      },
    },
    docs: {
      description: {
        component: "The real Rizzie mascot, using the same sprites and interaction logic as the site.",
      },
    },
  },
  args: {
    scenario: "full",
    playback: "natural",
    message: "On the live site, this opens the destination. This preview stays here.",
  },
  argTypes: {
    scenario: {
      name: "Mode",
      control: "select",
      options: ["auto", "no-js", "reduced-motion", "unsupported-browser", "touch-unavailable", "touch", "full"],
    },
    playback: { name: "Animation", control: "select", options: animations },
    message: { control: "text" },
    theme: { table: { disable: true } },
  },
} satisfies Meta<typeof RizziePlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  argTypes: {
    playback: { table: { disable: true } },
    message: { table: { disable: true } },
  },
  render: (args, context) => (
    <RizziePlayground {...args} theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />
  ),
};

export const MotionLab: Story = {
  name: "Motion Lab",
  args: { scenario: "auto" },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: "Use Storybook Controls for animation, capability mode and message. Use Viewport for real responsive CSS. Replay repeats one-shot actions; Reset restores the mascot position. No-JavaScript is only a simulation.",
      },
    },
  },
  render: (args) => <RizzieMotionPreview {...args} />,
};
