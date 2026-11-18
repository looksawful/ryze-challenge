import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const hero = readFileSync(new URL("../src/features/hero/Hero.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/features/hero/Hero.module.css", import.meta.url), "utf8");
const action = readFileSync(new URL("../src/features/hero/HeroConversation.tsx", import.meta.url), "utf8");
const actionCss = readFileSync(new URL("../src/features/hero/HeroConversation.module.css", import.meta.url), "utf8");
const scene = readFileSync(new URL("../public/ryze-canvas/index.html", import.meta.url), "utf8");
const renderer = readFileSync(new URL("../public/ryze-canvas/src/main.js", import.meta.url), "utf8");

test("Hero has one adaptive row for form and integrations, without background cards", () => {
  assert.doesNotMatch(hero, /styles\.mediaComposition/);
  assert.match(hero, /className=\{styles\.action\}/);
  assert.doesNotMatch(hero, /styles\.actionCluster/);
  assert.match(hero, /<IntegrationLogos\s*\/>/);
  assert.match(css, /--type-heading-size:\s*clamp\(3\.15rem,\s*6\.15vw,\s*8\.15rem\)/);
  assert.match(css, /@media\s*\(width\s*<\s*800px\)/);
});

test("form submit uses original pill color and is not a square floating icon", () => {
  assert.match(action, /Start for free/);
  assert.match(actionCss, /\.composer button\s*\{[^}]*border-radius:\s*999px/s);
});

test("placeholder shows an independent typing/deleting cycle and stops for real input", () => {
  assert.match(action, /placeholderPhrases/);
  assert.match(action, /data-animated-placeholder/);
  assert.match(action, /prefers-reduced-motion/);
  assert.match(action, /stopPresentation/);
});

test("paper fragments blow away and fade, without morphing to mathematical circle", () => {
  assert.match(scene, /function renderWind\(/);
  assert.match(scene, /ryze:wind-start/);
  assert.match(scene, /ryze:blown/);
  assert.doesNotMatch(scene, /frame\.dispatchEvent\(new CustomEvent\('ryze:circle'\)\)/);
  assert.match(renderer, /ryze:wind-start/);
  assert.match(renderer, /ryze:blown/);
});
