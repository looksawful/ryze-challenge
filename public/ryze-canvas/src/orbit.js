import {blenderPath} from './blenderPath.js';

// Source camera faces nearly along world -X, so this is a side-on 3D arc,
// not a spiral drawn around the camera optical axis.
export const CAMERA_FOV = 60;
export const CARD_COUNT = 12;
export const CARD_ASPECT = 4/5;
export const ORBIT_DURATION = 66/24;
export const CARD_STAGGER = 18/24;
export const CARD_WORLD_RATIO = .115;
export const lensDepth = z => 1/(1-z);

const center = blenderPath.cameraLocalLogoOrigin;
const points = blenderPath.samples;

export function orbitAt(t, minDimension, cameraDistance) {
 const u=Math.max(0,Math.min(1,Number(t)||0));
 const index=u*(points.length-1),i=Math.floor(index),s=index-i;
 const a=points[i],b=points[Math.min(i+1,points.length-1)];
 const x=a[0]+(b[0]-a[0])*s-center[0];
 const y=a[1]+(b[1]-a[1])*s-center[1];
 const d=cameraDistance/24.006155;
 // Continue the side-on arc in XY while approaching the camera at every frame.
 // No retreat or separate exit: perspective carries the card through the frame edge.
 const z=cameraDistance*(-.68+1.60*u*(1.25-.25*u));
 return {x:x*d*2,y:y*d*3,z};
}
export const perspectiveScale=(z,cameraDistance)=>cameraDistance/(cameraDistance-z);
