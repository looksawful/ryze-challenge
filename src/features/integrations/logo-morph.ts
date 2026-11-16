// Adapted from the earlier Ryze homework particle shader.
const COUNT = 3200;
const POINT_DIAMETER_CSS_PX = 3.1;
export const SETTLE_DURATION = .36;
const SIDE = 112;
export const MORPH_DURATIONS = [1.8, 1.62, 2.02, 1.74, 1.92];

function particleSeed(index: number): number {
  return (Math.imul(index + 1, 0x9e3779b1) >>> 0) / 4294967296;
}

// Stable per-particle variety; settle into a fuller, clearly legible logo.
// The incoming shape is pre-tilted -45°. A gentle +45° turn over the full
// transition aligns it upright. The outgoing shape stays upright at phase 0,
// so switching logo pairs never introduces a rotation jump.
const LOGO_TURN_RADIANS = Math.PI / 4;
function logoTurnAngle(progress: number): number {
  const t = Math.min(1, Math.max(0, progress));
  const eased = t * t * t * (t * (6 * t - 15) + 10);
  return LOGO_TURN_RADIANS * eased;
}
type Shape = { points: Float32Array; colors: Float32Array };
export type ParticleRenderer = {
  draw(index: number, progress: number, dark: boolean): void;
  resize(): void;
  dispose(): void;
};

const VERTEX = [
  "precision highp float;",
  "attribute vec2 aFrom; attribute vec2 aTo;",
  "attribute vec3 aFromColor; attribute vec3 aToColor;",
  "attribute float aSeed;",
  "uniform float uProgress; uniform float uMode;",
  "uniform float uPointSize; uniform vec2 uViewportScale;",
  "uniform vec2 uRotation;",
  "varying vec3 vColor;",
  "const float PI=3.141592653589793;",
  "float sat(float x){return clamp(x,0.0,1.0);}",
  "float smoother(float t){return t*t*t*(t*(6.0*t-15.0)+10.0);}",
  "vec2 norm(vec2 v){return v*inversesqrt(max(dot(v,v),0.0004));}",
  "void main(){",
  "  vec2 tiltedTo=vec2((aTo.x+aTo.y)*.70710678,(-aTo.x+aTo.y)*.70710678);",
  "  vec2 diff=tiltedTo-aFrom;",
  "  vec2 radial=norm(aFrom+vec2(.001,.002));",
  "  vec2 tangent=vec2(-radial.y,radial.x);",
  "  float side=step(.5,fract(aSeed*17.7))*2.0-1.0;",
  "  float ordering=aSeed;",
  "  if(uMode<.5) ordering=sat(.5+aFrom.x*.7);",
  "  else if(uMode<1.5) ordering=sat(.5-aFrom.y*.7);",
  "  else if(uMode<2.5) ordering=sat(length(aFrom)*1.4);",
  "  else if(uMode<3.5) ordering=sat(.5-aFrom.x*.7);",
  "  else if(uMode<4.5) ordering=1.0-sat(length(aFrom)*1.4);",
  "  else ordering=fract(aSeed*3.13+abs(aFrom.y)*.24);",
  "  float delay=.008+.10*ordering+.015*fract(aSeed*8.37);",
  "  float t=sat((uProgress-delay)/(1.0-delay));",
  "  float q=smoother(t);",
  "  float arrival=q+.09*q*q*sin(PI*q);",
  "  float envelope=pow(sin(PI*t),2.0);",
  "  vec2 base=mix(aFrom,tiltedTo,q);",
  "  vec2 extra=(arrival-q)*diff;",
  "  extra-=diff*.035*sin(PI*sat(t/.19))*(1.0-q);",
  "  vec2 flow=vec2(0.0);",
  "  if(uMode<.5) flow=.095*tangent+.018*radial;",
  "  else if(uMode<1.5) flow=vec2(.085,-.045)+.018*tangent*side;",
  "  else if(uMode<2.5) flow=-.105*radial+.02*tangent*side;",
  "  else if(uMode<3.5) flow=-.095*tangent+.02*radial;",
  "  else if(uMode<4.5) flow=vec2(.022*side,-.10);",
  "  else flow=vec2(.09*side,.025*sin(aFrom.x*7.0));",
  "  extra+=(flow*1.75+radial*(.075*side))*envelope;",
  "  float room=max(0.0,.86-max(abs(base.x),abs(base.y)));",
  "  float extraSize=max(abs(extra.x),abs(extra.y));",
  "  vec2 pos=base+extra*min(1.0,room/max(extraSize,.00001));",
  "  vec2 spun=vec2(pos.x*uRotation.x-pos.y*uRotation.y,pos.x*uRotation.y+pos.y*uRotation.x);",
  "  gl_Position=vec4(spun*uViewportScale,0.0,1.0);",
  "  gl_PointSize=uPointSize*(.58+.88*aSeed)*(1.13-.22*envelope);",
  "  vColor=mix(aFromColor,aToColor,q);",
  "}"
].join("\n");

const FRAGMENT = [
  "precision mediump float;",
  "uniform float uDark;",
  "varying vec3 vColor;",
  "void main(){",
  "  float r=length(gl_PointCoord-vec2(.5));",
  "  float alpha=(1.0-smoothstep(.30,.49,r))*.94;",
  "  float gray=1.0-smoothstep(.05,.18,length(vec2(vColor.r-vColor.g,vColor.g-vColor.b)));",
  "  float black=1.0-smoothstep(.08,.25,dot(vColor,vec3(.2126,.7152,.0722)));",
  "  vec3 color=mix(vColor,vec3(.94),uDark*gray*black);",
  "  gl_FragColor=vec4(color,alpha);",
  "}"
].join("\n");

function loadShape(url: string): Promise<Shape> {
  const image = new window.Image();
  image.src = url;
  return image.decode().then(() => {
    const surface = document.createElement("canvas");
    surface.width = surface.height = SIDE;
    const ctx = surface.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("2D canvas unavailable");
    const scale = (SIDE - 12) / Math.max(image.naturalWidth, image.naturalHeight);
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    ctx.drawImage(image, (SIDE - width) / 2, (SIDE - height) / 2, width, height);
    const pixels = ctx.getImageData(0, 0, SIDE, SIDE).data;
    const visible: number[] = [];
    for (let i = 0; i < SIDE * SIDE; i++) {
      if ((pixels[i * 4 + 3] ?? 0) > 50) visible.push(i);
    }
    if (!visible.length) throw new Error("Empty platform logo");
    // Distinct opaque pixels first: avoid duplicate samples and holes at rest.
    const shuffled = visible.slice();
    let state = (Math.imul(image.naturalWidth, 73856093) ^ Math.imul(image.naturalHeight, 19349663) ^ visible.length) >>> 0;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    const points = new Float32Array(COUNT * 2);
    const colors = new Float32Array(COUNT * 3);
    for (let n = 0; n < COUNT; n++) {
      const pixel = shuffled[n % shuffled.length]!;
      const x = pixel % SIDE, y = (pixel / SIDE) | 0;
      const jitterX = (random() - .5) * .45;
      const jitterY = (random() - .5) * .45;
      points[n * 2] = ((x + .5 + jitterX) / SIDE - .5) * 1.38;
      points[n * 2 + 1] = (.5 - (y + .5 + jitterY) / SIDE) * 1.38;
      for (let c = 0; c < 3; c++) colors[n * 3 + c] = (pixels[pixel * 4 + c] ?? 0) / 255;
    }
    return { points, colors };
  });
}

function makeRenderer(canvas: HTMLCanvasElement, shapes: Shape[]): ParticleRenderer {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
  if (!gl) throw new Error("WebGL unavailable");

  function compile(kind: number, source: string) {
    const shader = gl!.createShader(kind);
    if (!shader) throw new Error("Shader allocation failed");
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || "Shader error");
    return shader;
  }
  const program = gl.createProgram();
  if (!program) throw new Error("Program allocation failed");
  const vertex = compile(gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("Buffer allocation failed");
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const attrs: Array<[number, number, number]> = [
    [gl.getAttribLocation(program, "aFrom"), 2, 0],
    [gl.getAttribLocation(program, "aTo"), 2, 8],
    [gl.getAttribLocation(program, "aFromColor"), 3, 16],
    [gl.getAttribLocation(program, "aToColor"), 3, 28],
    [gl.getAttribLocation(program, "aSeed"), 1, 40],
  ];
  const progressLocation = gl.getUniformLocation(program, "uProgress");
  const modeLocation = gl.getUniformLocation(program, "uMode");
  const sizeLocation = gl.getUniformLocation(program, "uPointSize");
  const scaleLocation = gl.getUniformLocation(program, "uViewportScale");
  const darkLocation = gl.getUniformLocation(program, "uDark");
  const rotationLocation = gl.getUniformLocation(program, "uRotation");
  let activePair = -1, width = 1, height = 1;
  function uploadPair(index: number) {
    const a = shapes[index]!, b = shapes[(index + 1) % shapes.length]!;
    const data = new Float32Array(COUNT * 11);
    for (let n = 0; n < COUNT; n++) {
      const dest = n * 11, p = n * 2, c = n * 3;
      data[dest] = (a.points[p] ?? 0);
      data[dest + 1] = (a.points[p + 1] ?? 0);
      data[dest + 2] = (b.points[p] ?? 0);
      data[dest + 3] = (b.points[p + 1] ?? 0);
      for (let k = 0; k < 3; k++) {
        data[dest + 4 + k] = (a.colors[c + k] ?? 0);
        data[dest + 7 + k] = (b.colors[c + k] ?? 0);
      }
      data[dest + 10] = particleSeed(n);
    }
    gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
    gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.STATIC_DRAW);
    for (const [location, count, offset] of attrs) {
      if (location < 0) continue;
      gl!.enableVertexAttribArray(location);
      gl!.vertexAttribPointer(location, count, gl!.FLOAT, false, 44, offset);
    }
    activePair = index;
  }

  return {
    resize() {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      height = canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      gl.viewport(0, 0, width, height);
    },
    draw(index, progress, dark) {
      if (activePair !== index) uploadPair(index);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(progressLocation, progress);
      gl.uniform1f(modeLocation, index);
      const spin = logoTurnAngle(progress);
      gl.uniform2f(rotationLocation, Math.cos(spin), Math.sin(spin));
      gl.uniform1f(sizeLocation, POINT_DIAMETER_CSS_PX * Math.min(2, window.devicePixelRatio || 1));
      gl.uniform2f(scaleLocation, Math.min(width, height) / width, Math.min(width, height) / height);
      gl.uniform1f(darkLocation, dark ? 1 : 0);
      gl.drawArrays(gl.POINTS, 0, COUNT);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    }
  };
}


export async function createLogoMorphRenderer(canvas: HTMLCanvasElement, sources: readonly string[]): Promise<ParticleRenderer> {
  const shapes = await Promise.all(sources.map(loadShape));
  return makeRenderer(canvas, shapes);
}
