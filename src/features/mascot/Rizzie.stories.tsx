"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Hero from "../hero/Hero";
import RizzieLab from "./RizzieLab";
import type { RizzieScenario } from "./mascot-model";

type Props = {
  scenario: RizzieScenario;
  theme?: "dawn" | "dusk";
};

function RizziePlayground({ scenario, theme = "dusk" }: Props) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "absolute", zIndex: 100, insetBlockStart: 8, insetInlineStart: 8,
        display: "flex", flexWrap: "wrap", gap: 6,
      }}>
        <button type="button" onClick={() => {
          window.dispatchEvent(new CustomEvent("rizzie:message", {
            detail: { text: "On the live site, this opens the destination. This preview stays here." },
          }));
        }}>Show response</button>
        <button type="button" onClick={() => setResetKey((n) => n + 1)}>
          Reset position
        </button>
      </div>
      <Hero mascotScenario={scenario} mascotResetKey={resetKey} theme={theme} />
    </div>
  );
}

const meta = {
  title: "Design System/Components/Rizzie",
  component: RizziePlayground,
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
  },
  argTypes: {
    scenario: {
      name: "Mode",
      control: "select",
      options: ["no-js", "reduced-motion", "unsupported-browser", "touch-unavailable", "touch", "full"],
    },
    theme: { table: { disable: true } },
  },
  args: { scenario: "full" },
  render: (args, context) => (
    <RizziePlayground {...args} theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />
  ),
} satisfies Meta<typeof RizziePlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const MotionLab: Story = {
  name: "Motion Lab",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: { description: { story: "Inspect every existing sprite action, capability fallback and real mouse drag. Use Replay after one-shot actions and Reset to restore the starting position." } },
  },
  render: (_args, context) => <RizzieLab theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />,
};
