import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Design System/Start here",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <main style={{ maxWidth: 980, margin: "auto", padding: "clamp(20px, 5vw, 64px)", lineHeight: 1.6 }}>
    <p style={{ color: "var(--accent-current)", fontWeight: 700 }}>RYZE CHALLENGE</p>
    <h1 style={{ fontSize: "clamp(32px, 6vw, 64px)", lineHeight: 1.1, marginBlock: 20 }}>Storybook design system</h1>
    <p style={{ maxWidth: "65ch", color: "var(--color-muted)" }}>A living inventory of real components used by the homework landing page. Stories are demonstrations, not automatic design approvals.</p>
    <div className="auto-grid" style={{ marginBlockStart: 36 }}>
      {[
        ["Foundations", "Semantic color, typography, spacing, layouts and motion."],
        ["Components", "Header, navigation, Hero, domain entry, integrations, mascot and consent."],
        ["Patterns", "Progressive enhancement, navigation feedback, form flow and cookie choice."],
        ["Screens", "Assembled first screen and responsive verification."],
      ].map(([title, description]) => <section key={title} style={{ background: "var(--color-surface)", padding: 24, borderRadius: 12 }}>
        <h2 style={{ fontSize: 20 }}>{title}</h2><p style={{ color: "var(--color-muted)", marginBlockStart: 8 }}>{description}</p>
      </section>)}
    </div>
    <section style={{ marginBlockStart: 40 }}>
      <h2>Review rules</h2>
      <p style={{ color: "var(--color-muted)" }}>Approved = explicitly signed off. Review = working implementation awaiting acceptance. Draft = experimental. Controls must manipulate the real component; a visual simulation is labeled as such. Use the global theme toolbar and viewport controls. Test no-JS on the site, not inside Storybook.</p>
    </section>
  </main>,
};
