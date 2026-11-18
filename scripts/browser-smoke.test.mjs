import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const output=resolve("out");
const chromePath=[process.env.CHROME_PATH,"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(p=>p&&existsSync(p));
const mime={".html":"text/html",".js":"text/javascript",".css":"text/css",".svg":"image/svg+xml",
  ".png":"image/png",".webp":"image/webp",".mp4":"video/mp4",".woff2":"font/woff2",".ttf":"font/ttf"};
async function until(fn,label,timeout=10000){
  const end=Date.now()+timeout;
  while(Date.now()<end){try{if(await fn())return}catch{}await sleep(90)}
  throw Error("Timeout "+label);
}

test("exported page: actual browser contracts", {timeout:120000},async t=>{
  assert.ok(existsSync(join(output,"index.html")),"Run the build before smoke tests");
  assert.ok(chromePath,"Chrome unavailable; set CHROME_PATH");
  const server=createServer((req,res)=>{
    try {
      const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
      const file=resolve(output,"."+(pathname.endsWith("/")?pathname+"index.html":pathname));
      if(!file.startsWith(output+sep)){res.writeHead(403);res.end();return}
      if(!existsSync(file)){res.writeHead(404);res.end();return}
      res.setHeader("content-type",mime[extname(file)]||"application/octet-stream");
      createReadStream(file).pipe(res);
    }catch{res.writeHead(500);res.end()}
  });
  await new Promise(done=>server.listen(0,"127.0.0.1",done));
  const url="http://127.0.0.1:"+server.address().port+"/";
  const profile=await mkdtemp(join(tmpdir(),"ryze-browser-"));
  const chrome=spawn(chromePath,["--headless=new","--no-first-run","--disable-extensions",
    "--no-default-browser-check","--remote-allow-origins=*","--remote-debugging-port=0",
    "--user-data-dir="+profile,"about:blank"],{stdio:"ignore",windowsHide:true});
  let socket;let seq=0;const pending=new Map();
  t.after(async()=>{
    socket?.close();chrome.kill();await new Promise(done=>server.close(done));
    await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:180});
  });
  await until(()=>existsSync(join(profile,"DevToolsActivePort")),"Chrome debugging port");
  const port=Number(readFileSync(join(profile,"DevToolsActivePort"),"utf8").split("\n")[0]);
  const tabs=await(await fetch("http://127.0.0.1:"+port+"/json/list")).json();
  const page=tabs.find(p=>p.type==="page"&&p.webSocketDebuggerUrl);
  assert.ok(page,"Chrome target unavailable");
  socket=new WebSocket(page.webSocketDebuggerUrl);
  socket.addEventListener("message",event=>{
    const result=JSON.parse(event.data),entry=pending.get(result.id);
    if(!entry)return;pending.delete(result.id);
    if(result.error) entry.reject(Error(result.error.message));
    else entry.resolve(result.result);
  });
  await new Promise((done,fail)=>{
    socket.addEventListener("open",done,{once:true});
    socket.addEventListener("error",fail,{once:true});
  });
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq;pending.set(id,{resolve,reject});
    socket.send(JSON.stringify({id,method,params}));
  });
  const evalJs=async expression=>{
    const result=await cdp("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw Error(result.exceptionDetails.text);
    return result.result?.value;
  };
  async function load(width,height,jsEnabled=true) {
    await cdp("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:false});
    await cdp("Emulation.setEmulatedMedia",{media:"screen",features:[
      {name:"prefers-reduced-motion",value:"reduce"}]});
    await cdp("Emulation.setScriptExecutionDisabled",{value:!jsEnabled});
    await cdp("Page.navigate",{url});
    await until(()=>evalJs("document.readyState==='complete'&&!!document.querySelector('main h1')"),"Hero HTML");
    if(jsEnabled)await until(()=>evalJs("document.querySelector('[data-intro]')?.dataset.intro==='ready'"),"Hero ready");
  }
  await cdp("Page.enable");
  await cdp("Runtime.enable");

  await t.test("responsive content and accessible reading order",async()=>{
    for(const [w,h] of [[320,568],[390,844],[800,720],[1024,768],[1200,800],[1440,900],[1920,1080]]) {
      await load(w,h);
      const info=JSON.parse(await evalJs('JSON.stringify((function(){var h=document.querySelector("main h1");return {overflow:document.documentElement.scrollWidth-innerWidth,headings:document.querySelectorAll("main h1").length,prose:document.querySelector("[data-flow]")?.getBoundingClientRect().width,footer:!!document.querySelector("#footer"),text:h?.textContent?.replace(/\\s+/g," ").trim(),font:parseFloat(getComputedStyle(h).fontSize)}})())'));
      assert.ok(info.overflow<=1,"overflow at "+w+": "+info.overflow);
      assert.equal(info.headings,1,"one H1 at "+w);
      assert.ok(info.prose>0,"prose at "+w);
      assert.equal(info.footer,true,"footer at "+w);
      assert.match(info.text,/AI autopilot for your Shopify/);
      assert.ok(info.font>=32,"heading at "+w);
    }
  });
  await t.test("solutions and pricing show correct real links and amounts",async()=>{
    await load(1440,900);
    await evalJs('Array.from(document.querySelectorAll("header nav button")).find(b=>b.textContent.trim().startsWith("Solutions"))?.click()');
    await until(()=>evalJs('document.querySelectorAll("[data-preview-part=mega-menu] a[class*=productCard]").length===4'),"Solutions screenshots");
    const names=JSON.parse(await evalJs('JSON.stringify(Array.from(document.querySelectorAll("[data-preview-part=mega-menu] a[class*=productCard]")).map(x=>x.textContent.trim()))'));
    assert.ok(names.some(x=>x.includes("CRO"))&&names.some(x=>x.includes("Reporting")));
    await until(()=>evalJs('Array.from(document.querySelectorAll("[data-preview-part=mega-menu] a[class*=productCard] img")).every(img=>img.complete&&img.naturalWidth>0)'),"all solution screenshots decode");
    await evalJs('Array.from(document.querySelectorAll("header nav button")).find(b=>b.textContent.trim().startsWith("Pricing"))?.click()');
    await until(()=>evalJs('document.querySelectorAll("[data-preview-part=mega-menu] a[class*=pricingCard]").length===4'),"pricing cards");
    const plans=JSON.parse(await evalJs('JSON.stringify(Array.from(document.querySelectorAll("[data-preview-part=mega-menu] a[class*=pricingCard]")).map(x=>({text:x.textContent,href:x.href})))'));
    for(const price of ["$89","$129","$599","$1,499"])
      assert.ok(plans.some(p=>p.text.includes(price)),"missing plan price "+price);
    assert.ok(plans.every(x=>x.href==="https://www.get-ryze.ai/pricing"));
  });
  await t.test("Products and Resources are distinct; Pricing opens on desktop hover",async()=>{
    await load(1440,900);
    await evalJs('Array.from(document.querySelectorAll("header nav button")).find(b=>b.textContent.trim().startsWith("Products"))?.click()');
    await until(()=>evalJs('document.querySelector("[data-preview-part=mega-menu]")?.dataset.open==="true"'),"Products panel");
    const products=JSON.parse(await evalJs('JSON.stringify(Array.from(document.querySelectorAll("[data-preview-part=mega-menu] a")).map(a=>a.textContent.trim()))'));
    assert.ok(products.some(x=>x.startsWith("AI Marketer"))&&products.some(x=>x.startsWith("Muse")));
    assert.ok(!products.some(x=>x.startsWith("Reporting")),"Solutions repeated in Products");
    await evalJs('Array.from(document.querySelectorAll("header nav button")).find(b=>b.textContent.trim().startsWith("Resources"))?.click()');
    await until(()=>evalJs('document.querySelector("[data-preview-part=mega-menu]")?.dataset.open==="true"'),"Resources panel");
    const resources=JSON.parse(await evalJs('JSON.stringify(Array.from(document.querySelectorAll("[data-preview-part=mega-menu] a")).map(a=>a.textContent.trim()))'));
    assert.ok(resources.some(x=>x.startsWith("Blog"))&&resources.some(x=>x.startsWith("Free tools")));
    assert.ok(!resources.some(x=>x.startsWith("AI Marketer")),"Products repeated in Resources");
    await load(1440,900);
    const rect=JSON.parse(await evalJs('JSON.stringify((()=>{const b=Array.from(document.querySelectorAll("header nav button")).find(b=>b.textContent.trim().startsWith("Pricing"));const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})())'));
    await cdp("Input.dispatchMouseEvent",{type:"mouseMoved",x:rect.x,y:rect.y,button:"none"});
    await until(()=>evalJs('document.querySelector("[data-preview-part=mega-menu]")?.dataset.open==="true"'),"Pricing opens on pointer hover");
    assert.equal(await evalJs('document.querySelectorAll("[data-preview-part=mega-menu] a[class*=pricingCard]").length'),4);
  });
  await t.test("website form rejects nonsense and accepts a valid domain without fake results",async()=>{
    await load(390,844);
    await evalJs('document.querySelector("#hero-conversation form").requestSubmit()');
    await until(()=>evalJs('!!document.querySelector("#hero-conversation [role=alert]")'),"invalid domain");
    assert.equal(await evalJs('document.querySelector("#ryze-preview-website").getAttribute("aria-invalid")'),"true");
    await evalJs('document.querySelector("#ryze-preview-website").focus()');
    await cdp("Input.insertText",{text:"nonsense-only"});
    await evalJs('document.querySelector("#hero-conversation form").requestSubmit()');
    assert.equal(await evalJs('document.querySelector("#ryze-preview-website").getAttribute("aria-invalid")'),"true");
    assert.ok(await evalJs('document.querySelector("[role=alert]")?.textContent.includes("doesn\'t look right")'));
    await load(390,844);
    await evalJs('document.querySelector("#ryze-preview-website").focus()');
    await cdp("Input.insertText",{text:"example.com"});
    await evalJs('document.querySelector("#hero-conversation form").requestSubmit()');
    await until(()=>evalJs('document.querySelector("[data-ai-reply=ready]")?.textContent?.includes("accepted")'),"accepted domain");
    assert.equal(await evalJs('document.querySelectorAll("#hero-conversation img").length'),0);
  });
  await t.test("dark footer appears after scrolling and contains original Homework links",async()=>{
    await load(1440,900);
    await evalJs('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');
    const info=JSON.parse(await evalJs('JSON.stringify((function(){var f=document.querySelector("#footer"),r=f.getBoundingClientRect();return {visible:r.top<innerHeight&&r.bottom>0,cols:f.querySelectorAll("nav").length,back:!!f.querySelector("a[href=\\"#main\\"]"),bg:getComputedStyle(f).backgroundColor}})())'));
    assert.equal(info.visible,true);
    assert.equal(info.cols,5);
    assert.equal(info.back,true);
    assert.equal(info.bg,"rgb(11, 11, 13)");
  });
  await t.test("mobile modal traps keyboard focus and remains scroll-safe in landscape",async()=>{
    for(const [w,h] of [[390,844],[874,402]]) {
      await load(w,h);
      await evalJs('document.querySelector("button[aria-label=\\"Toggle navigation menu\\"]").click()');
      await until(()=>evalJs("document.querySelector('dialog')?.open===true"),"mobile menu opened");
      for(let n=0;n<6;n++){
        await cdp("Input.dispatchKeyEvent",{type:"rawKeyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,modifiers:8});
        await cdp("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,modifiers:8});
        assert.equal(await evalJs("document.querySelector('dialog').contains(document.activeElement)"),true,"focus escaped at "+w);
      }
      assert.ok(await evalJs("document.documentElement.scrollWidth<=innerWidth+1"),"landscape overflow");
      await evalJs('document.querySelector("dialog button[aria-label=\\"Close navigation\\"]").click()');
      await until(()=>evalJs("document.querySelector('dialog')?.open===false"),"menu closed");
    }
  });
  await t.test("full-motion 118 paper fragments finish without restarting the intro",async()=>{
    await cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await cdp("Emulation.setEmulatedMedia",{media:"screen",features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
    await cdp("Emulation.setScriptExecutionDisabled",{value:false});
    await cdp("Page.navigate",{url});
    await until(()=>evalJs(`document.querySelector('iframe[title="Ryze motion canvas"]')?.contentDocument?.querySelectorAll('.mover').length===118`),"118 paper fragments",7000);
    await until(()=>evalJs("document.querySelector('[data-intro]')?.dataset.intro==='ready'"),"full-motion completion",10000);
    await sleep(900);
    const state=JSON.parse(await evalJs(`JSON.stringify({intro:document.querySelector('[data-intro]')?.dataset.intro,paper:document.querySelector('iframe[title="Ryze motion canvas"]')?.contentDocument?.getElementById('frame')?.dataset.state})`));
    assert.deepEqual(state,{intro:"ready",paper:"blown"},"intro restarted after completion");
  });
  await t.test("no JavaScript still exposes a working CTA and navigation",async()=>{
    await load(390,844,false);
    const info=JSON.parse(await evalJs('JSON.stringify({heading:!!document.querySelector("main h1"),cta:!!document.querySelector("#hero-conversation noscript a[href^=\\"https:\\"]"),footer:!!document.querySelector("footer"),links:document.querySelectorAll("footer a[href]").length})'));
    assert.ok(info.heading&&info.cta&&info.footer&&info.links>=10);
  });
});
