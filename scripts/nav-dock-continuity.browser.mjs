import assert from "node:assert/strict";
import fs from "node:fs";
const url=process.argv[2] || "http://100.110.158.49:3188/";
const origin=process.env.CDP_ORIGIN || "http://127.0.0.1:9223";
const tab=await (await fetch(origin+"/json/new?"+url,{method:"PUT"})).json();
if(!tab.webSocketDebuggerUrl)throw Error("Chrome CDP page unavailable");
const socket=new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((yes,no)=>{socket.addEventListener("open",yes,{once:true});socket.addEventListener("error",no,{once:true})});
const requests=new Map();let id=0;
socket.addEventListener("message",e=>{const a=JSON.parse(e.data);if(!a.id||!requests.has(a.id))return;const p=requests.get(a.id);requests.delete(a.id);a.error?p.reject(new Error(a.error.message)):p.resolve(a.result)});
function call(method,params={}){return new Promise((resolve,reject)=>{const n=++id;requests.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));setTimeout(()=>{if(requests.has(n)){requests.delete(n);reject(Error(method+" timeout"))}},12000)})}
await call("Page.enable");await call("Runtime.enable");await call("Page.navigate",{url});await new Promise(r=>setTimeout(r,6500));
const sizes=[[320,568],[375,667],[466,678],[510,720],[540,850],[699,800],[700,800],[874,402],[951,669],[1023,850],[1189,837]];
const expr=`(()=>{const header=document.querySelector('[data-variant="dock"]');const dock=header?.querySelector('[data-preview-part="mobile-dock"]');const inner=header?.querySelector('[class*="inner"]');const rect=e=>{const r=e?.getBoundingClientRect();return r?{x:r.x,right:r.right,y:r.y,h:r.height,width:r.width}:null};return {viewport:[innerWidth,innerHeight],dock:rect(dock),inner:rect(inner),scrollX:document.documentElement.scrollWidth>innerWidth}})()`;
const results=[];
for(const [width,height] of sizes){
 await call("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:false});
 await new Promise(r=>setTimeout(r,450));
 const v=await call("Runtime.evaluate",{expression:expr,returnByValue:true});
 const o=v.result.value;
 const gap=o.inner&&o.dock?o.inner.x-o.dock.right:null;
 results.push({size:width+"x"+height,gap:gap==null?null:Math.round(gap*10)/10,topDelta:o.inner&&o.dock?Math.round((o.inner.y-o.dock.y)*10)/10:null,heightDelta:o.inner&&o.dock?Math.round((o.inner.h-o.dock.h)*10)/10:null,scrollX:o.scrollX});
}
socket.close();
console.log(JSON.stringify(results,null,2));
const failures=results.filter(v=>{
  const duoOpen=v.size==="951x669"; // deliberate two-panel navigation, not a broken dock
  return v.gap===null || (duoOpen ? v.gap < 150 : (v.gap < -2 || v.gap>16)) ||
    Math.abs(v.topDelta)>4 || Math.abs(v.heightDelta)>4 || v.scrollX;
});
assert.equal(failures.length,0,"Mobile dock disconnected/overlapping: "+JSON.stringify(failures));
console.log("PASS",results.length,"responsive nav cases");
