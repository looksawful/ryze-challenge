import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "ryze-canvas");
const read = (p) => readFileSync(join(root, p), "utf8");

test("moving photo/video cards can be disabled without removing their source assets", () => {
  const orbit = read("src/orbit.js");
  const scene = read("src/main.js");
  const media = read("src/media.js");
  assert.match(orbit, /export const SHOW_MEDIA_CARDS = false;/);
  assert.match(scene, /if\s*\(SHOW_MEDIA_CARDS\)\s*for\s*\(let i=0;i<CARD_COUNT;i\+\+\)/);
  assert.match(scene, /if\s*\(!SHOW_MEDIA_CARDS\)\s*\{[\s\S]*?orbitFinished=true;[\s\S]*?announceIntroComplete\(\);[\s\S]*?return;/);
  assert.match(media, /card-12\.webp/);
  assert.ok(statSync(join(root, "assets", "card-media", "card-12.webp")).size>1000);
});
