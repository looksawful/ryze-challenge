import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = p => readFileSync(join(root, p), "utf8");
function stories(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap(x =>
    x.isDirectory() ? stories(join(dir, x.name)) : x.name.endsWith(".stories.tsx") ? [join(dir, x.name)] : []);
}
test("no artificial Start Here page or sorting", () => {
  assert.equal(existsSync(join(root, "src/design-system/Overview.stories.tsx")), false);
  assert.doesNotMatch(read(".storybook/preview.tsx"), /Start Here|The actual Ryze component theme/);
});
test("stories contain no authored prose descriptions", () => {
  for(const p of stories("src")) {
    const source = read(p);
    assert.doesNotMatch(source, /\bdescription\s*:/, p);
    assert.doesNotMatch(source, /docs:\s*\{/, p);
    assert.doesNotMatch(source, /\b(?:Getting started|real production component|Storybook cannot|Current Ryze|legacy domain-entry|Use Controls|actual website-first|Source tokens|This is not)\b/i, p);
  }
});
test("foundations display actual design tokens, not editorial placeholder copy", () => {
  const source=read("src/design-system/Foundations.stories.tsx");
  assert.match(source, /--color-foreground/);
  assert.match(source, /--space-4/);
  assert.doesNotMatch(source, /Switch dawn\/dusk|Only functional separators|Resize the actual canvas|Text uses the same semantic/);
});
test("keep real Storybook interactions while removing the prose", () => {
  assert.match(read("src/features/hero/HeroConversation.stories.tsx"), /export const ReadyPreview/);
  assert.match(read("src/features/site-shell/SiteHeader.stories.tsx"), /export const DrawerOpen/);
  assert.match(read("src/features/consent/HomeworkCookieNotice.stories.tsx"), /export const Settings/);
});
