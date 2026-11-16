import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const swatches = [
  ["Accent", "--accent-current", "Brand emphasis, primary actions"],
  ["Background", "--color-background", "Page and stage"],
  ["Foreground", "--color-foreground", "Primary text"],
  ["Surface", "--color-surface", "Cards and panels"],
  ["Muted", "--color-muted", "Secondary copy"],
  ["Border", "--color-border", "Dividers and outlines"],
] as const;
const spacing = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-6", "--space-8", "--space-12"] as const;
const stage = { padding: "clamp(16px, 4vw, 48px)", maxWidth: 1080, marginInline: "auto" } as const;
const heading = { fontSize: "clamp(24px, 4vw, 40px)", marginBlockEnd: 20 } as const;
const note = { color: "var(--color-muted)", lineHeight: 1.55 } as const;
const meta = {
  title: "Design System/Foundations",
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "Live values from src/app/foundation.css. Use the global dawn/dusk toolbar to inspect theme tokens. These are documentation samples, not a second token source." } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => <main style={stage}>
    <h1 style={heading}>Colors</h1>
    <p style={note}>Semantic tokens. Switch dawn / dusk in the Storybook toolbar.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBlockStart: 28 }}>
      {swatches.map(([name, token, usage]) => <section key={token} style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: `var(${token})`, minHeight: 100, borderBlockEnd: "1px solid var(--color-border)" }} />
        <div style={{ padding: 16 }}>
          <strong>{name}</strong>
          <code style={{ display: "block", fontSize: 12, marginBlock: 8 }}>{token}</code>
          <p style={note}>{usage}</p>
        </div>
      </section>)}
    </div>
  </main>,
};
export const Typography: Story = {
  render: () => <main style={stage}>
    <h1 style={heading}>Typography</h1>
    <p style={note}>Base family: <code>--font-body</code>. Real selectable HTML text, not outlined artwork.</p>
    <div style={{ display: "grid", gap: 24, marginBlockStart: 32 }}>
      <div><small>Display · fluid sample</small><p style={{ fontSize: "clamp(40px, 7vw, 88px)", letterSpacing: "-.05em", lineHeight: 1.05 }}>AI autopilot</p></div>
      <div><small>Heading · sample</small><h2 style={{ fontSize: "clamp(24px, 3vw, 40px)" }}>A new way to grow your store.</h2></div>
      <div><small>Body · 16px / 1.5</small><p style={{ fontSize: 16, lineHeight: 1.5, maxWidth: "var(--text-measure)" }}>Paid ads, SEO, AI visibility & CRO. One AI autopilot built around your business.</p></div>
    </div>
  </main>,
};
export const Spacing: Story = {
  render: () => <main style={stage}>
    <h1 style={heading}>Spacing</h1>
    <p style={note}>The scale is defined in CSS rem units, respecting the root font size.</p>
    <div style={{ display: "grid", gap: 16, marginBlockStart: 28 }}>
      {spacing.map(token => <div key={token} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, alignItems: "center" }}>
        <code>{token}</code><div style={{ background: "var(--accent-current)", height: 20, width: `var(${token})`, minWidth: 4 }} />
      </div>)}
    </div>
  </main>,
};
export const Layout: Story = {
  render: () => <main style={stage}>
    <h1 style={heading}>Layout primitives</h1>
    <p style={note}>Live utility classes from foundation.css. Resize the canvas to see intrinsic wrapping.</p>
    {(["cluster", "repel", "split", "auto-grid"] as const).map(className => <section key={className} style={{ marginBlockStart: 32 }}>
      <h2 style={{ marginBlockEnd: 12 }}><code>.{className}</code></h2>
      <div className={className} style={{ border: "1px dashed var(--color-border)", padding: 12 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ padding: 16, background: "var(--color-surface)", borderRadius: 8 }}>Item {i}</div>)}
      </div>
    </section>)}
  </main>,
};
export const Motion: Story = {
  render: () => <main style={stage}>
    <h1 style={heading}>Motion & accessibility</h1>
    <p style={note}><code>--motion-duration</code> defaults to 0ms and becomes 240ms only when reduced motion is not requested. Storybook does not emulate a no-JavaScript browser. Validate no-JS on the exported page.</p>
    <div style={{ marginBlockStart: 24, padding: 24, background: "var(--color-surface)", borderRadius: 12 }}>
      <strong>Respect prefers-reduced-motion</strong>
      <p style={note}>Optional motion must not block reading, navigation or the primary action.</p>
    </div>
  </main>,
};
