import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const hero = read("../src/features/hero/Hero.tsx");
const component = read("../src/features/integrations/IntegrationLogos.tsx");
const css = read("../src/features/integrations/IntegrationLogos.module.css");

test("Hero renders the complete integrations component, including its caption", () => {
  assert.match(hero, /<IntegrationLogos\s*\/>/);
  assert.doesNotMatch(hero, /Plugs into/);
  assert.match(component, /Plugs into/);
  assert.match(component, /any platform/);
});

test("five approved logos remain in semantic static HTML", () => {
  for (const name of ["Shopify", "Google Ads", "Meta Ads", "TikTok", "Google Analytics"]) {
    assert.ok(component.includes(name), name);
  }
  assert.match(component, /<ul/);
  assert.match(component, /<li/);
});

test("static is the only fallback for reduced motion, WebGL loss and slow frames", () => {
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /webglcontextlost/);
  assert.match(component, /slowFrames >= 3/);
  assert.match(component, /host\.dataset\.mode = "static"/);
  assert.doesNotMatch(component + css, /marquee|logo-scroll|logo-scroll/);
  assert.match(css, /prefers-reduced-motion: no-preference/);
});

test("intrinsic logo grid and proportional caption are inside the component", () => {
  assert.match(css, /repeat\(auto-fit, minmax\(/);
  assert.match(css, /--integration-logo-size: clamp\(/);
  assert.match(css, /\.caption/);
  assert.match(css, /font-size: clamp\(/);
  assert.match(component, /className=\{styles\.caption\}/);
});
