import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const load = path => readFileSync(path, "utf8");

test("Hero entrance has a single ordered score in the motion system", async () => {
  const { MOTION, HERO_ENTRANCE_CUES } = await import("../src/motion/tokens.ts");
  assert.deepEqual(HERO_ENTRANCE_CUES.map(cue=>cue.name),
    ["brand","headline","lead","description","mascot","action","integration","navigation","cookies"]);
  assert.deepEqual(HERO_ENTRANCE_CUES.map(cue=>cue.at),
    [0,0,.22,.44,.44,.66,.66,.9,1.14]);
  assert.ok(MOTION.enter.duration >= .4 && MOTION.enter.duration <= .85);
  assert.ok(MOTION.control.duration <= .28);
  assert.ok(MOTION.exit.duration < MOTION.enter.duration);
});

test("The first-screen orchestration uses GSAP timelines and the 118-piece assembly event", () => {
  const composer = load("src/motion/hero-entrance.ts");
  const shell = load("src/features/site-shell/HeroWithNavigation.tsx");
  const css = load("src/features/hero/Hero.module.css");
  assert.match(composer, /gsap\.timeline\(/);
  assert.match(composer, /HERO_ENTRANCE_CUES/);
  assert.match(composer, /\.fromTo\(/);
  assert.match(shell, /"ryze:assembled"/);
  assert.match(shell, /data-motion-driver/);
  assert.match(composer, /SplitText\.create/);
  assert.match(composer, /revertSplit/);
});

test("CSS fallback, no-JS and reduced-motion preserve usable first screen", () => {
  const shell = load("src/features/site-shell/HeroWithNavigation.tsx");
  const css = load("src/features/site-shell/HeroWithNavigation.module.css");
  const page = load("src/app/page.module.css");
  assert.match(shell, /<noscript>/);
  assert.match(shell, /prefers-reduced-motion: reduce/);
  assert.match(css, /data-motion-driver="gsap"/);
  assert.match(page, /data-motion-driver="gsap"/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("Only one animation driver controls the premium mega menu", () => {
  const header = load("src/features/site-shell/SiteHeader.tsx");
  const css = load("src/features/site-shell/SiteHeader.module.css");
  assert.match(css, /\.megaPanel:not\(\[data-gsap-active="true"\]\)/);
  assert.match(header, /panel\.dataset\.gsapActive = "true"/);
  assert.match(header, /panel\.removeAttribute\("data-gsap-active"\)/);
});
