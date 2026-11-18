import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/ui/Button.module.css", import.meta.url), "utf8");
const stories = readFileSync(new URL("../src/ui/Button.stories.tsx", import.meta.url), "utf8");

test("compact buttons retain a 44px minimum hit height", () => {
  const block = css.match(/\.compact\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.match(block, /min-block-size:\s*(?:44px|2\.75rem)/);
});

test("hover styling applies only where the pointer supports hover", () => {
  assert.match(css, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
});

test("button has visible press feedback without layout-affecting dimensions", () => {
  assert.match(css, /\.button:active/);
  assert.match(css, /scale:\s*0\.985/);
  assert.doesNotMatch(css, /transition:\s*(?:all|width|height)\b/);
});

test("reduced motion disables button transformations and transitions", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /transition:\s*none/);
});

test("buttons contain no decorative shadows or outlined borders", () => {
  assert.doesNotMatch(css, /box-shadow\s*:/);
  assert.doesNotMatch(css, /border:\s*[1-9]/);
});

test("Storybook contains a visual states gallery alongside controls", () => {
  assert.match(stories, /export const Playground/);
  assert.match(stories, /export const States/);
  assert.match(stories, /data-visual-state="hover"/);
  assert.match(stories, /data-visual-state="pressed"/);
});
