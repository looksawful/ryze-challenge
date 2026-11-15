import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("static export contains meaningful HTML before JavaScript executes", () => {
  const html = readFileSync("out/index.html", "utf8");
  assert.match(html, /<main[^>]*data-theme="dusk"[^>]*>/);
  assert.match(html, /<h1[^>]*>Interface preview<\/h1>/);
  assert.match(html, /Component design and interaction details are being finalized\./);
  assert.match(html, /<link[^>]*stylesheet/);
});
