import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFile(join(root, path), "utf8");

test("application renders a single shared navigable first screen", async () => {
  const page = await read("src/app/page.tsx");
  assert.match(page, /<HeroWithNavigation\s*\/>/);
  assert.match(page, /<HomeworkCookieNotice\s*\/>/);
  assert.doesNotMatch(page, /<Hero\s*\/>/);
});

test("first-screen uses the approved scroll-aware dock without displacing Hero", async () => {
  const shell = await read("src/features/site-shell/HeroWithNavigation.tsx");
  const css = await read("src/features/site-shell/HeroWithNavigation.module.css");
  assert.match(shell, /variant="dock"/);
  assert.match(shell, /enhancement="auto"/);
  assert.match(shell, /data-ryze-dark-end/);
  assert.match(shell, /<Hero\s+theme=\{theme\}\s*\/>/);
  assert.match(css, /position:\s*absolute/);
  assert.match(css, /noscript\s+nav/);
});

test("Storybook previews the very same assembled first-screen component", async () => {
  const story = await read("src/features/site-shell/HeroWithNavigation.stories.tsx");
  assert.match(story, /import\s+\{\s*HeroWithNavigation\s*\}/);
  assert.match(story, /component:\s*HeroWithNavigation/);
});


test("top mobile navigation floats above the Hero's own safe inset", async () => {
  const css = await read("src/features/site-shell/SiteHeader.module.css");
  const stage = await read("src/features/site-shell/HeroWithNavigation.module.css");
  const hero = await read("src/features/hero/Hero.module.css");
  assert.match(css, /\.header\[data-variant="dock"\] \.mobileDock\s*\{[^}]*inset-block-start:/s);
  assert.match(stage, /@media\s*\(width < 64rem\)[^}]*\.navigation\s*\{[^}]*position:\s*absolute/s);
  assert.match(hero, /padding-block-start:\s*max\(96px,\s*calc\(84px\s*\+/s);
});

test("top mobile navigation stays fixed and the desktop nav shrinks without moving", async () => {
  const css = await read("src/features/site-shell/SiteHeader.module.css");
  const code = await read("src/features/site-shell/SiteHeader.tsx");
  assert.match(css, /\.header\[data-variant="dock"\]\[data-docked="true"\] \.inner/);
  assert.doesNotMatch(css, /\[data-scroll-hidden="true"\] \.mobileDock/);
  assert.match(code, /window\.scrollY >= 120/);
});

test("bottom Cookies ignore a mobile dock that is now at the top of the screen", async () => {
  const cookie = await read("src/features/consent/HomeworkCookieNotice.tsx");
  assert.match(cookie, /navigationRect\.top\s*>\s*window\.innerHeight\s*\/\s*2/);
});
