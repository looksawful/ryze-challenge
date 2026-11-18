import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroWithNavigation } from "./HeroWithNavigation";

const meta = {
  title: "Design System/Screens/First screen with navigation",
  component: HeroWithNavigation,
  render: (_args, context) => <HeroWithNavigation theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />,
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

export const Notebook: Story = {
  name: "Notebook · real page",
  parameters: {
    viewport: {
      defaultViewport: "ryzeLaptop",
      options: {
        ryzeLaptop: {
          name: "Laptop 1366 × 768",
          styles: { width: "1366px", height: "768px" },
          type: "desktop",
        },
        ryzeLaptopWide: {
          name: "Laptop Full HD 1920 × 960",
          styles: { width: "1920px", height: "960px" },
          type: "desktop",
        },
      },
    },
  },
};

export const DuoOpen: Story = {
  name: "Duo Open · 951 × 669",
  parameters: {
    viewport: {
      defaultViewport: "ryzeDuoOpen",
      options: {
        ryzeDuoOpen: {
          name: "Duo Open 951 × 669",
          styles: { width: "951px", height: "669px" },
          type: "tablet",
        },
      },
    },
  },
};

export const Ultrawide: Story = {
  name: "Ultrawide · 2560 × 1440",
  parameters: {
    viewport: {
      defaultViewport: "ryzeUltrawide",
      options: {
        ryzeUltrawide: {
          name: "Ultrawide 2560 × 1440",
          styles: { width: "2560px", height: "1440px" },
          type: "desktop",
        },
      },
    },
  },
};
