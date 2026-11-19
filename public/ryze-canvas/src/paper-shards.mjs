import * as THREE from '../vendor/three/three.module.js';

// 2,000 angular paper flecks, not round point sprites. The existing 118 paper
// cutouts stay responsible for the actual assembly and blow-away choreography.
export function createShardField({ targets, count, width, height, logoPixels, seed = 19026 }) {
  if (!targets || targets.length < 2 || targets.length % 2) throw Error('Missing silhouette samples');
  const n = Math.max(1, Math.floor(count));
  const w = Math.max(1, width), h = Math.max(1, height);
  let state = seed >>> 0;
  const rand = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  const start = new Float32Array(n * 3);
  const target = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const delay = new Float32Array(n);
  const curve = new Float32Array(n);
  const windDelay = new Float32Array(n);
  const seeds = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const side = i % 4, overshoot = .56 + rand() * .38;
    const across = (rand() - .5) * 2.0;
    const x = side === 0 ? -w * overshoot : side === 1 ? w * overshoot : across * w * .5;
    const y = side === 2 ? h * overshoot : side === 3 ? -h * overshoot : across * h * .5;
    start.set([x, y, (rand() - .5) * h * .5], i * 3);
    const sample = Math.floor(rand() * (targets.length / 2)) * 2;
    target.set([targets[sample] * logoPixels, targets[sample + 1] * logoPixels, 1], i * 3);
    const r = rand();
    size[i] = 2.1 + Math.pow(r, 2.35) * 9.2;
    delay[i] = .025 + rand() * .65;
    curve[i] = (rand() - .5) * Math.min(w, h) * .42;
    windDelay[i] = rand() * .27;
    seeds[i] = rand();
  }
  return { start, target, size, delay, curve, windDelay, seeds };
}

const vertexShader = `
  precision highp float;
  attribute vec3 aTarget;
  attribute float aSize;
  attribute float aDelay;
  attribute float aCurve;
  attribute float aWindDelay;
  attribute float aSeed;
  uniform float uAssembly;
  uniform float uWind;
  uniform float uDpr;
  uniform float uCameraDistance;
  uniform vec2 uViewport;
  varying float vSeed;
  void main() {
    float t=clamp((uAssembly-aDelay)/(1.0-aDelay),0.0,1.0);
    float q=t*t*(3.0-2.0*t);
    vec3 path=aTarget-position;
    vec2 normal=normalize(vec2(-path.y,path.x)+vec2(.0001));
    float swell=4.0*q*(1.0-q);
    vec3 p=mix(position,aTarget,q);
    p.xy+=normal*swell*aCurve;
    p.xy+=swell*vec2(sin(t*14.0+aSeed*28.0),cos(t*11.0+aSeed*20.0))*9.0;
    p.z+=swell*100.0*(aSeed-.5);
    float gustT=clamp((uWind-aWindDelay)/(1.0-aWindDelay),0.0,1.0);
    float gust=gustT*gustT*(3.0-2.0*gustT);
    p.x+=gust*uViewport.x*(1.45+aSeed*.7);
    p.y+=gust*uViewport.y*(aSeed-.5)*.6
      +sin(gustT*15.0+aSeed*23.0)*gustT*(1.0-gustT)*27.0;
    p.z+=gust*(aSeed-.5)*150.0;
    vec4 view=modelViewMatrix*vec4(p,1.0);
    gl_Position=projectionMatrix*view;
    gl_PointSize=clamp(aSize*uDpr*uCameraDistance/max(1.0,-view.z),1.0,22.0);
    vSeed=aSeed;
  }
`;
const fragmentShader = `
  precision mediump float;
  varying float vSeed;
  float cross2(vec2 a,vec2 b) { return a.x*b.y-a.y*b.x; }
  void main() {
    vec2 p=gl_PointCoord-vec2(.5);
    float theta=vSeed*6.2831853;
    p=mat2(cos(theta),-sin(theta),sin(theta),cos(theta))*p;
    vec2 a=vec2(-.46,-.38);
    vec2 b=vec2(.43,-.27+vSeed*.16);
    vec2 c=vec2(-.08+vSeed*.22,.46);
    float e0=cross2(b-a,p-a);
    float e1=cross2(c-b,p-b);
    float e2=cross2(a-c,p-c);
    float edge=min(e0,min(e1,e2));
    if(edge<0.0)discard;
    float sheen=smoothstep(.15,.95,vSeed);
    vec3 ink=mix(vec3(1.0,.25,.88),vec3(1.0,.73,.98),sheen*.68);
    gl_FragColor=vec4(ink,1.0);
  }
`;

function silhouetteSamples(path) {
  const mask = document.createElement('canvas');
  mask.width = mask.height = 192;
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw Error('Missing 2D canvas for paper cutouts');
  ctx.setTransform(192 / 40, 0, 0, 192 / 40, 0, 0);
  ctx.fill(path);
  const rgba = ctx.getImageData(0, 0, 192, 192).data;
  const positions = [];
  for (let y = 1; y < 191; y += 2) {
    for (let x = 1; x < 191; x += 2) {
      if (rgba[(y * 192 + x) * 4 + 3] < 170) continue;
      positions.push((x + .5) / 192 - .5, .5 - (y + .5) / 192);
    }
  }
  if (positions.length < 10) throw Error('Empty Ryze paper-cut silhouette');
  return new Float32Array(positions);
}

export function createPaperShards(scene, logoShape) {
  const targets = silhouetteSamples(logoShape);
  const material = new THREE.ShaderMaterial({
    vertexShader, fragmentShader, transparent: false, depthTest: false, depthWrite: false,
    uniforms: {
      uAssembly: { value: 0 }, uWind: { value: 0 },
      uDpr: { value: 1 }, uCameraDistance: { value: 1 },
      uViewport: { value: new THREE.Vector2(1, 1) },
    },
  });
  const points = new THREE.Points(new THREE.BufferGeometry(), material);
  points.name = 'Original Ryze cut-paper micro-fragments';
  points.renderOrder = 3;
  points.frustumCulled = false;
  scene.add(points);
  let count = 0;

  return {
    get count() { return count; },
    resize(width, height, pixelRatio, cameraDistance) {
      const logoPixels = Math.min(240, Math.max(144, Math.min(width, height) * .31));
      const n = width < 600 ? 950 : width < 1024 ? 1350 : 2100;
      const data = createShardField({ targets, width, height, logoPixels, count: n });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(data.start, 3));
      geometry.setAttribute('aTarget', new THREE.BufferAttribute(data.target, 3));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(data.size, 1));
      geometry.setAttribute('aDelay', new THREE.BufferAttribute(data.delay, 1));
      geometry.setAttribute('aCurve', new THREE.BufferAttribute(data.curve, 1));
      geometry.setAttribute('aWindDelay', new THREE.BufferAttribute(data.windDelay, 1));
      geometry.setAttribute('aSeed', new THREE.BufferAttribute(data.seeds, 1));
      points.geometry.dispose();
      points.geometry = geometry;
      material.uniforms.uViewport.value.set(width, height);
      material.uniforms.uCameraDistance.value = cameraDistance;
      material.uniforms.uDpr.value = pixelRatio;
      count = n;
    },
    update(assembly, wind, rotationDegrees) {
      material.uniforms.uAssembly.value = assembly;
      material.uniforms.uWind.value = wind;
      points.rotation.z = -THREE.MathUtils.degToRad(rotationDegrees);
    },
    dispose() {
      scene.remove(points);
      points.geometry.dispose();
      material.dispose();
    },
  };
}
