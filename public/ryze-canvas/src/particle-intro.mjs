import * as THREE from '../vendor/three/three.module.js';
import { createParticleField } from './particle-field.mjs';

const canvas = document.getElementById('particles');
const mark = document.getElementById('mark');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const FORM_TIME = 2.65;
const TOTAL_TIME = 3.65;
let finished = false;
let raf = 0;
let renderer;
let geometry;
let material;
let particles;
let camera;
let scene;
let started = 0;
let pauseAt = 0;
let targets;

function complete(reason = 'complete') {
  if (finished) return;
  finished = true;
  cancelAnimationFrame(raf);
  mark.style.opacity = '0';
  if (particles) scene.remove(particles);
  geometry?.dispose();
  material?.dispose();
  renderer?.dispose();
  window.__ryzeParticleIntro = { status: reason, complete: true };
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'ryze:intro-complete', version: 1 }, window.location.origin);
  }
}

function sampleMark() {
  const raster = document.createElement('canvas');
  raster.width = raster.height = 160;
  const ctx = raster.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D canvas unavailable');
  ctx.drawImage(mark, 0, 0, 160, 160);
  const data = ctx.getImageData(0, 0, 160, 160).data;
  const inside = [];
  const edge = [];
  for (let y = 1; y < 159; y++) {
    for (let x = 1; x < 159; x++) {
      const i = y * 160 + x;
      if (data[i * 4 + 3] < 96) continue;
      const point = [((x + .5) / 160 - .5), (.5 - (y + .5) / 160)];
      inside.push(...point);
      if (data[(i - 1) * 4 + 3] < 96 || data[(i + 1) * 4 + 3] < 96 ||
          data[(i - 160) * 4 + 3] < 96 || data[(i + 160) * 4 + 3] < 96) edge.push(...point);
    }
  }
  if (inside.length < 200) throw new Error('Empty logo silhouette');
  // Interleave outline and fill without changing the canonical SVG.
  const selected = [];
  for (let i = 0; i < inside.length / 2; i++) {
    const source = (i % 4 === 0 && edge.length) ? edge : inside;
    const j = ((i * 313) % (source.length / 2)) * 2;
    selected.push(source[j], source[j + 1]);
  }
  return new Float32Array(selected);
}

const VERTEX = `
  precision highp float;
  attribute vec3 aTarget;
  attribute float aCurve;
  attribute float aDelay;
  attribute float aSeed;
  uniform float uProgress;
  uniform float uDpr;
  uniform float uCameraDistance;
  uniform float uOpacity;
  varying float vSeed;
  varying float vAlpha;
  void main() {
    float t = clamp((uProgress - aDelay) / (1.0 - aDelay), 0.0, 1.0);
    float ease = t * t * (3.0 - 2.0 * t);
    float envelope = sin(3.14159265 * t);
    vec3 delta = aTarget - position;
    vec2 tangent = normalize(vec2(-delta.y, delta.x) + vec2(.001));
    vec3 p = mix(position, aTarget, ease);
    float direction = aSeed < .5 ? -1.0 : 1.0;
    float spiral = envelope * aCurve * direction;
    p.xy += tangent * spiral;
    p.xy += tangent * spiral * .15 * sin(t * 16.0 + aSeed * 22.0);
    p.z += envelope * aCurve * .34 * sin(aSeed * 19.0 + t * 6.0);
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp((2.15 + 1.2 * aSeed) * uDpr * uCameraDistance /
      max(10.0, -view.z), 1.0, 9.0);
    vSeed = aSeed;
    vAlpha = uOpacity * (.6 + .4 * aSeed);
  }
`;
const FRAGMENT = `
  precision mediump float;
  varying float vSeed;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - vec2(.5));
    float alpha = (1.0 - smoothstep(.20, .49, r)) * vAlpha;
    vec3 pink = vec3(1.0, .35, .945);
    vec3 pearl = vec3(1.0, .76, .97);
    gl_FragColor = vec4(mix(pink, pearl, smoothstep(.87, 1.0, vSeed) * .55), alpha);
  }
`;

function resize() {
  if (!renderer || !targets || finished) return;
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const distance = (height * .5) / Math.tan(Math.PI / 6);
  const count = width < 600 ? 2100 : 3600;
  const field = createParticleField({ width, height, count, targets });
  const next = new THREE.BufferGeometry();
  next.setAttribute('position', new THREE.BufferAttribute(field.start, 3));
  next.setAttribute('aTarget', new THREE.BufferAttribute(field.end, 3));
  next.setAttribute('aCurve', new THREE.BufferAttribute(field.curve, 1));
  next.setAttribute('aDelay', new THREE.BufferAttribute(field.delay, 1));
  next.setAttribute('aSeed', new THREE.BufferAttribute(field.seeds, 1));
  if (particles) {
    scene.remove(particles);
    geometry.dispose();
  }
  geometry = next;
  particles = new THREE.Points(geometry, material);
  particles.frustumCulled = false;
  scene.add(particles);
  mark.style.setProperty('--mark-size', field.logoSize + 'px');
  camera.aspect = width / height;
  camera.position.z = distance;
  camera.near = Math.max(.1, distance * .001);
  camera.far = distance * 4;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  material.uniforms.uDpr.value = renderer.getPixelRatio();
  material.uniforms.uCameraDistance.value = distance;
  window.__ryzeParticleIntro = { status: 'running', count, offscreenRatio: .8, complete: false };
}

function tick(now) {
  if (finished || document.hidden) return;
  if (!started) started = now;
  const seconds = Math.max(0, (now - started) / 1000);
  const progress = Math.min(1, seconds / FORM_TIME);
  // Long trajectories, a short steady hold, then an exact SVG hand-off.
  material.uniforms.uProgress.value = progress;
  material.uniforms.uOpacity.value = seconds < 2.84 ? 1 : Math.max(0, 1 - (seconds - 2.84) / .24);
  mark.style.opacity = String(seconds < 2.78 ? 0 :
    seconds < 3.10 ? Math.min(1, (seconds - 2.78) / .24) :
    Math.max(0, 1 - Math.max(0, seconds - 3.28) / .30));
  renderer.render(scene, camera);
  if (seconds >= TOTAL_TIME) { complete(); return; }
  raf = requestAnimationFrame(tick);
}

async function start() {
  if (preference.matches) { complete('reduced-motion'); return; }
  try {
    await mark.decode();
    if (finished || preference.matches) { complete('reduced-motion'); return; }
    targets = sampleMark();
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0, 0);
    camera = new THREE.PerspectiveCamera(60, 1, .1, 10000);
    scene = new THREE.Scene();
    material = new THREE.ShaderMaterial({
      vertexShader: VERTEX, fragmentShader: FRAGMENT,
      transparent: true, depthTest: false, depthWrite: false,
      uniforms: {
        uProgress: { value: 0 }, uDpr: { value: 1 },
        uCameraDistance: { value: 1 }, uOpacity: { value: 1 },
      },
    });
    resize();
    raf = requestAnimationFrame(tick);
  } catch (error) {
    console.warn('Ryze particle intro fallback:', error);
    complete('fallback');
  }
}

preference.addEventListener('change', () => {
  if (preference.matches) complete('reduced-motion');
});
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  complete('context-lost');
});
window.addEventListener('resize', resize, { passive: true });
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(raf);
  geometry?.dispose(); material?.dispose(); renderer?.dispose();
});
document.addEventListener('visibilitychange', () => {
  if (finished) return;
  if (document.hidden) { pauseAt = performance.now(); cancelAnimationFrame(raf); }
  else {
    if (started && pauseAt) started += performance.now() - pauseAt;
    pauseAt = 0;
    raf = requestAnimationFrame(tick);
  }
});
void start();
