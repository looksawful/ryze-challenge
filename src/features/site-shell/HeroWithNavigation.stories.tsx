import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroWithNavigation } from "./HeroWithNavigation";

const meta = {
  title: "Site shell/First screen with navigation",
  component: HeroWithNavigation,
  parameters: {
    layout: "fullscreen",
    fullScreen: true,
    docs: {
      description: {
        component: "The same first-screen composition and navigation used in the application. Destination links stay inside the preview.",
      },
    },
  },
} satisfies Meta<typeof HeroWithNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstScreen: Story = {};
