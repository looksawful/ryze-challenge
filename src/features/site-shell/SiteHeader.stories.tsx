import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteHeader } from "./SiteHeader";
import { HeroWithNavigation } from "./HeroWithNavigation";
import Hero from "../hero/Hero";

type NavigationArgs = Pick<ComponentProps<typeof SiteHeader>, "enhancement">;

/** Isolated controls over the real Hero, with space to test scroll behavior. */
function NavigationCanvas({ enhancement = "auto", theme = "dusk" }: NavigationArgs & { theme?: "dawn" | "dusk" }) {
  return (
    <div data-theme={theme} style={{ minBlockSize: "200svh", background: "var(--color-background)" }}>
      <SiteHeader enhancement={enhancement} theme={theme} variant="dock" previewMode />
      <Hero theme={theme} />
      <section aria-label="Scroll test surface" style={{ minBlockSize: "100svh", background: "var(--color-surface)" }} />
    </div>
  );
}

const meta = {
  title: "Design System/Components/Navigation",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    status: "review",

  },
  args: { enhancement: "auto" },
  argTypes: {
    enhancement: {
      name: "Capability mode",
      control: { type: "select", labels: { auto: "Automatic", static: "Static", reduced: "Reduced motion", "no-webgl": "No WebGL", lightweight: "Lightweight", full: "Full" } },
      options: ["auto", "static", "reduced", "no-webgl", "lightweight", "full"],
    },
    variant: { table: { disable: true } },
    previewMode: { table: { disable: true } },
    brand: { table: { disable: true } },
    onDockChange: { table: { disable: true } },
    onPreviewDestination: { table: { disable: true } },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args, context) => (
    <NavigationCanvas enhancement={args.enhancement} theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />
  ),
};

export const OnPage: Story = {
  name: "On page · real navigation",
  render: (_args, context) => (
    <HeroWithNavigation theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />
  ),
};

export const DrawerOpen: Story = {
  name: "Mobile · push drawer open",
  parameters: { viewport: { defaultViewport: "phoneStandard" } },
  render: (_args, context) => (
    <HeroWithNavigation theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Toggle navigation menu" }));
  },
};
