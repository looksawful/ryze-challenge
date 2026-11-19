import test from "node:test";
import assert from "node:assert/strict";
import { createShardField } from "../public/ryze-canvas/src/paper-shards.mjs";

test("700 irregular paper shards assemble from all sides into the supplied silhouette", () => {
  const targets = new Float32Array([-0.25,-0.1, .2,.18, 0,0, -.1,.3, .3,-.2]);
  const options = { targets, count:700, width:1440, height:900, logoPixels:220, seed:890 };
  const first = createShardField(options);
  const second = createShardField(options);
  assert.deepEqual(first.start,second.start,"repeatable trajectories");
  assert.equal(first.start.length, 2100);
  assert.equal(first.target.length, 2100);
  assert.equal(first.size.length,700);
  assert.equal(first.delay.length,700);
  let external = 0;
  let sides = new Set();
  let minSize = Infinity, maxSize = 0;
  for(let i=0;i<700;i++){
    const a=i*3, x=first.start[a], y=first.start[a+1];
    if(Math.abs(x)>720||Math.abs(y)>450) external++;
    if(x < -720) sides.add("left");
    if(x > 720) sides.add("right");
    if(y > 450) sides.add("top");
    if(y < -450) sides.add("bottom");
    assert.ok(Number.isFinite(first.start[a+2]));
    assert.ok(Number.isFinite(first.target[a]));
    assert.ok(Number.isFinite(first.target[a+1]));
    assert.ok(first.delay[i]>=0 && first.delay[i]<=.72);
    minSize=Math.min(minSize,first.size[i]);
    maxSize=Math.max(maxSize,first.size[i]);
  }
  assert.ok(external >= 600, "most pieces fly in from outside the screen");
  assert.equal(sides.size,4);
  assert.ok(minSize < 3.1 && maxSize > 7.0, "many visible sizes");
});
test("shard generator handles narrow viewports without invalid values",()=>{
  const v=createShardField({targets:new Float32Array([0,0]),count:400,width:320,height:568,logoPixels:144});
  assert.equal(v.size.length,400);
  assert.ok([...v.start,...v.target].every(Number.isFinite));
});
