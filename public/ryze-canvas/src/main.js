import * as THREE from '../vendor/three/three.module.js';
import { orbitAt, perspectiveScale, SHOW_MEDIA_CARDS, CARD_COUNT, CARD_ASPECT, ORBIT_DURATION, CARD_STAGGER, CAMERA_FOV, CARD_WORLD_RATIO } from './orbit.js';
import { cardMedia, coverUV } from './media.js';

const frame = document.getElementById('frame');
const canvas = document.getElementById('canvas-3d');
const sourceSVG = document.getElementById('scene');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const pieces = [...document.querySelectorAll('#paper-stack .mover')];
if (pieces.length !== 118) throw Error('Original Ryze SVG has changed.');
const logoShape = new Path2D(document.getElementById('ryze-shape').getAttribute('d'));
const logoCanvas = document.createElement('canvas');
logoCanvas.width = logoCanvas.height = 1;
const ctx = logoCanvas.getContext('2d', {alpha:true});
const mask = document.createElement('canvas');
const blur = document.createElement('canvas');
mask.width = mask.height = blur.width = blur.height = 512;
const maskCtx = mask.getContext('2d');
const blurCtx = blur.getContext('2d',{willReadFrequently:true});
const paths = pieces.map(el=>{
 const node=el.querySelector('path.paper-cut');
 return {el,node,x:+el.dataset.cx,y:+el.dataset.cy,
  color:'#'+(node.getAttribute('fill').match(/paper-ink-([0-9a-f]{6})/i)?.[1]||'ff5af1'),
  old:'',path:null};
});
const parseTransform = str => {
 const trans=(str||'').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
 const rot=(str||'').match(/rotate\(([-\d.]+)\)/);
 const scale=(str||'').match(/scale\(([-\d.]+)\)/);
 return {x:trans?+trans[1]:0,y:trans?+trans[2]:0,
  a:(rot?+rot[1]:0)*Math.PI/180,s:scale?+scale[1]:1};
};
function getPath(o){
 const d=o.node.getAttribute('d');
 if(d!==o.old){o.path=new Path2D(d);o.old=d;}
 return o.path;
}
function paintPieces(target, monochrome=false){
 for(const o of paths){
  const tr=parseTransform(o.el.getAttribute('transform'));
  target.save();
  target.globalAlpha=Math.max(0,Math.min(1,Number(o.el.style.opacity||1)));
  target.translate(o.x+tr.x,o.y+tr.y);
  target.rotate(tr.a);target.scale(tr.s,tr.s);
  target.fillStyle=monochrome?'#ff5af1':o.color;
  target.fill(getPath(o));
  if(!monochrome && frame.dataset.state==='assembling'){
   target.strokeStyle='rgba(255,218,250,0.13)';
   target.lineWidth=.025;target.stroke(getPath(o));
  }
  target.restore();
 }
}
function drawMelt(){
 const ss=mask.width, scale=ss/45;
 maskCtx.setTransform(1,0,0,1,0,0);maskCtx.clearRect(0,0,ss,ss);
 maskCtx.setTransform(scale,0,0,scale,ss/2-20*scale,ss/2-20*scale);
 paintPieces(maskCtx,true);
 const sigma=(+document.getElementById('liquid-blur')?.getAttribute('stdDeviation')||0)*scale;
 blurCtx.setTransform(1,0,0,1,0,0);blurCtx.clearRect(0,0,ss,ss);
 blurCtx.filter=sigma>.1?'blur('+sigma.toFixed(1)+'px)':'none';
 blurCtx.drawImage(mask,0,0);blurCtx.filter='none';
 if(sigma>.5){
  const px=blurCtx.getImageData(0,0,ss,ss),a=px.data;
  for(let i=0;i<a.length;i+=4){
   const alpha=a[i+3]/255;
   a[i]=255;a[i+1]=90;a[i+2]=241;
   a[i+3]=Math.round(Math.max(0,Math.min(1,(alpha-.34)*9+.5))*255);
  }
  blurCtx.putImageData(px,0,0);
 }
 const pixelMin=Math.min(logoCanvas.width,logoCanvas.height);
 const logoUnit=logoUnitPixels();
 const meltSize=45*logoUnit;
 ctx.drawImage(blur,logoCanvas.width/2-meltSize/2,logoCanvas.height/2-meltSize/2,meltSize,meltSize);
}
// Scale the 3D Ryze mark within the full-viewport plane; keep its world origin unchanged.
const logoUnitPixels=()=>{
 const logoPixels = Math.min(116, Math.max(88, Math.min(frame.clientWidth,frame.clientHeight)*.18));
 const density = logoCanvas.width / Math.max(1,frame.clientWidth);
 return logoPixels * density / 40;
};
const logoTexture=new THREE.CanvasTexture(logoCanvas);
logoTexture.colorSpace=THREE.SRGBColorSpace;
logoTexture.generateMipmaps=false;
logoTexture.minFilter=logoTexture.magFilter=THREE.LinearFilter;
function drawLogo(){
 const width=logoCanvas.width,height=logoCanvas.height;
 const logoUnit=logoUnitPixels();
 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,width,height);
 if(['ready','static'].includes(frame.dataset.state)){
  ctx.setTransform(logoUnit,0,0,logoUnit,width/2-20*logoUnit,height/2-20*logoUnit);
  ctx.fillStyle='#ff5af1';ctx.fill(logoShape);
 }else if(frame.dataset.state==='melting'){
  drawMelt();
 }else{
  ctx.setTransform(logoUnit,0,0,logoUnit,width/2-20*logoUnit,height/2-20*logoUnit);
  paintPieces(ctx);
 }
 logoTexture.needsUpdate=true;
}
let renderer;
try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});}
catch(error){
 canvas.style.display='none';
 window.__ryze3d={status:'fallback-svg',reason:String(error)};
 console.warn('WebGL failed; original SVG still available.',error);
}
if(!renderer){
  // Native SVG already performs its own paper blow-away and alpha fade.
  frame.addEventListener('ryze:blown',()=>{
    if(window.parent!==window) window.parent.postMessage(
      {type:'ryze:intro-complete',version:1},
      window.location.origin==='null'?'*':window.location.origin);
  });
 }
if(renderer){
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.setClearColor(0x000000,0);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(CAMERA_FOV,1,.1,10000);
 const logo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({
  map:logoTexture,transparent:true,opacity:1,alphaTest:.018,alphaToCoverage:true,
  depthTest:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
 logo.position.z=0;logo.name='Original SVG logo on 3D plane';scene.add(logo);
 const helpers=new THREE.Group();
 helpers.name='Perspective and orbit helpers';
 scene.add(helpers);
 const makeGrid=(z,color,opacity)=>{
  const grid=new THREE.GridHelper(1800,18,color,color);
  grid.rotation.x=Math.PI/2;
  grid.position.z=z;
  grid.material.transparent=true;
  grid.material.opacity=opacity;
  grid.material.depthWrite=false;
  helpers.add(grid);
  return grid;
 };
 // Three grid planes at fixed depths make perspective shrinkage legible.
 const farGrid=makeGrid(-700,0x318eae,.3);
 const logoGrid=makeGrid(0,0xe84ccf,.35);
 const nearGrid=makeGrid(450,0x7ce0b5,.3);
 const pathLine=new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({color:0xffd24a,depthTest:false,transparent:true,opacity:.95})
 );
 pathLine.renderOrder=100;
 // Path is reparented into pathRig below, together with the cards.
 helpers.add(pathLine);
 const markers=[0,.25,.5,.75,1].map((t,i)=>{
  const sphere=new THREE.Mesh(
   new THREE.SphereGeometry(1,10,8),
   new THREE.MeshBasicMaterial({color:i===0?0x3ac9ff:i===4?0x83ffab:0xffd24a,depthTest:false})
  );
  sphere.renderOrder=101;
  helpers.add(sphere);
  return {sphere,t};
 });
 const debugMode=new URLSearchParams(window.location.search).get('debug')==='1';
 let showGrid=debugMode,showPath=debugMode;
 const setHelperVisibility=()=>{
  farGrid.visible=logoGrid.visible=nearGrid.visible=showGrid;
  pathLine.visible=showPath;
  markers.forEach(m=>m.sphere.visible=showPath);
  helpers.visible=showGrid||showPath;
  depthView.style.display=showPath?'block':'none';
 };
 const helperPanel=document.createElement('div');
 helperPanel.id='ryze-helpers';
 helperPanel.style.cssText='position:absolute;top:16px;left:16px;z-index:10;display:flex;flex-wrap:wrap;gap:6px;align-items:center;color:#fff;font:12px/1.4 system-ui,sans-serif;pointer-events:auto;max-width:calc(100% - 32px)';
 helperPanel.innerHTML='<button type="button" data-helper="grid">Сетка [G]</button><button type="button" data-helper="path">Путь [P]</button><button type="button" data-helper="all">Хелперы [H]</button><span style="background:#000a;padding:5px 8px;border-radius:5px">Голубой: далеко · Розовый: логотип · Зелёный: близко · Жёлтый: путь</span>';
 for(const button of helperPanel.querySelectorAll('button')){
  button.style.cssText='background:#17171b;border:1px solid #777;color:#fff;padding:5px 8px;border-radius:5px;cursor:pointer';
  button.addEventListener('click',()=>{
   if(button.dataset.helper==='grid')showGrid=!showGrid;
   if(button.dataset.helper==='path')showPath=!showPath;
   if(button.dataset.helper==='all'){const on=!(showGrid||showPath);showGrid=on;showPath=on;}
   setHelperVisibility();
  });
 }
 helperPanel.style.display=debugMode?'flex':'none';
 frame.appendChild(helperPanel);
 const depthView=document.createElement('canvas');
 depthView.id='ryze-depth-view';
 depthView.width=360;depthView.height=210;
 depthView.style.cssText='position:absolute;right:16px;bottom:16px;width:min(360px,45vw);height:auto;background:#050609dc;border:1px solid #777;z-index:10;pointer-events:none';
 frame.appendChild(depthView);
 const depthCtx=depthView.getContext('2d');
 function drawDepthView(){
  const d=depthCtx,w=depthView.width,h=depthView.height;
  d.clearRect(0,0,w,h);
  d.font='12px system-ui';d.fillStyle='#ddd';
  d.fillText('ВИД СБОКУ · X / Z',12,20);
  const mapX=x=>w/2+x/minDim*110;
  const mapZ=z=>h-32-(z/cameraDistance+1.3)*65;
  d.strokeStyle='#e84ccf';d.lineWidth=1;
  d.beginPath();d.moveTo(12,mapZ(0));d.lineTo(w-12,mapZ(0));d.stroke();
  d.fillStyle='#e84ccf';d.fillText('ПЛОСКОСТЬ ЛОГО',12,mapZ(0)-6);
  d.strokeStyle='#ffd24a';d.lineWidth=2;
  d.beginPath();
  for(let i=0;i<=180;i++){
   const p=orbitAt(i/180,minDim,cameraDistance);
   const transformed=new THREE.Vector3(p.x,p.y,p.z).applyEuler(pathRig.rotation).add(pathRig.position);
   p.x=transformed.x;p.z=transformed.z;
   if(i===0)d.moveTo(mapX(p.x),mapZ(p.z));
   else d.lineTo(mapX(p.x),mapZ(p.z));
  }
  d.stroke();
  for(const [t,color,label] of [[0,'#3ac9ff','СТАРТ'],[1,'#83ffab','ФИНИШ']]){
   const p=orbitAt(t,minDim,cameraDistance);
   const transformed=new THREE.Vector3(p.x,p.y,p.z).applyEuler(pathRig.rotation).add(pathRig.position);
   const x=mapX(transformed.x),y=mapZ(transformed.z);
   d.fillStyle=color;d.beginPath();d.arc(x,y,4,0,Math.PI*2);d.fill();
   d.fillText(label,Math.min(w-55,x+7),Math.max(36,Math.min(h-12,y-7)));
  }
  d.fillStyle='#aaa';d.fillText('ДАЛЬШЕ ОТ КАМЕРЫ',12,h-10);d.fillText('БЛИЖЕ К КАМЕРЕ',w-130,36);
 }

 document.addEventListener('keydown',event=>{
  if(!debugMode)return;
  if(event.altKey||event.ctrlKey||event.metaKey||event.target?.closest?.('input,textarea'))return;
  const key=event.key.toLowerCase();
  if(key==='g')showGrid=!showGrid;
  else if(key==='p')showPath=!showPath;
  else if(key==='h'){const on=!(showGrid||showPath);showGrid=on;showPath=on;}
  else return;
  setHelperVisibility();
 });
 setHelperVisibility();
 const pathRig=new THREE.Group();
 pathRig.name='Editable orbit transform';
 scene.add(pathRig);
 const gizmo=new THREE.AxesHelper(110);
 gizmo.visible=debugMode;
 pathRig.add(gizmo);
 const orbitObjects=new THREE.Group();
 pathRig.add(orbitObjects);
 // The path and its markers rotate with the cards; grids stay in world space.
 pathRig.add(pathLine);
 for(const marker of markers)pathRig.add(marker.sphere);

 const loader=new THREE.TextureLoader();
 const videoElements=[];
 const cards=[];
 const plane=new THREE.PlaneGeometry(1,1);
 let W=1,H=1,minDim=1,cameraDistance=1;
 let running=true,raf=0,orbitStarted=false,orbitFinished=false,timeline,orbitCycle=0;
 let windFadeComplete=false,introEventSent=false,windFadeTween;
 const logoIntro={progress:0};
 const STORAGE_KEY='ryze-motionpath-cinematic-6-v3';
 const defaults={fov:CAMERA_FOV,yaw:0,pitch:0,roll:0,tx:0,ty:0,tz:0,logoYaw:0,logoPitch:0,logoZ:0,paused:false};
 let saved={};
 try{saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch{}
 const state={...defaults};
 for(const key of Object.keys(defaults)){
  if(typeof saved[key]===typeof defaults[key])state[key]=saved[key];
 }
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 state.fov=clamp(state.fov,20,100);
 for(const key of ['yaw','pitch','roll'])state[key]=clamp(state[key],-180,180);
 for(const key of ['tx','ty','tz'])state[key]=clamp(state[key],-2,2);
 state.logoYaw=clamp(state.logoYaw,-75,75);state.logoPitch=clamp(state.logoPitch,-75,75);state.logoZ=clamp(state.logoZ,-1,1);
 const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}};
 const controls=document.createElement('div');
 controls.id='ryze-3d-controls';
 controls.style.cssText='position:absolute;top:55px;left:16px;z-index:12;width:250px;max-width:calc(100vw - 32px);padding:10px;background:#111e;border:1px solid #777;border-radius:8px;color:#fff;font:12px/1.5 system-ui;pointer-events:auto;touch-action:auto';
 controls.innerHTML='<strong>3D КОНТРОЛЛЕР</strong><div style="margin:7px 0">Перспектива (FOV) <output id="ryze-fov-label"></output><input id="ryze-fov" aria-label="Перспектива" type="range" min="20" max="100" step="1" style="width:100%"></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" id="ryze-pause">Пауза</button><button type="button" id="ryze-reset">Сброс</button><button type="button" id="ryze-export">JSON</button></div><div style="margin-top:8px"><label>Режим <select id="ryze-mode"><option value="move">Перемещение пути</option><option value="rotate">Вращение пути</option></select></label></div><div style="margin-top:8px">Перемещение: X/Y мышью, Shift+мышь глубина Z.</div><div style="margin-top:8px">Логотип в 3D:</div><label>Y <input id="ryze-logo-yaw" type="range" min="-75" max="75" value="24"></label><label>X <input id="ryze-logo-pitch" type="range" min="-75" max="75" value="-12"></label><label>Глубина <input id="ryze-logo-z" type="range" min="-1" max="1" step="0.01" value="-0.12"></label><div id="ryze-gizmo" aria-label="Поворот траектории мышью" style="height:116px;cursor:grab;touch-action:none;border:1px solid #777;border-radius:5px;position:relative;overflow:hidden;background:#06080d"><div id="ryze-gizmo-axes" style="position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d"><span style="position:absolute;width:65px;height:2px;background:#ff5c5c;transform-origin:left;transform:rotate(0deg)">X</span><span style="position:absolute;width:65px;height:2px;background:#77ed96;transform-origin:left;transform:rotate(-90deg)">Y</span><span style="position:absolute;width:65px;height:2px;background:#5bb7ff;transform-origin:left;transform:rotate(-45deg)">Z</span></div><span style="position:absolute;bottom:4px;left:6px;color:#aaa">ЛКМ: X/Y · Shift: Z</span></div><div id="ryze-angles" style="font-variant-numeric:tabular-nums;margin-top:5px"></div><div style="color:#aaa;margin-top:5px">Настройки сохраняются в этом браузере.</div>';
 for(const button of controls.querySelectorAll('button'))button.style.cssText='background:#222;border:1px solid #888;border-radius:4px;padding:5px 8px;color:white;cursor:pointer';
 controls.style.display=debugMode?'block':'none';
 frame.appendChild(controls);
 const fovInput=controls.querySelector('#ryze-fov');
 const fovLabel=controls.querySelector('#ryze-fov-label');
 const angleLabel=controls.querySelector('#ryze-angles');
 const axesPreview=controls.querySelector('#ryze-gizmo-axes');
 const pauseButton=controls.querySelector('#ryze-pause');
 const modeInput=controls.querySelector('#ryze-mode');
 const logoYawInput=controls.querySelector('#ryze-logo-yaw');
 const logoPitchInput=controls.querySelector('#ryze-logo-pitch');
 const logoZInput=controls.querySelector('#ryze-logo-z');
 const apply=()=>{
  camera.fov=state.fov;
  pathRig.rotation.set(THREE.MathUtils.degToRad(state.pitch),THREE.MathUtils.degToRad(state.yaw),THREE.MathUtils.degToRad(state.roll),'XYZ');
  pathRig.position.set(state.tx*minDim,state.ty*minDim,state.tz*cameraDistance);
  logo.rotation.set(THREE.MathUtils.degToRad(state.logoPitch),THREE.MathUtils.degToRad(state.logoYaw),0);
  logo.position.set(0,0,state.logoZ*cameraDistance);
  logoYawInput.value=state.logoYaw;logoPitchInput.value=state.logoPitch;logoZInput.value=state.logoZ;
  fovInput.value=state.fov;fovLabel.textContent=state.fov+'°';
  angleLabel.textContent='Путь X '+state.pitch.toFixed(0)+'° · Y '+state.yaw.toFixed(0)+'° · Z '+state.roll.toFixed(0)+'° | Δ '+[state.tx,state.ty,state.tz].map(v=>v.toFixed(2)).join(' / ');
  axesPreview.style.transform='rotate('+state.roll+'deg) skew('+Math.round(state.yaw*.25)+'deg,'+Math.round(state.pitch*.25)+'deg)';
  pauseButton.textContent=state.paused?'Продолжить':'Пауза';
  gsap.globalTimeline.paused(state.paused);
  camera.updateProjectionMatrix();
  if(typeof resize==='function')resize();
  if(typeof render==='function'){running=true;render();}
  save();
 };
 fovInput.addEventListener('input',()=>{state.fov=+fovInput.value;apply()});
 logoYawInput.addEventListener('input',()=>{state.logoYaw=+logoYawInput.value;apply()});
 logoPitchInput.addEventListener('input',()=>{state.logoPitch=+logoPitchInput.value;apply()});
 logoZInput.addEventListener('input',()=>{state.logoZ=+logoZInput.value;apply()});
 pauseButton.addEventListener('click',()=>{state.paused=!state.paused;apply()});
 controls.querySelector('#ryze-reset').addEventListener('click',()=>{Object.assign(state,defaults);apply()});
 controls.querySelector('#ryze-export').addEventListener('click',()=>{
  const data=JSON.stringify({version:1,...state},null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='ryze-3d-settings.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 const drag=controls.querySelector('#ryze-gizmo');
 let last=null;
 drag.addEventListener('pointerdown',e=>{
  last={x:e.clientX,y:e.clientY,roll:e.shiftKey};
  drag.setPointerCapture(e.pointerId);drag.style.cursor='grabbing';
 });
 drag.addEventListener('pointermove',e=>{
  if(!last)return;
  const dx=e.clientX-last.x,dy=e.clientY-last.y;
  if(modeInput.value==='move'){
   if(e.shiftKey||last.roll)state.tz=clamp(state.tz-dy*.004,-2,2);
   else{state.tx=clamp(state.tx+dx/Math.max(1,minDim),-2,2);state.ty=clamp(state.ty-dy/Math.max(1,minDim),-2,2);}
  }else if(e.shiftKey||last.roll)state.roll=clamp(state.roll+dx*.65,-180,180);
  else{
   state.yaw=clamp(state.yaw+dx*.65,-180,180);
   state.pitch=clamp(state.pitch+dy*.65,-180,180);
  }
  last={x:e.clientX,y:e.clientY,roll:last.roll};
  apply();
 });
 const endDrag=()=>{last=null;drag.style.cursor='grab'};
 drag.addEventListener('pointerup',endDrag);
 drag.addEventListener('pointercancel',endDrag);
 window.__ryze3dSettings={get:()=>({...state}),key:STORAGE_KEY};

 const coverTexture=(texture,width,height)=>{
  const uv=coverUV(width,height,CARD_ASPECT);
  texture.repeat.set(uv.repeatX,uv.repeatY);
  texture.offset.set(uv.offsetX,uv.offsetY);
  texture.needsUpdate=true;
 };
 const materialFor=(media,i)=>{
  // Alpha blending lets each photo/video fade on entrance without an instant pop.
  const props={side:THREE.DoubleSide,depthTest:true,depthWrite:false,transparent:true,opacity:0,toneMapped:false};
  if(media?.type==='video' && media.src){
   const video=document.createElement('video');
   video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;
   video.preload='auto';video.crossOrigin='anonymous';video.src=media.src;
   videoElements.push(video);
   const texture=new THREE.VideoTexture(video);
   texture.colorSpace=THREE.SRGBColorSpace;
   video.addEventListener('loadedmetadata',()=>{
    coverTexture(texture,video.videoWidth,video.videoHeight);render();
   },{once:true});
   video.play().catch(()=>{});
   return new THREE.MeshBasicMaterial({...props,map:texture});
  }
  if(media?.type==='image' && media.src){
   const texture=loader.load(media.src,loaded=>{
    coverTexture(loaded,loaded.image.width,loaded.image.height);render();
   },undefined,error=>console.warn('Card image unavailable',i,error));
   texture.colorSpace=THREE.SRGBColorSpace;
   return new THREE.MeshBasicMaterial({...props,map:texture});
  }
  return new THREE.MeshBasicMaterial({...props,color:media?.color||'#ff5af1'});
 };
 function positionCard(entry){
  const p=orbitAt(entry.progress,minDim,cameraDistance);
  entry.mesh.position.set(p.x,p.y,p.z);
  // Billboard: arc-following tilt, overlapping action, and slight volume-preserving stretch.
  entry.mesh.quaternion.copy(pathRig.quaternion).invert().multiply(camera.quaternion);
  const u=Math.max(0,Math.min(1,entry.progress));
  const action=Math.sin(Math.PI*u);
  entry.mesh.rotateZ(action*(.11*Math.sin(2*Math.PI*u+.7)+(entry.index%2?-.025:.025)));
  const forward=orbitAt(Math.min(1,u+.01),minDim,cameraDistance);
  const backward=orbitAt(Math.max(0,u-.01),minDim,cameraDistance);
  const tangentYaw=Math.atan2(forward.z-backward.z,forward.x-backward.x);
  entry.mesh.rotateY(action*.42*tangentYaw);
  entry.mesh.rotateX(action*.045*Math.sin(3*Math.PI*u));
  const stretch=1+.045*action*action;
  entry.mesh.scale.set(entry.mesh.userData.width/stretch,entry.mesh.userData.height*stretch,1);
  // One smooth fade per card, synchronized with its own staggered orbit start.
  entry.mesh.material.opacity=THREE.MathUtils.smoothstep(entry.progress,0,.18);
 }
 if(SHOW_MEDIA_CARDS) for(let i=0;i<CARD_COUNT;i++){
  const material=materialFor(cardMedia[i],i);
  const mesh=new THREE.Mesh(plane,material);
  mesh.name='Ryze media card '+(i+1);
  mesh.visible=false;
  orbitObjects.add(mesh);
  cards.push({index:i,mesh,progress:0,active:false,finished:false});
 }
 function resize(){
  W=Math.max(1,frame.clientWidth);H=Math.max(1,frame.clientHeight);
  minDim=Math.min(W,H);
  cameraDistance=(H/2)/Math.tan(camera.fov*Math.PI/360);
  camera.position.set(0,0,cameraDistance);
  camera.aspect=W/H;
  camera.near=Math.max(.1,cameraDistance*.002);
  camera.far=cameraDistance*10;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(W,H,false);
  const density=Math.min(1.5,window.devicePixelRatio||1,2048/Math.max(W,H));
  logoCanvas.width=Math.max(1,Math.round(W*density));
  logoCanvas.height=Math.max(1,Math.round(H*density));
  logo.scale.set(W,H,1);
  // Helpers share the SAME camera and orbit math as the real cards.
  const gridSize=minDim*2.4;
  for(const [grid,z] of [[farGrid,-cameraDistance*.8],[logoGrid,0],[nearGrid,cameraDistance*.45]]){
   grid.position.z=z;
   grid.scale.setScalar(gridSize/1800);
  }
  const positions=[];
  for(let i=0;i<=180;i++){
   const point=orbitAt(i/180,minDim,cameraDistance);
   positions.push(point.x,point.y,point.z);
  }
  pathLine.geometry.dispose();
  pathLine.geometry=new THREE.BufferGeometry();
  pathLine.geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  drawDepthView();
  for(const marker of markers){
   const point=orbitAt(marker.t,minDim,cameraDistance);
   marker.sphere.position.set(point.x,point.y,point.z);
   marker.sphere.scale.setScalar(minDim*.009);
  }

  for(const c of cards){
   c.mesh.userData.width=minDim*CARD_WORLD_RATIO;
   c.mesh.userData.height=c.mesh.userData.width/CARD_ASPECT;
   c.mesh.scale.set(c.mesh.userData.width,c.mesh.userData.height,1);
   positionCard(c);
  }
 }
 function frameRender(){
  raf=0;
  if(!running)return;
  drawLogo();
  for(const c of cards)if(c.active)positionCard(c);
  renderer.render(scene,camera);
  window.__ryze3d={status:'webgl',sceneState:frame.dataset.state,
   originalPieces:pieces.length,cardCount:cards.length,videoCount:videoElements.length,orbitCycle,
   videos:videoElements.map(v=>({readyState:v.readyState,paused:v.paused,time:v.currentTime})),orbitStarted,orbitFinished,
   cameraZ:cameraDistance,intro:{windFadeComplete,orbitFinished,introEventSent,logoScale:1-logoIntro.progress},cards:cards.map(c=>({
    index:c.index,progress:c.progress,x:c.mesh.position.x,y:c.mesh.position.y,
    z:c.mesh.position.z,scale:perspectiveScale(c.mesh.position.z,cameraDistance),
    visible:c.mesh.visible,opacity:+c.mesh.material.opacity.toFixed(3)}))};
  if((frame.dataset.state==='blown'&&orbitFinished&&windFadeComplete) || (reduce.matches&&frame.dataset.state==='static')){
   running=false;videoElements.forEach(v=>v.pause());return;
  }
  raf=requestAnimationFrame(frameRender);
 }
 function render(){if(running&&!raf)raf=requestAnimationFrame(frameRender);}
 // The overlay is an opening act: release the page only when BOTH the
 // pink circle has disappeared and the last media card has exited.
 function announceIntroComplete(){
  if(introEventSent || !windFadeComplete || !orbitFinished)return;
  introEventSent=true;
  if(window.parent!==window){
   window.parent.postMessage({type:'ryze:intro-complete',version:1},
    window.location.origin==='null'?'*':window.location.origin);
  }
 }
 // The 118 SVG fragments have joined: reveal copy before the circle finishes.
 frame.addEventListener('ryze:assembled',()=>{
  if(window.parent!==window){
   window.parent.postMessage({type:'ryze:assembled',version:1},
    window.location.origin==='null'?'*':window.location.origin);
  }
 });
 frame.addEventListener('ryze:wind-start',()=>{
  windFadeTween?.kill();
  windFadeComplete=false;
  logo.visible=true;
  logo.material.opacity=1;
  const fade={value:1};
  // Fade begins with the wind, not when the pieces finish moving.
  windFadeTween=gsap.to(fade,{
   value:0,duration:1.78,ease:'power2.in',
   onUpdate:()=>{
    logo.material.opacity=fade.value;
    running=true;render();
   },
   onComplete:()=>{
    windFadeComplete=true;
    logo.visible=false;
    announceIntroComplete();
    running=true;render();
   }
  });
 });
 frame.addEventListener('ryze:blown',()=>{
  windFadeTween?.kill();
  windFadeComplete=true;
  logo.visible=false;
  announceIntroComplete();
  running=true;render();
 });
 function startOrbit(){
  if(reduce.matches)return;
  // Card textures stay on disk; the logo introduction still completes.
  if(!SHOW_MEDIA_CARDS){
   orbitFinished=true;
   announceIntroComplete();
   return;
  }
  timeline?.kill();
  orbitCycle++;
  videoElements.forEach(v=>v.play().catch(()=>{}));
  orbitStarted=true;orbitFinished=false;
  cards.forEach(c=>{c.progress=-.04;c.active=false;c.finished=false;c.mesh.visible=false;positionCard(c);});
  running=true;
  timeline=gsap.timeline({paused:true,onComplete:()=>{
   orbitFinished=true;
   announceIntroComplete();
   render();
  }});
  for(const c of cards){
   timeline.to(c,{progress:1,duration:ORBIT_DURATION,ease:'power2.inOut',
    onStart:()=>{c.active=true;c.mesh.visible=true;},
    onUpdate:()=>positionCard(c),
    onComplete:()=>{c.finished=true;c.active=false;c.mesh.visible=false;}
   },c.index*CARD_STAGGER);
  }
  timeline.play(0);render();
 }
 frame.addEventListener('ryze:cards-start',startOrbit);
 window.addEventListener('resize',()=>{resize();running=true;render();},{passive:true});
 reduce.addEventListener?.('change',()=>{
  timeline?.kill();cards.forEach(c=>{c.mesh.visible=false;c.finished=true;});
  orbitFinished=true;running=true;render();
 });
 window.addEventListener('pagehide',()=>{
  windFadeTween?.kill();
  videoElements.forEach(v=>v.pause());
 });
 resize();
 apply();
 sourceSVG.style.opacity='0';
 canvas.style.display='block';
 if(reduce.matches){orbitFinished=true;}
 else window.__ryzeStartSequence?.();
 render();
}
