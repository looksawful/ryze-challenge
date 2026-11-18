import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("Hero reveals after paper intro completion, not during fragment assembly", () => {
  const source = read("public/ryze-canvas/src/main.js");
  const shell = read("src/features/site-shell/HeroWithNavigation.tsx");
  assert.match(source, /addEventListener\(['"]ryze:assembled['"]/);
  assert.match(source, /type:\s*['"]ryze:assembled['"]/);
  assert.match(shell, /event\.data\?\.type === "ryze:assembled"/);
  assert.match(shell, /"revealing"/);
  assert.match(shell, /"ryze:intro-complete"/);
  assert.match(shell, /6500/);
});

test("One GSAP score reveals split H1 then lead, description, CTA, navigation and cookies", () => {
  const tokenSource = read("src/motion/tokens.ts");
  const entrance = read("src/motion/hero-entrance.ts");
  const nav = read("src/features/site-shell/HeroWithNavigation.module.css");
  const cookie = read("src/app/page.module.css");
  assert.match(tokenSource, /name: "headline", at: 0/);
  assert.match(tokenSource, /name: "lead", at: 0\.22/);
  assert.match(tokenSource, /name: "description", at: 0\.44/);
  assert.match(tokenSource, /name: "action", at: 0\.66/);
  assert.match(tokenSource, /name: "navigation", at: 0\.9/);
  assert.match(tokenSource, /name: "cookies", at: 1\.14/);
  assert.match(entrance, /SplitText\.create/);
  assert.match(entrance, /revertSplit/);
  assert.match(nav, /prefers-reduced-motion:\s*reduce/);
  assert.match(cookie, /prefers-reduced-motion:\s*reduce/);
});

test("No-JS and reduced-motion paths remain available", () => {
  const shell = read("src/features/site-shell/HeroWithNavigation.tsx");
  const css = read("src/features/site-shell/HeroWithNavigation.module.css");
  assert.match(shell, /<noscript>/);
  assert.match(shell, /reduced\.matches/);
  assert.match(css, /\.stage\[data-intro="ready"\] \.motionBackdrop/);
});
