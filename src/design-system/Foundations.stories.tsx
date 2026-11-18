import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";

const swatches = [
  ["Accent", "--accent-current", "Actions and brand emphasis"],
  ["Background", "--color-background", "Full page canvas"],
  ["Foreground", "--color-foreground", "Primary content"],
  ["Surface", "--color-surface", "Secondary surfaces"],
  ["Muted", "--color-muted", "Supporting content"],
  ["Border", "--color-border", "Only functional separators"],
] as const;

const spacing = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-6", "--space-8", "--space-12"] as const;
const note = { color: "var(--color-muted)", lineHeight: 1.5 } as const;
const main = { maxInlineSize: "52rem", display: "grid", gap: "var(--space-6)" } as const;

const meta = {
  title: "Design System/Foundations/Tokens",
  parameters: {
    layout: "padded",
    docs: { description: { component: "Read-only live demonstrations of src/app/foundation.css. Values come from the actual site CSS. This is not a second token system." } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <main style={main}>
      <header>
        <h2 style={{ fontSize: "1.625rem" }}>Semantic colors</h2>
        <p style={note}>Switch dawn/dusk using the Storybook toolbar. Tokens are shown by purpose, not by arbitrary swatch names.</p>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))", gap: "var(--space-4)" }}>
        {swatches.map(([name, token, usage]) => (
          <section key={token} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span aria-hidden="true" style={{ flex: "0 0 3rem", blockSize: "3rem", background: "var(" + token + ")", border: "1px solid var(--color-border)" }} />
            <div style={{ minInlineSize: 0 }}>
              <strong>{name}</strong>
              <p style={{ ...note, fontSize: "0.875rem" }}>{usage}</p>
              <code style={{ fontSize: "0.75rem" }}>{token}</code>
            </div>
          </section>
        ))}
      </div>
      <section style={{ display: "grid", gap: "var(--space-3)" }}>
        <h3 style={{ fontSize: "1.125rem" }}>Applied in production components</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap", background: "var(--color-surface)", padding: "var(--space-4)" }}>
          <Button>Continue</Button>
          <Typography as="p" variant="paragraph">Text uses the same semantic foreground as the live site.</Typography>
        </div>
      </section>
    </main>
  ),
};

export const TypeScale: Story = {
  name: "Type scale",
  render: () => (
    <main style={main}>
      <header>
        <h2 style={{ fontSize: "1.625rem" }}>Type scale</h2>
        <p style={note}>These are actual Typography variants, not approximated font sizes. Edit props in Foundations / Typography.</p>
      </header>
      <Typography as="h3" variant="heading">AI autopilot for your Shopify</Typography>
      <Typography as="p" variant="lead">A new way to grow your store.</Typography>
      <Typography as="p" variant="paragraph">Paid ads, SEO, AI visibility &amp; CRO. One AI autopilot built around your business.</Typography>
    </main>
  ),
};

export const Spacing: Story = {
  render: () => (
    <main style={main}>
      <header>
        <h2 style={{ fontSize: "1.625rem" }}>Spacing</h2>
        <p style={note}>A visual reference for the actual rem-based scale in foundation.css.</p>
      </header>
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        {spacing.map(token => (
          <div key={token} style={{ display: "grid", gridTemplateColumns: "minmax(6rem, 8rem) 1fr", alignItems: "center", gap: "var(--space-3)" }}>
            <code>{token}</code>
            <span aria-hidden="true" style={{ display: "block", inlineSize: "var(" + token + ")", blockSize: "var(--space-4)", background: "var(--accent-current)" }} />
          </div>
        ))}
      </div>
    </main>
  ),
};

export const Layout: Story = {
  render: () => (
    <main style={main}>
      <header>
        <h2 style={{ fontSize: "1.625rem" }}>Layout utilities</h2>
        <p style={note}>Resize the actual canvas to see these classes wrap. Labels explain roles, not pretend to be production components.</p>
      </header>
      {(["cluster", "repel", "split", "auto-grid"] as const).map(name => (
        <section key={name} style={{ display: "grid", gap: "var(--space-3)" }}>
          <h3 style={{ fontSize: "1rem" }}><code>.{name}</code></h3>
          <div className={name} style={{ padding: "var(--space-3)", background: "var(--color-surface)" }}>
            {["Navigation", "Content", "Action"].map(label => (
              <div key={label} style={{ padding: "var(--space-3)", background: "var(--color-background)" }}>{label}</div>
            ))}
          </div>
        </section>
      ))}
    </main>
  ),
};

export const Motion: Story = {
  render: () => (
    <main style={{ ...main, maxInlineSize: "65ch" }}>
      <h2 style={{ fontSize: "1.625rem" }}>Motion and accessibility</h2>
      <p style={note}><code>--motion-duration</code> is 0ms for reduced motion and 240ms otherwise. Additional durations and easing are defined in the same foundation tokens.</p>
      <p style={note}>Optional motion cannot block navigation, reading or primary actions. Storybook can simulate static fallbacks, but only the real page can verify a no-JavaScript mode.</p>
    </main>
  ),
};
