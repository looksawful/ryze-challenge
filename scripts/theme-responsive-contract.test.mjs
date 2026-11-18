import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/features/site-shell/HeroWithNavigation.tsx", "utf8");
const stories = readFileSync("src/features/site-shell/HeroWithNavigation.stories.tsx", "utf8");
const heroCSS = readFileSync("src/features/hero/Hero.module.css", "utf8");

test("full first-screen passes one explicit theme to Hero and Dock", () => {
  assert.match(shell, /export function HeroWithNavigation\(\{ theme = "dusk" \}/);
  assert.match(shell, /<SiteHeader[\s\S]*?theme=\{theme\}/);
  assert.match(shell, /<Hero theme=\{theme\}/);
  assert.match(shell, /data-theme=\{theme\}/);
});

test("Dawn first-screen is immediately visible without dusk-only cinematic canvas", () => {
  assert.match(shell, /useState<IntroPhase>\(theme === "dawn" \? "ready" : "playing"\)/);
  assert.match(shell, /\{theme === "dusk" && <HeroMotionBackground \/>\}/);
});

test("Storybook full first-screen actually follows Dawn/Dusk toolbar", () => {
  assert.match(stories, /context\.globals\.theme === "dawn"/);
  assert.match(stories, /<HeroWithNavigation theme=\{/);
});

test("ultrawide logo stays in upper right rather than using negative margin", () => {
  const blocks = [...heroCSS.matchAll(/@media \(width >= 2400px\)/g)];
  assert.ok(blocks.length >= 2);
  const lastLayout = heroCSS.slice(blocks[1].index, heroCSS.indexOf("/* Short landscape windows:", blocks[1].index));
  const brand = lastLayout.match(/\.brand\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.match(brand, /grid-column:\s*10\s*\/\s*13/);
  assert.match(brand, /justify-self:\s*end/);
  assert.doesNotMatch(brand, /margin-inline:\s*-/);
});
