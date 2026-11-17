import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("Hero reveal starts on the assembled-fragments milestone, before circle completion", () => {
  const source = read("public/ryze-canvas/src/main.js");
  const shell = read("src/features/site-shell/HeroWithNavigation.tsx");
  assert.match(source, /addEventListener\(['"]ryze:assembled['"]/);
  assert.match(source, /type:\s*['"]ryze:assembled['"]/);
  assert.match(shell, /event\.data\?\.type === "ryze:assembled"/);
  assert.match(shell, /"revealing"/);
  assert.match(shell, /"ryze:intro-complete"/);
  assert.match(shell, /24000/);
});

test("Reveal order: H1, lead, description, CTA with integrations, navigation, desktop cookie", () => {
  const hero = read("src/features/hero/Hero.module.css");
  const nav = read("src/features/site-shell/HeroWithNavigation.module.css");
  const cookie = read("src/app/page.module.css");
  assert.match(hero, /\.headline\s*\{\s*--hero-enter-delay:\s*0s/);
  assert.match(hero, /\.lead\s*\{\s*--hero-enter-delay:\s*\.22s/);
  assert.match(hero, /\.description\s*\{\s*--hero-enter-delay:\s*\.44s/);
  assert.match(hero, /\.action\s*,\s*\.integration\s*\{\s*--hero-enter-delay:\s*\.66s/);
  assert.match(nav, /animation:\s*ryze-nav-reveal\s+\.48s\s+\.9s/);
  assert.match(cookie, /animation:\s*ryze-cookie-reveal\s+\.48s\s+1\.14s/);
  assert.match(hero, /prefers-reduced-motion:\s*reduce/);
  assert.match(nav, /prefers-reduced-motion:\s*reduce/);
  assert.match(nav, /\.stage\[data-intro="ready"\] \.navigation\s*\{\s*animation:\s*none/);
  assert.match(cookie, /prefers-reduced-motion:\s*reduce/);
});

test("No-JS and reduced-motion paths remain available", () => {
  const shell = read("src/features/site-shell/HeroWithNavigation.tsx");
  const css = read("src/features/site-shell/HeroWithNavigation.module.css");
  assert.match(shell, /<noscript>/);
  assert.match(shell, /reduced\.matches/);
  assert.match(css, /\.stage\[data-intro="ready"\] \.motionBackdrop/);
});
