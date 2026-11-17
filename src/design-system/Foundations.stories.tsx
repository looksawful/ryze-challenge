import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const swatches = [
  ["Accent", "--accent-current", "Actions"],
  ["Background", "--color-background", "Page"],
  ["Foreground", "--color-foreground", "Text"],
  ["Surface", "--color-surface", "Surfaces"],
  ["Muted", "--color-muted", "Secondary text"],
  ["Border", "--color-border", "Dividers"],
] as const;

const spacing = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-6", "--space-8", "--space-12"] as const;
const note = { color: "var(--color-muted)", lineHeight: 1.5 } as const;

const meta = {
  title: "Design System/Foundations",
  parameters: {
    layout: "padded",
    docs: { description: { component: "Live tokens and utilities from src/app/foundation.css, not an independent style guide." } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <main style={{ maxWidth: 700 }}>
      <h2>Colors</h2>
      <p style={note}>Switch dawn/dusk in the Storybook toolbar to inspect the same semantic tokens used on the site.</p>
      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {swatches.map(([name, token, usage]) => (
          <div key={token} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span aria-hidden="true" style={{ flex: "0 0 44px", height: 44, background: `var(${token})`, border: "1px solid var(--color-border)" }} />
            <div><strong>{name}</strong> <code>{token}</code><p style={note}>{usage}</p></div>
          </div>
        ))}
      </div>
    </main>
  ),
};

export const Typography: Story = {
  render: () => (
    <main style={{ maxWidth: 850 }}>
      <h2>Typography</h2>
      <p style={note}>Real selectable text using the site font tokens.</p>
      <p style={{ fontSize: "clamp(40px, 7vw, 88px)", letterSpacing: "-.05em", lineHeight: 1.05, marginTop: 24 }}>AI autopilot</p>
      <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", marginTop: 24 }}>A new way to grow your store.</h2>
      <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 24 }}>Paid ads, SEO, AI visibility &amp; CRO. One AI autopilot built around your business.</p>
    </main>
  ),
};

export const Spacing: Story = {
  render: () => (
    <main style={{ maxWidth: 750 }}>
      <h2>Spacing</h2>
      <p style={note}>CSS rem scale from the shared tokens.</p>
      {spacing.map(token => (
        <div key={token} style={{ display: "grid", gridTemplateColumns: "110px 1fr", alignItems: "center", gap: 12, marginTop: 12 }}>
          <code>{token}</code>
          <span style={{ display: "block", width: `var(${token})`, height: 18, background: "var(--accent-current)" }} />
        </div>
      ))}
    </main>
  ),
};

export const Layout: Story = {
  render: () => (
    <main style={{ maxWidth: 850 }}>
      <h2>Layout utilities</h2>
      <p style={note}>Resize the Storybook canvas to see intrinsic wrapping.</p>
      {(["cluster", "repel", "split", "auto-grid"] as const).map(name => (
        <section key={name} style={{ marginTop: 24 }}>
          <h3><code>.{name}</code></h3>
          <div className={name} style={{ outline: "1px dashed var(--color-border)", padding: 12, marginTop: 8 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ padding: 12, background: "var(--color-surface)" }}>Item {i}</div>)}
          </div>
        </section>
      ))}
    </main>
  ),
};

export const Motion: Story = {
  render: () => (
    <main style={{ maxWidth: "65ch" }}>
      <h2>Motion &amp; accessibility</h2>
      <p style={note}><code>--motion-duration</code> defaults to 0ms and changes to 240ms when reduced motion is not requested.</p>
      <p style={note}>Optional motion cannot block navigation, reading, or primary actions. Test no-JavaScript behavior on the exported site, not in Storybook.</p>
    </main>
  ),
};
