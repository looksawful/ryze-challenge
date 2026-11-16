import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const hero = read("../src/features/hero/Hero.tsx");

test("Hero uses the actual integration logo component, not a placeholder graphic", () => {
  assert.match(hero, /<IntegrationLogos\s*\/>/);
  assert.doesNotMatch(hero, /integration-mark\.png/);
});

test("all five approved platform marks are rendered as semantic static HTML", () => {
  const component = read("../src/features/integrations/IntegrationLogos.tsx");
  for (const name of ["Shopify", "Google Ads", "Meta Ads", "TikTok", "Google Analytics"]) {
    assert.ok(component.includes(name), name);
  }
  assert.match(component, /<ul/);
  assert.match(component, /<li/);
});

test("a WebGL failure uses marquee and reduced motion uses static logos", () => {
  const component = read("../src/features/integrations/IntegrationLogos.tsx");
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /"marquee"/);
  assert.match(component, /"webgl"/);
  assert.match(component, /"static"/);
  assert.match(component, /webglcontextlost/);
  const css = read("../src/features/integrations/IntegrationLogos.module.css");
  assert.match(css, /flex-wrap: wrap/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(css, /@keyframes/);
});

test("slow WebGL frame delivery falls back to lightweight marquee", () => {
  const component = read("../src/features/integrations/IntegrationLogos.tsx");
  assert.match(component, /slowFrames >= 3/);
  assert.match(component, /if \(slowFrames >= 3\) \{\s*fallback\(\)/);
});

test("Storybook exposes the actual integrations component in isolated states and themes", () => {
  const component = read("../src/features/integrations/IntegrationLogos.tsx");
  const stories = read("../src/features/integrations/IntegrationLogos.stories.tsx");
  assert.match(component, /previewMode\??:/);
  assert.match(component, /previewMode = "auto"/);
  for (const name of ["Static", "ReducedMotion", "Marquee", "WebGL", "Dawn", "Dusk", "ThemeComparison", "RuntimeSwitching"]) {
    assert.match(stories, new RegExp("export const " + name + "\\b"), name);
  }
  assert.match(stories, /<IntegrationLogos/);
});
