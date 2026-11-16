import { useState } from "react";
import Image from "next/image";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteHeader } from "./SiteHeader";
import styles from "./NavigationShowcase.module.css";

type NavigationArgs = Pick<ComponentProps<typeof SiteHeader>, "enhancement" | "theme">;

function NavigationCanvas({ enhancement = "full", theme = "dusk" }: NavigationArgs) {
  const [docked, setDocked] = useState(false);

  return (
    <div className={styles.canvas} data-theme={theme}>
      <SiteHeader
        key={enhancement}
        variant="dock"
        theme={theme}
        enhancement={enhancement}
        previewMode
        onDockChange={setDocked}
      />
      <main>
        <section className={styles.dark} data-ryze-dark-end>
          {!docked && (
            <Image
              className={styles.brand}
              src="/ryze-lockup-white.svg"
              alt="Ryze"
              width={126}
              height={40}
              priority
              unoptimized
            />
          )}
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
          "Original Homework/Lovable navigation. Choose the progressive enhancement mode and theme in Controls; use Storybook Viewport for desktop, tablet or mobile. Scroll to see the dock move between dark and light sections. All JavaScript-enabled preview links stay on this page and show a toast. The no-JavaScript control is a simulation because Storybook itself requires JavaScript.",
      },
    },
  },
  args: {
    enhancement: "full",
    theme: "dusk",
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
    theme: {
      name: "Theme",
      control: { type: "radio" },
      options: ["dusk", "dawn"],
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
  render: (args) => <NavigationCanvas {...args} />,
};
