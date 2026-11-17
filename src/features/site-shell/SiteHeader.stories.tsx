import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteHeader } from "./SiteHeader";
import styles from "./NavigationShowcase.module.css";

type NavigationArgs = Pick<ComponentProps<typeof SiteHeader>, "enhancement"> & { theme: "dawn" | "dusk" };

function NavigationCanvas({ enhancement = "full", theme = "dusk" }: NavigationArgs) {
  return (
    <div className={styles.canvas} data-theme={theme}>
      <SiteHeader
        key={enhancement}
        variant="dock"
        theme={theme}
        enhancement={enhancement}
        previewMode
      />
      <main>
        <section className={styles.dark} data-ryze-dark-end>
        </section>
        <section className={styles.light} id="selected-works" />
      </main>
    </div>
  );
}

const meta = {
  title: "Design System/Components/Navigation",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Current Ryze navigation, using the same Segoe UI font as the Hero. Choose the progressive enhancement mode and theme in Controls; use Storybook Viewport for desktop, tablet or mobile. The navigation stays fixed at the top on all devices. The desktop menu is centred and narrows in place after scroll; the mobile quick navigation stays visible at the top without translating offscreen. Pricing and Start use their verified destinations; Storybook intercepts global links for safe preview. The no-JavaScript control is a simulation because Storybook itself requires JavaScript.",
      },
    },
  },
  args: {
    enhancement: "full",
  },
  argTypes: {
    enhancement: {
      name: "Mode",
      control: {
        type: "select",
        labels: {
          static: "No JavaScript",
          reduced: "Reduced motion",
          "no-webgl": "No WebGL",
          lightweight: "Low power",
          full: "Full GSAP",
        },
      },
      options: ["static", "reduced", "no-webgl", "lightweight", "full"],
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
  render: (args, context) => <NavigationCanvas {...args} theme={context.globals.theme === "dawn" ? "dawn" : "dusk"} />,
};
