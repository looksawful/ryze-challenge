import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const scene = resolve(import.meta.dirname, "../public/ryze-canvas");
const media = readFileSync(resolve(scene, "src/media.js"), "utf8");
const orbit = readFileSync(resolve(scene, "src/orbit.js"), "utf8");
const items = [...media.matchAll(/\{type:'(image|video)',src:'\.\/assets\/card-media\/([^']+)'\}/g)];
test("Hero animation includes 12 real media cards (nine photos, three videos)", () => {
  assert.equal(items.length, 12, "six additional images must be present");
  assert.equal(items.filter(item => item[1] === "image").length, 9);
  assert.equal(items.filter(item => item[1] === "video").length, 3);
  assert.match(orbit, /export const CARD_COUNT = 12;/);
  assert.deepEqual(items.map(item => item[2]), [
    "card-01.png", "card-02.mp4", "card-03.png", "card-04.mp4",
    "card-05.png", "card-06.mp4", "card-07.webp", "card-08.webp",
    "card-09.webp", "card-10.webp", "card-11.webp", "card-12.webp"
  ]);
  for (const [, , filename] of items) {
    assert.ok(statSync(resolve(scene, "assets/card-media", filename)).size > 1000, filename + " must exist");
  }
});
