import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = () => readFileSync("src/app/foundation.css", "utf8");
const layout = () => readFileSync("src/app/layout.tsx", "utf8");
const page = () => readFileSync("src/app/page.tsx", "utf8");
const hero = () => readFileSync("src/features/hero/Hero.tsx", "utf8");

test("CSS layers use the approved ordered cascade", () => {
  assert.match(css(), /@layer reset, tokens, base, layouts, components, states, utilities;/);
});

test("theme and accent semantics are present", () => {
  assert.match(css(), /\[data-theme="dawn"\]/);
  assert.match(css(), /\[data-theme="dusk"\]/);
  assert.match(css(), /#ff5af1/i);
  assert.match(css(), /"Segoe UI"/);
});

test("motion is opted into, not enabled by default", () => {
  assert.match(css(), /@media\s*\(prefers-reduced-motion:\s*no-preference\)/);
});

test("server-rendered page has accessible static content in dusk", () => {
  assert.match(layout(), /import\s+["']\.\/foundation\.css["']/);
  assert.match(page(), /<Hero/);
  assert.match(hero(), /data-theme="dusk"/);
  assert.match(hero(), /<h1\b/);
  assert.doesNotMatch(page(), /"use client"/);
});

const heroStyles = () => readFileSync("src/features/hero/Hero.module.css", "utf8");

test("Hero preserves reflow rather than clipping oversized text", () => {
  assert.doesNotMatch(heroStyles(), /white-space:\s*nowrap/);
  assert.doesNotMatch(heroStyles(), /overflow:\s*clip/);
});
