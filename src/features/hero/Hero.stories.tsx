import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Hero from "./Hero";

const meta = {
  title: "Design System/Screens/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    status: "review",

  },
  render: (_args, context) => <Hero theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />,
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = { name: "Current · layout playground" };
export const Phone: Story = { name: "Phone · 390 × 844", parameters: { viewport: { defaultViewport: "phoneStandard" } } };
export const Landscape: Story = { name: "Landscape · 874 × 402", parameters: { viewport: { defaultViewport: "phoneLandscape" } } };
export const DuoOpen: Story = { name: "Duo Open · 951 × 669", parameters: { viewport: { defaultViewport: "duoOpen" } } };
export const Notebook: Story = { name: "Laptop · 1366 × 768", parameters: { viewport: { defaultViewport: "ryzeLaptop" } } };
export const Desktop: Story = { name: "Desktop · 1440 × 900", parameters: { viewport: { defaultViewport: "ryzeLaptopMedium" } } };
