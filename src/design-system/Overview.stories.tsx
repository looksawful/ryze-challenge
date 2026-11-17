import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Design System/Start here",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <main style={{ maxWidth: "65ch", lineHeight: 1.6 }}>
      <h1>Component library</h1>
      <p>Stories show the components used in the Ryze homework site. They are previews, not separate designs.</p>
      <h2>Inspect</h2>
      <p>Choose a component in the sidebar, edit its props in Storybook Controls, and switch the actual canvas width with Viewport. The global theme selector changes the component theme.</p>
      <h2>Review</h2>
      <p>Approved means explicitly signed off. Review and Draft are not final. Check full pages in Screens, and validate the no-JavaScript version on the site rather than inside Storybook.</p>
    </main>
  ),
};
