import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (name) => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("desktop heading uses a centered bounded two-line measure; mobile remains fluid", () => {
  const css = read("src/features/hero/Hero.module.css");
  assert.match(css, /\.headline\s*\{[^}]*justify-self:\s*center;[^}]*inline-size:\s*min\(100%,\s*60vw\)/s);
  assert.match(css, /@media \(width < 800px\)\s*\{[\s\S]*?\.headline\s*\{[^}]*inline-size:\s*100%/);
});

test("paper SVG and Three.js mark share a small CSS-pixel target inside fullscreen canvas", () => {
  const svg = read("public/ryze-canvas/index.html");
  const three = read("public/ryze-canvas/src/main.js");
  assert.match(svg, /const logoPixels = Math\.min\(116, Math\.max\(88, Math\.min\(w,h\)\*\.18\)\)/);
  assert.match(three, /const logoPixels = Math\.min\(116, Math\.max\(88, Math\.min\(frame\.clientWidth,frame\.clientHeight\)\*\.18\)\)/);
  assert.match(svg, /const span = logoPixels \* unit/);
  assert.match(three, /return logoPixels \* density \/ 40/);
  assert.match(svg, /#scene \{ width:100%; height:100%/);
});

test("invalid website feedback remains visible in an outlined error form", () => {
  const component = read("src/features/hero/HeroConversation.tsx");
  const css = read("src/features/hero/HeroConversation.module.css");
  assert.match(component, /data-state=\{error \? "error" : undefined\}/);
  assert.match(component, /role=\{reply\.kind === "error" \? "alert" : "status"\}/);
  assert.match(css, /\.composer\[data-state="error"\]\s*\{[^}]*box-shadow:/s);
  assert.doesNotMatch(component, /Preparing a sample preview|kind:\s*"processing"/);
});

test("paper fragments assemble locally around the small logo, not from viewport edges", () => {
  const svg = read("public/ryze-canvas/index.html");
  assert.match(svg, /const centerX = ox \+ span\/2, centerY = oy \+ span\/2/);
  assert.match(svg, /const spread = span\*\.7/);
  assert.doesNotMatch(svg, /sx=-margin|sx=sw\+margin|sy=-margin|sy=sh\+margin/);
  assert.match(svg, /windDX:14\+rand\(\)\*18/);
});
