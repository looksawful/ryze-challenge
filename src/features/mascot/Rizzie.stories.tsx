"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Hero from "../hero/Hero";
import type { RizzieScenario } from "./mascot-model";

type Props = {
  scenario: RizzieScenario;
  theme?: "dawn" | "dusk";
};

/** Show the real character in the live lower Hero slot, not a fabricated mascot card. */
function RizzieInHero({ scenario, theme = "dusk" }: Props) {
  return <Hero mascotScenario={scenario} theme={theme} />;
}

const meta = {
  title: "Design System/Components/Rizzie",
  component: RizzieInHero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    status: "review",
    docs: {
      description: {
        component: [
          "Rizzie is the production Hero character. On desktop it can perch near the Cookie Consent and run to the email composer after the Hero reveal. The full movement sequence must be evaluated in Screens / Full page · Cookie Consent.",
          "Hover/focus currently suggests booking a call; click opens the external booking page. Do not test that external action in this Storybook.",
          "The isolated Hero story is intentionally free of custom debug buttons. Use the Scenario Controls and viewport toolbar, or reload the story to reset its state.",
          "Touch, reduced-motion and unsupported-browser modes use the real component's scenario handling. No-JS simulation in Storybook is not a substitute for testing the real page without JavaScript.",
        ].join("\n\n"),
      },
    },
  },
  args: { scenario: "auto" },
  argTypes: {
    scenario: { name: "Capability scenario", control: "select", options: ["auto", "no-js", "reduced-motion", "unsupported-browser", "touch-unavailable", "touch", "full"] },
    theme: { table: { disable: true } },
  },
  render: (args, context) => (
    <RizzieInHero {...args} theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />
  ),
} satisfies Meta<typeof RizzieInHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Static: Story = {
  name: "Reduced motion · static",
  args: { scenario: "reduced-motion" },
};
export const Full: Story = {
  name: "Full motion",
  args: { scenario: "full" },
};
export const Touch: Story = {
  name: "Touch device",
  args: { scenario: "touch" },
  parameters: { viewport: { defaultViewport: "phoneStandard" } },
};
