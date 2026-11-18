import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = path => readFileSync(join(root, path), "utf8");

function stories(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true })
    .flatMap(entry => entry.isDirectory() ? stories(join(dir, entry.name)) : entry.name.endsWith(".stories.tsx") ? [join(dir, entry.name)] : []);
}

test("Storybook exposes one consistent Design System hierarchy", () => {
  for (const path of stories("src")) {
    const source = read(path);
    const title = source.match(/title:\s*["']([^"']+)["']/)?.[1];
    assert.ok(title?.startsWith("Design System/"), path + ": " + title);
    assert.ok(!title.includes("RYZE/"), path);
  }
  assert.match(read("src/ui/Button.stories.tsx"), /Design System\/Components\/Button/);
  assert.match(read("src/ui/Typography.stories.tsx"), /Design System\/Foundations\/Typography/);
  assert.match(read("src/design-system/Foundations.stories.tsx"), /Design System\/Foundations\/Tokens/);
});

test("Core components document API, states, and use production primitives", () => {
  for (const path of [
    "src/ui/Button.stories.tsx",
    "src/ui/Typography.stories.tsx",
    "src/features/integrations/IntegrationLogos.stories.tsx",
    "src/features/site-shell/SiteHeader.stories.tsx"
  ]) {
    const source=read(path);
    assert.match(source, /tags:\s*\["autodocs"\]/, path + " docs");
    assert.match(source, /component:/, path + " production component");
  }
  const foundational=read("src/design-system/Foundations.stories.tsx");
  assert.match(foundational, /--color-foreground/);
  assert.doesNotMatch(foundational, /fontSize:\s*"clamp\(40px/);
  assert.match(read("src/features/integrations/IntegrationLogos.stories.tsx"), /export const Static:/);
});

test("Canvas shares theme bounds and responsive presets", () => {
  const preview=read(".storybook/preview.tsx");
  assert.match(preview, /minHeight:\s*"100svh"/);
  assert.match(preview, /storySort/);
  assert.match(preview, /320px/);
  assert.match(preview, /390px/);
  assert.match(preview, /storybook-canvas\.css/);
  const css=read(".storybook/storybook-canvas.css");
  assert.match(css, /sb-main-padded/);
});

test("Start Here is absent", () => {
  assert.doesNotMatch(read(".storybook/preview.tsx"), /Start Here/);
});
