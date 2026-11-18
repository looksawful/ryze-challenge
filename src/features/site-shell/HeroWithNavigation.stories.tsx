import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroWithNavigation } from "./HeroWithNavigation";
import { HomeworkCookieNotice } from "../consent/HomeworkCookieNotice";

const meta = {
  title: "Design System/Screens/First screen with navigation",
  component: HeroWithNavigation,
  tags: ["autodocs"],
  render: (_args, context) => (
    <HeroWithNavigation theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />
  ),
  parameters: {
    layout: "fullscreen",
    fullScreen: true,
    status: "review",
    docs: {
      description: {
        component: "The actual email-first Hero plus production Header, push-drawer and animated logo canvas. This is the new design direction, not the former centered domain-entry screen. First Screen omits Cookie Consent to make layout inspection clear; With Cookie Consent mirrors the real page to reveal overlay conflicts. Responsive stories reuse the same components and viewport presets.",
      },
    },
  },
} satisfies Meta<typeof HeroWithNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstScreen: Story = { name: "Hero + navigation" };

export const WithCookieConsent: Story = {
  name: "Full page · Cookie Consent",
  render: (_args, context) => {
    const theme = context.globals.theme === "dawn" ? "dawn" : "dusk";
    return (
      <div data-theme={theme}>
        <HeroWithNavigation theme={theme} />
        <div data-motion-slot="cookies">
          <HomeworkCookieNotice rememberChoice={false} initialView="notice" />
        </div>
      </div>
    );
  },
};

export const Phone: Story = {
  name: "Phone · 390 × 844",
  parameters: { viewport: { defaultViewport: "phoneStandard" } },
};

export const PhoneCompact: Story = {
  name: "Compact · 320 × 568",
  parameters: { viewport: { defaultViewport: "phoneCompact" } },
};

export const PhoneLandscape: Story = {
  name: "Landscape · 874 × 402",
  parameters: { viewport: { defaultViewport: "phoneLandscape" } },
};

export const DuoOpen: Story = {
  name: "Duo Open · 951 × 669",
  parameters: { viewport: { defaultViewport: "duoOpen" } },
};

export const Notebook: Story = {
  name: "Notebook · 1366 × 768",
  parameters: { viewport: { defaultViewport: "ryzeLaptop" } },
};

export const Desktop: Story = {
  name: "Desktop · 1440 × 900",
  parameters: { viewport: { defaultViewport: "ryzeLaptopMedium" } },
};

export const Ultrawide: Story = {
  name: "Ultrawide · 2803 × 1024",
  parameters: { viewport: { defaultViewport: "wide" } },
};
