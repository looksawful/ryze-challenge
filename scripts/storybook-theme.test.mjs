import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL("../src/" + path, import.meta.url), "utf8");

test("component stories use global theme rather than conflicting local theme args", () => {
  for (const file of ["features/integrations/IntegrationLogos.stories.tsx", "features/site-shell/SiteHeader.stories.tsx"]) {
    const source = read(file);
    assert.match(source, /context\.globals\.theme/);
    assert.doesNotMatch(source, /theme:\s*"dusk"\s*,\s*\}/);
  }
});

test("Hero story title has no corrupted status label", () => {
  const source = read("features/hero/Hero.stories.tsx");
  assert.match(source, /title: "Design System\/Screens\/Hero"/);
  assert.doesNotMatch(source, /\uFFFD/);
});
