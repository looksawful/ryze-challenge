// Curated Ryze local media, 2026-11-17. Original files: D:\\inwork\\RYZE-MEDIA.
export const cardMedia=[
 {type:'image',src:'./assets/card-media/card-01.webp'}, // fashion portrait
 {type:'video',src:'./assets/card-media/card-02.mp4'}, // gadget cut-out collage
 {type:'image',src:'./assets/card-media/card-03.webp'}, // cobalt handbag
 {type:'video',src:'./assets/card-media/card-04.mp4'}, // grocery collage
 {type:'image',src:'./assets/card-media/card-05.webp'}, // cashmere texture
 {type:'video',src:'./assets/card-media/card-06.mp4'}, // scanned catalogue loading
 {type:'image',src:'./assets/card-media/card-07.webp'}, // kraft bag editorial
 {type:'image',src:'./assets/card-media/card-08.webp'}, // portrait with jewelry
 {type:'image',src:'./assets/card-media/card-09.webp'}, // fashion and laptop
 {type:'image',src:'./assets/card-media/card-10.webp'}, // glossy fashion advertising
 {type:'image',src:'./assets/card-media/card-11.webp'}, // grocery delivery
 {type:'image',src:'./assets/card-media/card-12.webp'}, // product still life
];

// Center-crop wide/tall source media on the fixed 4:5 3D card without distortion.
export function coverUV(sourceW,sourceH,targetAspect=4/5){
 if(!(sourceW>0&&sourceH>0&&targetAspect>0))return {repeatX:1,repeatY:1,offsetX:0,offsetY:0};
 const sourceAspect=sourceW/sourceH;
 if(sourceAspect>targetAspect){
  const repeatX=targetAspect*sourceH/sourceW;
  return {repeatX,repeatY:1,offsetX:(1-repeatX)/2,offsetY:0};
 }
 if(sourceAspect<targetAspect){
  const repeatY=sourceW/targetAspect/sourceH;
  return {repeatX:1,repeatY,offsetX:0,offsetY:(1-repeatY)/2};
 }
 return {repeatX:1,repeatY:1,offsetX:0,offsetY:0};
}
