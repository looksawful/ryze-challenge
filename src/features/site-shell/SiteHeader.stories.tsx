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
    docs: {
      description: {
        component: [
          "The current Ryze navigation uses a left-aligned brand pill, a centered desktop menu, and a small Contact us action on the right.",
          "Below the desktop threshold, the permanent quick-links strip is replaced by a round menu trigger. Opening it reveals a left-side push drawer and shifts the real Hero surface to the right. Review that behavior in Drawer Open, which uses the production first-screen composition.",
          "Interactive isolates SiteHeader so enhancement Controls can be tested. On Page uses the complete production HeroWithNavigation and includes the entrance canvas. Real no-JavaScript behavior cannot be exercised inside Storybook.",
          "The menu is not an alternative design proposal: it reflects the current unmerged implementation. External destinations must not be followed during preview.",
        ].join("\n\n"),
      },
    },
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
