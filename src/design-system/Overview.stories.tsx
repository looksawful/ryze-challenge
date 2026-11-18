import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Design System/Start Here",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sectionStyle = { display: "grid", gap: "var(--space-3)" } as const;
const headingStyle = { fontSize: "1.625rem", lineHeight: 1.15 } as const;
const copyStyle = { color: "var(--color-muted)" } as const;

export const Overview: Story = {
  render: () => (
    <main style={{ maxInlineSize: "68ch", marginInline: "auto", display: "grid", gap: "var(--space-8)", lineHeight: 1.5 }}>
      <header style={sectionStyle}>
        <p style={{ ...copyStyle, fontSize: "0.875rem" }}>RYZE / DESIGN SYSTEM</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.08 }}>One library. Real components.</h1>
        <p>Browse the actual Ryze components, examine their states, and review screens without maintaining a second design.</p>
      </header>
      <section style={sectionStyle} aria-labelledby="getting-started">
        <h2 id="getting-started" style={headingStyle}>Getting started</h2>
        <ol style={{ paddingInlineStart: "1.5rem", display: "grid", gap: "var(--space-2)" }}>
          <li>Find an existing component in the sidebar before creating a new one.</li>
          <li>Open its Docs page for purpose, usage rules, props, and variants.</li>
          <li>Use Playground and Controls to explore supported inputs, then Viewport for real device sizes.</li>
          <li>Switch dawn/dusk in the toolbar. Verify no-JavaScript behavior on the actual site, not in Storybook.</li>
        </ol>
      </section>
      <section style={sectionStyle} aria-labelledby="find-components">
        <h2 id="find-components" style={headingStyle}>Where to look</h2>
        <p><strong>Foundations</strong>: color roles, typography, spacing, layout and motion tokens.</p>
        <p><strong>Components</strong>: isolated production primitives and their states.</p>
        <p><strong>Screens</strong>: composed sections with real responsive behavior.</p>
        <p style={copyStyle}>Patterns are added only when a composition is reused. Empty categories are not needed.</p>
      </section>
      <section style={sectionStyle} aria-labelledby="contributing">
        <h2 id="contributing" style={headingStyle}>Contributing and review</h2>
        <p><strong>Approved</strong> means explicitly reviewed; <strong>Review</strong> is under evaluation; <strong>Draft</strong> is not ready for reuse. An unmarked story is not automatically approved.</p>
        <p>Update the original component and its story together. Keep source files as the single source of truth. Log review decisions in the existing Ryze task tracker.</p>
      </section>
    </main>
  ),
};
