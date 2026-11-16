"use client";

import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroAction from "../hero/HeroAction";
import RizzieMascot from "./RizzieMascot";
import type { RizzieScenario } from "./mascot-model";
import styles from "./Rizzie.stories.module.css";

type Viewport = "490x1091" | "572x846" | "874x402" | "897x1211" |
  "1189x837" | "1273x909" | "1688x908" | "2048x746";
type StoryProps = {
  scenario: RizzieScenario;
  viewport: Viewport;
  message: "none" | "navigation" | "long";
};
const sampleLink = "https://www.get-ryze.ai/muse";
const messages = {
  navigation: "On the live site, Muse would open its own page. This preview stays here.",
  long: "On a production site this link would open the relevant Ryze destination. This is a demonstration of the responsive mascot message, including longer text that must remain readable without covering the primary action.",
} as const;

function announce(text: string) {
  window.dispatchEvent(new CustomEvent("rizzie:message", { detail: { text } }));
}

function RizzieWorkbench({ scenario, viewport, message }: StoryProps) {
  const [activation, setActivation] = useState<{ trigger: HTMLAnchorElement } | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [width, height] = viewport.split("x").map(Number);

  useEffect(() => {
    if (message === "none") return;
    const timer = window.setTimeout(() => announce(messages[message]), 180);
    return () => window.clearTimeout(timer);
  }, [message, scenario, viewport]);

  return (
    <div className={styles.workbench}>
      <div className={styles.controls}>
        <span>Rizzie · {scenario} · {viewport}</span>
        <button type="button" onClick={() => announce(messages.navigation)}>Show response</button>
        <button type="button" onClick={() => announce(messages.long)}>Long response</button>
        <button type="button" onClick={() => announce("A second message replaces the first.")}>Replace response</button>
        <span>Theme: use the Storybook dawn / dusk toolbar</span>
      </div>
      <div className={styles.scrollFrame}>
        <main className={styles.stage} data-viewport={viewport}
          style={{ width, height }}>
          <div className={styles.brand}><span aria-hidden="true">✳</span> Ryze</div>
          <h1 className={styles.headline}>AI autopilot <em>for</em> <span>your Shopify</span></h1>
          <p className={styles.lead}>A new way to grow your store.</p>
          <p className={styles.description}>Paid ads, SEO, AI visibility &amp; CRO. One AI autopilot built around your business.</p>
          <div className={styles.mascot}>
            <RizzieMascot key={scenario + viewport} scenario={scenario}
              actionOpen={actionOpen} onActivate={(trigger) => setActivation({ trigger })} />
          </div>
          <div className={styles.action}>
            <HeroAction activation={activation} onOpenChange={setActionOpen} />
          </div>
          <div className={styles.integrations}>Plugs into any platform</div>
          <a className={styles.previewLink} href={sampleLink}
            onClick={(event) => {
              event.preventDefault();
              announce(messages.navigation);
            }}>Muse · destination preview</a>
          <div className={styles.note}>
            {scenario === "no-js" ? "Simulated no-JS: no mascot is rendered" :
              scenario === "touch-unavailable" ? "Touch unavailable: fixed poster and toast" :
              scenario === "reduced-motion" || scenario === "unsupported-browser" ?
              "Static fallback: fixed poster and toast" :
              "Pointer drag is enabled. Click opens the real HeroAction."}
          </div>
        </main>
      </div>
    </div>
  );
}

const meta = {
  title: "RYZE/Rizzie progressive enhancement",
  component: RizzieWorkbench,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "The real Rizzie pet, sprite v2, shared speech/toast and actual HeroAction. Six capability scenarios, Figma-inspired viewport placements and the existing dawn/dusk theme toolbar. 'No JS' is simulated by the no-JS render mode; verify actual disabled scripting separately.",
      },
    },
  },
  argTypes: {
    scenario: { control: "select", options: ["no-js", "reduced-motion", "unsupported-browser", "touch-unavailable", "touch", "full", "auto"] },
    viewport: { control: "select", options: ["490x1091", "572x846", "874x402", "897x1211", "1189x837", "1273x909", "1688x908", "2048x746"] },
    message: { control: "select", options: ["none", "navigation", "long"] },
  },
  args: { scenario: "full", viewport: "490x1091", message: "navigation" },
} satisfies Meta<typeof RizzieWorkbench>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const NoJavaScript: Story = { args: { scenario: "no-js" } };
export const ReducedMotion: Story = { args: { scenario: "reduced-motion" } };
export const UnsupportedBrowser: Story = { args: { scenario: "unsupported-browser" } };
export const TouchUnavailable: Story = { args: { scenario: "touch-unavailable" } };
export const TouchDrag: Story = { args: { scenario: "touch" } };
export const FullMotionAndDrag: Story = { args: { scenario: "full", viewport: "1688x908" } };
