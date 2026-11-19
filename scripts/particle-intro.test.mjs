import test from "node:test";
import assert from "node:assert/strict";
import { createParticleField } from "../public/ryze-canvas/src/particle-field.mjs";

const targets = new Float32Array([
  -0.3, -0.2, 0, 0.25, 0.3, -0.1, 0.1, 0.2,
]);

test("particle field is deterministic, finite, and lands exactly on sampled mark", () => {
  const options = { width: 1440, height: 900, count: 3200, targets, seed: 19026 };
  const first = createParticleField(options);
  const second = createParticleField(options);
  assert.equal(first.start.length, 3200 * 3);
  assert.deepEqual([...first.start], [...second.start]);
  assert.deepEqual([...first.end], [...second.end]);
  assert.deepEqual([...first.curve], [...second.curve]);
  assert.deepEqual([...first.delay], [...second.delay]);
  for (let i = 0; i < options.count; i++) {
    assert.ok(Number.isFinite(first.start[i * 3]));
    assert.ok(Number.isFinite(first.start[i * 3 + 1]));
    assert.ok(Number.isFinite(first.start[i * 3 + 2]));
    const tx = first.end[i * 3], ty = first.end[i * 3 + 1];
    assert.ok(Math.abs(tx) <= first.logoSize * 0.5 + 0.001);
    assert.ok(Math.abs(ty) <= first.logoSize * 0.5 + 0.001);
    assert.equal(first.end[i * 3 + 2], 0);
    assert.ok(first.delay[i] >= 0 && first.delay[i] <= 0.38);
  }
});

test("at least 78% of particles start beyond visible frustum", () => {
  for (const [width, height] of [[1440, 900], [390, 844], [874, 402]]) {
    const field = createParticleField({ width, height, count: 1200, targets });
    const distance = (height * 0.5) / Math.tan(Math.PI / 6);
    let offscreen = 0;
    let left = 0, right = 0, top = 0, bottom = 0;
    for (let i = 0; i < 1200; i++) {
      const z = field.start[i * 3 + 2];
      const scale = distance / (distance - z);
      const x = field.start[i * 3] * scale;
      const y = field.start[i * 3 + 1] * scale;
      if (Math.abs(x) > width * 0.5 || Math.abs(y) > height * 0.5) offscreen++;
      if (x < -width * .5) left++;
      if (x > width * .5) right++;
      if (y > height * .5) top++;
      if (y < -height * .5) bottom++;
    }
    assert.ok(offscreen >= 1200 * .78, `${width}x${height}: offscreen=${offscreen}`);
    assert.ok(Math.min(left, right, top, bottom) >= 150, `all four sides represented: ${width}x${height}`);
  }
});

test("handles narrow and zero-sized viewports without invalid geometry", () => {
  const field = createParticleField({ width: 0, height: 0, count: 8, targets });
  assert.equal(field.start.length, 24);
  assert.ok(field.start.every(Number.isFinite));
  assert.ok(field.end.every(Number.isFinite));
});
