# Ryze brand intro: wide-field particle convergence

**SUPERSEDED 2026-11-19:** The user clarified that the moving particles must remain the *original paper-cut polygons* and retain their assemble-then-wind-away logic. Do not implement the point-cloud engine proposed below. Current implemented specification, validation and release: [cut-paper intro report](../reports/2026-11-19-ryze-cut-paper-intro.md).
Date: 2026-11-19 · Scope: research and implementation planning only · Tracker: [#89](https://github.com/looksawful/ryze-challenge/issues/89)

## Observed source-of-truth (dev)
- [public/ryze-canvas/index.html](../../public/ryze-canvas/index.html) holds a hand-animated set of exactly 118 SVG paper paths plus phase events and a native/GSAP clock. It currently scatters the same pieces after assembly.
- [public/ryze-canvas/src/main.js](../../public/ryze-canvas/src/main.js) imports the bundled Three.js module, owns the existing fullscreen WebGL scene, perspective camera and renderer, and rasterizes animated SVG pieces onto a textured plane each frame.
- [src/features/integrations/logo-morph.ts](../../src/features/integrations/logo-morph.ts) is an independent shader morph. It uses 3,200 particle samples from image alpha, seeded positioning, per-point GLSL attributes, and gradual settling. Reuse its principles, **not** its independent renderer as an extra fullscreen canvas.
- [src/features/site-shell/HeroWithNavigation.tsx](../../src/features/site-shell/HeroWithNavigation.tsx) accepts the same-origin `ryze:intro-complete` message and has a 3,600 ms failure watchdog. An intro exceeding it would reveal Hero prematurely.
- [public/ryze-canvas/src/orbit.js](../../public/ryze-canvas/src/orbit.js) currently sets `SHOW_MEDIA_CARDS=false`; do not silently re-enable media cards in a particle redesign.
- [ADR 0002](../adr/0002-component-and-motion-architecture.md) approves static-first content, GSAP for UI sequence, WebGL/GLSL for particle rendering, no generic particle framework, and no extra Three.js dependency unless needed for 3D. The existing 3D intro already includes Three.js.

## Recommended effect
One 3D point cloud, inside the **existing** intro scene, with a precise sampled destination.
- Obtain target points by filling/rasterizing the canonical `#ryze-shape` `Path2D` into a one-off alpha mask (not the 118 paper-path approximations); sample both interior and silhouette edges; deterministic point-to-target assignment.
- Create a `THREE.BufferGeometry` with `aStart`, `aTarget`, `aSeed`, `aDelay`, and optional normalized tangent/side. Create a **single** `THREE.Points` with `ShaderMaterial`. No per-point GSAP tweens, no CPU position update each frame, no GPGPU physics simulation.
- Generate start positions in actual camera/frustum world coordinates. Recommend 75–85% outside viewport at ~1.15–1.7 projected half-extent, evenly distributed over four sides **and corners**, with the rest at varying positive/negative depth. On resize recompute both projected start positions and centered target layout.
- Let the vertex shader compute smooth arrival with per-particle delay, plus broad curved bending (tangential and radial perturbations) and small 3D oscillation. All turbulence must be multiplied by a decay envelope that reaches **exactly zero** at progress=1. Fade-in outside the viewport should create visible travel, not sudden on-screen teleportation.
- For a convincing readable mark: a short static hold, then blend points into the exact vector path, followed by particle departure or logo fade to reveal ordinary Hero. The static vector logo should not appear enlarged before arrival and should not pop after.
- Leave `IntegrationLogos` and its standalone WebGL morph unchanged; these are different components with different timelines.

### Proposed motion timing (design starting values; adjust after visual review)
| Stage | Relative time | Observation |
| --- | --- | --- |
| Offscreen and depth approach | 0–1.5 s | scattered particles move through most of viewport |
| Spiral, convergence, slow final settling | 1.5–2.6 s | logo becomes increasingly legible |
| Exact shape hold | 2.6–2.85 s | visually stable mark |
| Disperse/clear canvas | 2.85–3.35 s | no visible seam before Hero |
| Existing Hero transition | after intro event | parent handles reveal, not a parallel timer |

The parent watchdog must exceed the successful intro duration, e.g. around 6 seconds, and remain purely a failure escape. Event-driven completion is primary.

### Draft technical formula
```glsl
float t = clamp((uProgress - aDelay) / (1.0 - aDelay), 0.0, 1.0);
float ease = t * t * (3.0 - 2.0 * t);
float envelope = sin(3.14159265 * t);
vec3 p = mix(aStart, aTarget, ease);
p += aTangent * aCurve * envelope;
p += aNoiseAxis * aSwirl * envelope * envelope;
gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
```
This is a trajectory sketch, not production-ready shader code. Render circular particles with smooth alpha using `gl_PointCoord`; size may vary slightly with depth and stable per-particle seed.

## Performance/fallback
- Proposed starting counts: ~3,200 desktop, ~1,600–2,200 mobile, adjusted only after real measurements. Max pixel ratio bounded as existing.
- GPU positions and colors update in one draw call; target sampling happens once, plus resize. Avoid repeated large canvas `getImageData` on frames.
- On successful completion cancel the animation frame loop and release temporary GPU resources without destroying any retained media scene.
- No JS / reduced-motion / WebGL failure: render immediately usable normal Hero and its static brand identity. Lost context triggers the same usable fallback.
- Explicitly verify no intro flash, hidden focus traps, scrollbars, overshooting parent timeout, or delayed interactions.

## Verification plan
1. `node --check public/ryze-canvas/src/main.js`; `npm test`; `npm run lint`; `npm run typecheck`; `npm run build`.
2. Browser snapshots at 320×700, 390×844, 874×402, 1440×900: first frame, mid-flight, final precise mark, cleared intro, Hero ready.
3. JS-disabled, reduced-motion, WebGL blocked/context lost, slow-resource init, tab visibility changes, orientation/resize, repeated reloads and no horizontal overflow.
4. Real iPhone Safari and desktop Chrome/Firefox where available; report actual devices, frame timing and FPS rather than claiming unobserved performance.
5. Storybook uses actual application components; retain static, reduced, lightweight/full states without parallel shadow implementations.

## External evidence
- [Three.js Points and geometry](https://threejs.org/manual/pages/primitives.html): draws vertices from one BufferGeometry as point primitives.
- [Three.js BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html): attributes store per-point source, target and seed data.
- [Three.js ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html): custom vertex/fragment behavior with WebGLRenderer.
- [GSAP timelines](https://gsap.com/docs/v3/GSAP/Timeline/): sequencing, callbacks and completion events.
- [Codrops SVG-path particle technique](https://tympanus.net/codrops/2022/01/19/animate-anything-along-an-svg-path/): contextual reference, not a package requirement.

## Decision boundary
This is a proposal, not an implemented effect, QA certificate, or release. All code changes, approvals, tests and checkpoints belong to [Issue #89](https://github.com/looksawful/ryze-challenge/issues/89). The prior [Issue #15](https://github.com/looksawful/ryze-challenge/issues/15) was closed as not planned for the older scope; do not reopen it silently.
