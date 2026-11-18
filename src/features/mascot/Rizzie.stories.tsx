"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Hero from "../hero/Hero";
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

const meta = {
  title: "Design System/Components/Rizzie",
  component: RizziePlayground,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: {
        mobilePortrait: { name: "490 × 1091", styles: { width: "490px", height: "1091px" }, type: "mobile" },
        phoneCompact: { name: "320 × 568", styles: { width: "320px", height: "568px" }, type: "mobile" },
        phoneReference: { name: "375 × 667", styles: { width: "375px", height: "667px" }, type: "mobile" },
        phoneStandard: { name: "390 × 844", styles: { width: "390px", height: "844px" }, type: "mobile" },
        phoneWide: { name: "540 × 720", styles: { width: "540px", height: "720px" }, type: "mobile" },
        preLandscape: { name: "699 × 800", styles: { width: "699px", height: "800px" }, type: "mobile" },
        landscapeThreshold: { name: "700 × 800", styles: { width: "700px", height: "800px" }, type: "tablet" },
        landscapeBefore: { name: "699 × 402", styles: { width: "699px", height: "402px" }, type: "mobile" },
        landscapeAfter: { name: "700 × 402", styles: { width: "700px", height: "402px" }, type: "tablet" },
        desktopBefore: { name: "1023 × 402", styles: { width: "1023px", height: "402px" }, type: "tablet" },
        desktopAfter: { name: "1024 × 402", styles: { width: "1024px", height: "402px" }, type: "desktop" },
        wideBefore: { name: "2399 × 900", styles: { width: "2399px", height: "900px" }, type: "desktop" },
        wideAfter: { name: "2400 × 900", styles: { width: "2400px", height: "900px" }, type: "desktop" },
        duoOpen: { name: "951 × 669", styles: { width: "951px", height: "669px" }, type: "tablet" },
        desktopReference: { name: "1440 × 900", styles: { width: "1440px", height: "900px" }, type: "desktop" },
        desktopFullHD: { name: "1920 × 1080", styles: { width: "1920px", height: "1080px" }, type: "desktop" },
        ultraWideExtreme: { name: "2803 × 1024", styles: { width: "2803px", height: "1024px" }, type: "desktop" },
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
        component: "Rizzie is the production Hero mascot, not a separate animation lab. This Playground and its viewport controls are the canonical design-system reference. Poster, sprite and hit area share one CSS --rizzie-art-size and a 12:13 ratio. The size varies continuously with rem, vw and svh, and is capped for short windows. Hero defines positioning and reserves the stage, never overrides the mascot scale. Use the scenario control to compare runtime fallbacks. The no-js scenario here is a simulation; verify true no-JS on the page.",
      },
    },
  },
  args: {
    scenario: "full",
  },
  argTypes: {
    scenario: {
      name: "Mode",
      control: "select",
      options: ["auto", "no-js", "reduced-motion", "unsupported-browser", "touch-unavailable", "touch", "full"],
    },
    theme: { table: { disable: true } },
  },
} satisfies Meta<typeof RizziePlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, context) => (
    <RizziePlayground {...args} theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />
  ),
};
