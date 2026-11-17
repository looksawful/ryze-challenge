import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFile(join(root, path), "utf8");

test("dock is always pinned above the viewport and never translates offscreen", async () => {
  const css = await read("src/features/site-shell/SiteHeader.module.css");
  const code = await read("src/features/site-shell/SiteHeader.tsx");
  assert.match(css, /\.header\[data-variant="dock"\]\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*max\(/s);
  assert.doesNotMatch(css, /\[data-scroll-hidden="true"\]\s*\.mobileDock/);
  assert.doesNotMatch(code, /dataset\.scrollHidden\s*=\s*"true"/);
});

test("desktop menu is centred and narrows in place after scrolling", async () => {
  const css = await read("src/features/site-shell/SiteHeader.module.css");
  assert.match(css, /\.header\[data-variant="dock"\]\s*\.inner\s*\{[^}]*width:\s*min\(calc\(100%/s);
  assert.match(css, /\.header\[data-variant="dock"\]\[data-docked="true"\]\s*\.inner\s*\{[^}]*width:\s*min\(/s);
  assert.doesNotMatch(css, /\.header\[data-variant="dock"\]\[data-docked="true"\]\s*\{[^}]*inset:\s*12px\s+0\s+auto/s);
});

test("Cookies show only for the desktop page prototype and are not part of Hero", async () => {
  const page = await read("src/app/page.tsx");
  const style = await read("src/app/page.module.css");
  assert.match(page, /<HeroWithNavigation\s*\/>/);
  assert.match(page, /className=\{styles\.desktopCookies\}/);
  assert.match(style, /@media\s*\(width\s*<\s*75rem\)/);
  assert.match(style, /\.desktopCookies\s*\{\s*display:\s*none/);
});

test("Hero composition sizes to a viewport and allows document overflow only for accessibility", async () => {
  const css = await read("src/features/hero/Hero.module.css");
  assert.match(css, /block-size:\s*100svh/);
  assert.match(css, /@media\s*\(max-height:\s*3\d\dpx\)/);
  assert.match(css, /--type-heading-size:\s*32px/);
  assert.match(css, /--type-lead-size:\s*16px/);
  assert.match(css, /--type-paragraph-size:\s*14px/);
});

test("desktop compact menu uses the later agreed 720px width", async () => {
  const css = await read("src/features/site-shell/SiteHeader.module.css");
  assert.match(css, /data-docked="true"\]\s*\.inner\s*\{[^}]*45rem/s);
});

test("mobile expanded menu exposes a horizontally scrollable products shelf", async () => {
  const component = await read("src/features/site-shell/SiteHeader.tsx");
  const css = await read("src/features/site-shell/SiteHeader.module.css");
  assert.match(component, /mobileProductRail/);
  assert.match(component, /navigationProductCards\.map/);
  assert.match(css, /\.mobileProductRail\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /scroll-snap-type:\s*x\s+mandatory/);
});

test("primary Hero action is about five percent smaller while retaining 44px target", async () => {
  const css = await read("src/features/hero/Hero.module.css");
  assert.match(css, /inline-size:\s*min\(100%,\s*340px\)/);
  assert.match(css, /min-block-size:\s*76px/);
  assert.match(css, /min-block-size:\s*44px/);
});
