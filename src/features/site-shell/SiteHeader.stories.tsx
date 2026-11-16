import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteHeader } from "./SiteHeader";

const meta = {
  title: "Site shell/SiteHeader",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    fullScreen: true,
    docs: {
      description: {
        component:
          "An isolated preview of the real SiteHeader and MegaMenu. Resize the Storybook canvas below 1024px to exercise nested mobile navigation. Destination feedback is temporary until Rizzie (#10) is integrated.",
      },
    },
  },
  args: { previewMode: true },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NavigationPreview: Story = {};
