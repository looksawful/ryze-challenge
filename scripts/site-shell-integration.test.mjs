import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFile(join(root, path), "utf8");

test("application renders a single shared navigable first screen", async () => {
  const page = await read("src/app/page.tsx");
  assert.match(page, /<HeroWithNavigation\s*\/>/);
  assert.match(page, /<CookieConsent\s*\/>/);
  assert.doesNotMatch(page, /<Hero\s*\/>/);
});

test("first-screen navigation overlays, not displaces, approved Hero content", async () => {
  const shell = await read("src/features/site-shell/HeroWithNavigation.tsx");
  const css = await read("src/features/site-shell/HeroWithNavigation.module.css");
  assert.match(shell, /<SiteHeader\s+variant="hero"\s*\/>/);
  assert.match(shell, /<Hero\s*\/>/);
  assert.match(css, /position:\s*absolute/);
  assert.match(css, /noscript\s+nav/);
});

test("Storybook previews the very same assembled first-screen component", async () => {
  const story = await read("src/features/site-shell/HeroWithNavigation.stories.tsx");
  assert.match(story, /import\s+\{\s*HeroWithNavigation\s*\}/);
  assert.match(story, /component:\s*HeroWithNavigation/);
});
