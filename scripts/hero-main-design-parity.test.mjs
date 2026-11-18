import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const hero = read("src/features/hero/Hero.tsx");
const css = read("src/features/hero/Hero.module.css");
const form = read("src/features/hero/HeroConversation.tsx");
const formCss = read("src/features/hero/HeroConversation.module.css");
const nav = read("src/features/site-shell/SiteHeader.tsx");
const navCss = read("src/features/site-shell/SiteHeader.module.css");
const canvas = read("public/ryze-canvas/src/main.js");

test("Hero uses canonical text, semantics and no static wordmark, keeping animated Canvas", () => {
  assert.match(hero, /A new way to grow<br\s*\/>\{" "\}your store/);
  assert.match(hero, /AI autopilot/);
  assert.match(hero, /Paid ads, SEO, AI visibility &amp; CRO/);
  assert.doesNotMatch(hero, /className=\{styles\.brand\}/);
  assert.doesNotMatch(hero, /brand-mark\.svg/);
  assert.match(canvas, /logoShape/);
  assert.match(canvas, /ryze:wind-start/);
});

test("relative headline and editorial copy are shared by laptop and desktop", () => {
  assert.match(css, /--type-heading-size: clamp\(3\.15rem, 6\.15vw, 8\.15rem\)/);
  assert.match(css, /\.headline > span \+ span\s*\{ text-align: end; \}/);
  assert.match(css, /\.lead\s*\{[^}]*inline-size: min\(100%, 29ch\)/s);
  assert.match(css, /\.description\s*\{[^}]*max-inline-size: 50ch/s);
  assert.doesNotMatch(css, /Duo Open:|@media\s*\(width\s*>=\s*2400px\)/);
});

test("form remains the dominant primary action on desktop and bottom-aligned on mobile", () => {
  assert.match(hero, /className=\{styles\.action\}/);
  assert.match(hero, /className=\{styles\.integration\}/);
  assert.doesNotMatch(hero, /styles\.actionCluster/);
  assert.match(css, /@media \(width < 800px\)/);
  assert.match(formCss, /min-block-size:\s*96px/);
  assert.match(formCss, /min-inline-size:\s*180px/);
  assert.match(form, /Start for free/);
});

test("navigation keeps original taxonomy while top floating panels are fully rounded", () => {
  assert.match(nav, /navigationGroups/);
  assert.match(nav, /mobileSiteSections/);
  assert.match(nav, /navigationProductCards/);
  assert.match(nav, /Contact us/);
  assert.match(navCss, /border-radius:\s*999px/);
  assert.doesNotMatch(navCss, /grid-template-columns:\s*1fr;\s*gap:\s*0;\s*\}/);
});
