// Seeded 3D frustum-space particle origins. No browser or Three.js dependency.
export function createParticleField({ width, height, count, targets, seed = 19026 }) {
  const w = Math.max(1, Number(width) || 1);
  const h = Math.max(1, Number(height) || 1);
  const n = Math.max(1, Math.floor(count));
  if (!targets || targets.length < 2 || targets.length % 2) {
    throw new Error("Particle targets must contain normalized x/y pairs");
  }
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const logoSize = Math.min(116, Math.max(88, Math.min(w, h) * .18));
  const distance = (h * .5) / Math.tan(Math.PI / 6);
  const start = new Float32Array(n * 3);
  const end = new Float32Array(n * 3);
  const curve = new Float32Array(n);
  const delay = new Float32Array(n);
  const seeds = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const r = random();
    const side = i % 4;
    // 80% start beyond the projection bounds. The rest come from depth.
    const outside = (i % 5) !== 4;
    const extent = 1.18 + random() * .68;
    const across = (random() - .5) * 3.1;
    const depth = distance * (-.72 + random() * 1.10);
    const depthScale = (distance - depth) / distance;
    let screenX, screenY;
    if (outside && side === 0) { screenX = -extent; screenY = across; }
    else if (outside && side === 1) { screenX = extent; screenY = across; }
    else if (outside && side === 2) { screenX = across; screenY = extent; }
    else if (outside) { screenX = across; screenY = -extent; }
    else { screenX = (random() - .5) * 1.6; screenY = (random() - .5) * 1.6; }
    start[i * 3] = screenX * w * .5 * depthScale;
    start[i * 3 + 1] = screenY * h * .5 * depthScale;
    start[i * 3 + 2] = depth;

    // Target position is sampled from the EXACT filled vector silhouette.
    const j = (Math.floor(random() * (targets.length / 2))) * 2;
    end[i * 3] = targets[j] * logoSize;
    end[i * 3 + 1] = targets[j + 1] * logoSize;
    end[i * 3 + 2] = 0;
    curve[i] = (random() < .5 ? -1 : 1) * (.13 + random() * .38) * Math.min(w, h);
    delay[i] = .012 + .34 * random();
    seeds[i] = r;
  }
  return { start, end, curve, delay, seeds, logoSize };
}
