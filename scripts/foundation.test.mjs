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
  assert.match(layout(), /<body data-theme="dusk"/);
  assert.match(hero(), /data-theme=\{theme\}/);
  assert.match(hero(), /<h1\b|<Typography\s+as="h1"\s+variant="heading"/);
  assert.doesNotMatch(page(), /"use client"/);
});

const heroStyles = () => readFileSync("src/features/hero/Hero.module.css", "utf8");

test("Hero preserves reflow rather than clipping oversized text", () => {
  assert.doesNotMatch(heroStyles(), /white-space:\s*nowrap/);
  assert.doesNotMatch(heroStyles(), /overflow:\s*clip/);
});

test("Homework Cookies are JS-only and retain a choice until changed", () => {
  const consent = readFileSync("src/features/consent/HomeworkCookieNotice.tsx", "utf8");
  assert.match(page(), /<HomeworkCookieNotice\s*\/>/);
  assert.match(page(), /<HomeworkCookieSettingsButton\s*\/>/);
  assert.match(consent, /if \(!mounted \|\| !visible\) return null/);
  assert.match(consent, /localStorage\.setItem/);
  assert.match(consent, /ryze:cookie-settings/);
  for (const label of ["Accept all cookies", "Reject all cookies", "Customize cookie settings", "Save preferences"]) {
    assert.ok(consent.includes(label), label);
  }
});

test("Cookie foreground follows sampled background rather than stale theme text", () => {
  const source = readFileSync("src/features/consent/HomeworkCookieNotice.tsx", "utf8");
  assert.match(source, /function foregroundForBackground\(/);
  assert.match(source, /setProperty\("--cookie-foreground", foregroundForBackground\(background\)\)/);
});

test("Cookie Storybook args hook lives directly in its render function", () => {
  const source = readFileSync("src/features/consent/HomeworkCookieNotice.stories.tsx", "utf8");
  assert.match(source, /render:\s*function CookieStoryRender\(args\) \{\s*const \[, updateArgs\] = useArgs/);
});

test("Cookie placement tracks the visible Shopify Dock rather than desktop header state", () => {
  const source = readFileSync("src/features/consent/HomeworkCookieNotice.tsx", "utf8");
  assert.match(source, /\[data-preview-part="mobile-dock"\]/);
  assert.match(source, /navigation\?\.getBoundingClientRect\(\)/);
  assert.match(source, /navigationRect\.top/);
  assert.doesNotMatch(source, /matches\('\[data-docked="false"\]'\)/);
});

test("Storybook Closed and Notice controls never modify stored consent", () => {
  const source = readFileSync("src/features/consent/HomeworkCookieNotice.stories.tsx", "utf8");
  assert.doesNotMatch(source, /localStorage\.(?:setItem|removeItem)/);
  assert.doesNotMatch(source, /Reject all cookies/);
  assert.match(source, /initialView=\{state\}/);
});

test("Homework cookie visual matches the borderless, intrinsically sized reference", () => {
  const styles = readFileSync("src/features/consent/HomeworkCookieNotice.module.css", "utf8");
  assert.match(styles, /border:\s*0;/);
  assert.match(styles, /box-shadow:\s*none;/);
  assert.match(styles, /flex-wrap:\s*wrap/);
  assert.match(styles, /max-block-size:\s*calc\(100svh/);
});
