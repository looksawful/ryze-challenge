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
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".svg":"image/svg+xml",
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
    await until(()=>evalJs('document.querySelector("[data-ai-reply=ready]")?.textContent?.includes("Preparing your audit on Ryze")'),"chat reply after valid address");
    const chat=JSON.parse(await evalJs(`JSON.stringify((()=>{
      const root=document.querySelector('#hero-conversation');
      return {
        user:root.querySelector('[data-chat-message="user"]')?.textContent?.trim(),
        assistant:root.querySelector('[data-chat-message="assistant"]')?.textContent?.trim(),
        imageCount:root.querySelectorAll('img').length,
        proofCount:root.querySelectorAll('[class*="proof"],[class*="previewImage"]').length,
      };
    })())`));
    assert.equal(chat.user,"example.com");
    assert.ok(chat.assistant?.includes("Preparing your audit on Ryze") && !/scanned|report ready/i.test(chat.assistant));
    assert.equal(chat.imageCount,1,"logo loading indicator appears");
    assert.equal(chat.proofCount,0);
    const geometry=JSON.parse(await evalJs(`JSON.stringify((()=>{
      const root=document.querySelector('#hero-conversation');
      const user=root.querySelector('[data-chat-message="user"]').getBoundingClientRect();
      const assistant=root.querySelector('[data-chat-message="assistant"]').getBoundingClientRect();
      const composer=root.querySelector('form').getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth-innerWidth,
        userRight:user.right,assistantLeft:assistant.left,
        assistantBottom:assistant.bottom,composerTop:composer.top,
        userWidth:user.width,assistantWidth:assistant.width};
    })())`));
    assert.ok(geometry.overflow<=1,"chat introduced horizontal overflow");
    assert.ok(geometry.assistantBottom<=geometry.composerTop+1,"assistant reply overlaps the form");
    assert.ok(geometry.userRight<=390&&geometry.userWidth>0&&geometry.assistantWidth>0,
      "chat messages do not fit the mobile viewport");
  });
  await t.test("compact gray footer matches dusk tokens and puts Cookie settings in Legal",async()=>{
    for(const [width,height] of [[390,844],[1440,900]]) {
      await load(width,height);
      await evalJs('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');
      const info=JSON.parse(await evalJs('JSON.stringify((function(){var f=document.querySelector("#footer"),r=f.getBoundingClientRect(),s=getComputedStyle(f),a=f.querySelector("nav a"),legal=Array.from(f.querySelectorAll("nav")).find(x=>x.querySelector("h2")?.textContent==="Legal");return {visible:r.top<innerHeight&&r.bottom>0,cols:f.querySelectorAll("nav").length,logo:!!f.querySelector("a[aria-label=\\"Ryze home\\"]"),backButton:/back to top/i.test(Array.from(f.querySelectorAll("a,button")).map(x=>x.textContent).join(" ")),cookieInLegal:!!legal?.querySelector("button")&&/cookie settings/i.test(legal.querySelector("button").textContent),bg:s.backgroundColor,fg:s.color,border:s.borderTopWidth,logoFilter:getComputedStyle(f.querySelector("img")).filter,linkColor:getComputedStyle(a).color,height:r.height,overflow:document.documentElement.scrollWidth-innerWidth}})())'));
      assert.equal(info.visible,true);
      assert.equal(info.cols,5);
      assert.equal(info.logo,true);
      assert.equal(info.backButton,false);
      assert.equal(info.cookieInLegal,true);
      assert.equal(info.bg,"rgb(29, 29, 29)");
      assert.equal(info.fg,"rgb(247, 247, 247)");
      assert.equal(info.border,"0px");
      assert.equal(info.linkColor,info.fg);
      assert.equal(info.logoFilter,"none");
      assert.ok(info.height<(width<500?720:400),width+"px footer too tall: "+info.height);
      assert.ok(info.overflow<=1,width+"px footer overflow");
    }
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
  await t.test("3D particles finish before Hero without restarting the intro",async()=>{
    await cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await cdp("Emulation.setEmulatedMedia",{media:"screen",features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
    await cdp("Emulation.setScriptExecutionDisabled",{value:false});
    await cdp("Page.navigate",{url});
    await until(()=>evalJs(`document.querySelector('iframe[title="Ryze motion canvas"]')?.contentWindow?.__ryzeParticleIntro?.status`),"particle engine started or fallback",7000);
    await until(()=>evalJs("document.querySelector('[data-intro]')?.dataset.intro==='ready'"),"full-motion completion",12000);
    await sleep(900);
    const state=JSON.parse(await evalJs(`JSON.stringify({intro:document.querySelector('[data-intro]')?.dataset.intro,particle:document.querySelector('iframe[title="Ryze motion canvas"]')?.contentWindow?.__ryzeParticleIntro?.status})`));
    assert.equal(state.intro,"ready","Hero must be readable after the particles");
    assert.ok(["complete","fallback","reduced-motion"].includes(state.particle), "intro restarted or failed to finish: "+state.particle);
  });
  await t.test("chat reply types characters after a submitted domain, without cards or images",async()=>{
    await cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await cdp("Emulation.setEmulatedMedia",{media:"screen",features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
    await cdp("Emulation.setScriptExecutionDisabled",{value:false});
    await cdp("Page.navigate",{url});
    await until(()=>evalJs("document.querySelector('[data-intro]')?.dataset.intro==='ready'"),"Hero finished before chat",10000);
    await evalJs("document.querySelector('#ryze-preview-website').focus()");
    await cdp("Input.insertText",{text:"example.com"});
    await evalJs("document.querySelector('#hero-conversation form').requestSubmit()");
    await until(()=>evalJs('document.querySelector("[data-chat-text]")?.dataset.chatTyping==="true"'),"GSAP typing begins",4000);
    const during=JSON.parse(await evalJs(`JSON.stringify((()=>{
      const root=document.querySelector('#hero-conversation');
      return {
        sent:root.querySelector('[data-chat-message="user"]')?.textContent.trim(),
        typed:root.querySelector('[data-chat-text]')?.textContent||"",
        complete:root.querySelector('[role="status"]')?.textContent.trim()||"",
        images:root.querySelectorAll('img').length,
      };
    })())`));
    assert.equal(during.sent,"example.com");
    assert.ok(during.complete.includes("Preparing your audit on Ryze"));
    assert.ok(during.typed.length<during.complete.length,"reply must visibly type, not appear fully");
    assert.equal(during.images,1,"real Ryze logo displays during handoff");
    await until(()=>evalJs('document.querySelector("[data-chat-text]")?.dataset.chatTyping==="false"'),"chat typed to completion",10000);
    assert.equal(await evalJs('document.querySelector("[data-chat-text]")?.textContent?.trim()'),
      during.complete);
  });
  await t.test("first-visit cookies and mobile navigation remain pointer-operable",async()=>{
    for(const [w,h] of [[320,568],[390,844],[430,932],[874,402]]) {
      await load(w,h);
      await until(()=>evalJs('!!document.querySelector(\'aside[aria-label="Cookie preferences"]\')'),"cookie notice hydrated "+w,3500);
      const initial=JSON.parse(await evalJs(`JSON.stringify((()=>{
        const menu=document.querySelector('button[aria-label="Toggle navigation menu"]');
        const rect=menu.getBoundingClientRect();
        const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
        const notice=document.querySelector('aside[aria-label="Cookie preferences"]');
        return {menuVisible:rect.width>0&&rect.height>0,menuHit:hit===menu||menu.contains(hit),
                notice:!!notice,noticeRendered:notice?notice.getBoundingClientRect().height>0:false};
      })())`));
      assert.ok(initial.menuVisible&&initial.menuHit,w+" menu button obscured");
      assert.ok(initial.notice&&initial.noticeRendered,w+" cookie notice missing: "+JSON.stringify(initial));
      await evalJs('document.querySelector("button[aria-label=\\"Toggle navigation menu\\"]").click()');
      await until(()=>evalJs("document.querySelector('dialog')?.open===true"),"open modal "+w);
      await sleep(500); // Wait for the drawer entrance before hit testing a moving target.
      const closeHit=JSON.parse(await evalJs(`JSON.stringify((()=>{
        const close=document.querySelector('dialog button[aria-label="Close navigation"]'),r=close.getBoundingClientRect();
        const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
        return {visible:r.width>0&&r.height>0,hit:hit===close||close.contains(hit),focus:close.closest('dialog').contains(document.activeElement)};
      })())`));
      assert.ok(closeHit.visible&&closeHit.hit,w+" close button obscured");
      assert.ok(closeHit.focus,w+" modal failed to contain initial focus");
      await evalJs('document.querySelector("dialog button[aria-label=\\"Close navigation\\"]").click()');
      await until(()=>evalJs("document.querySelector('dialog')?.open===false"),"closed modal "+w);
    }
  });
  await t.test("cookie choices save locally and footer settings reopens the form",async()=>{
    await load(390,844);
    await until(()=>evalJs('!!document.querySelector(\'aside[aria-label="Cookie preferences"]\')'),"initial cookie notice");
    await evalJs('Array.from(document.querySelectorAll(\'aside[aria-label="Cookie preferences"] button\')).find(b=>b.textContent.trim()==="Reject")?.click()');
    await until(()=>evalJs(`!document.querySelector('aside[aria-label="Cookie preferences"]')`),"cookie notice dismissed");
    assert.equal(await evalJs("JSON.parse(localStorage.getItem('ryze-cookie-preferences'))?.analytics"),false);
    assert.equal(await evalJs("JSON.parse(localStorage.getItem('ryze-cookie-preferences'))?.marketing"),false);
    await evalJs("document.querySelector('footer [data-cookie-settings-trigger]').click()");
    await until(()=>evalJs("!!document.querySelector('aside[data-settings] h2')"),"reopened cookie settings");
    assert.equal(await evalJs("document.querySelector('aside[data-settings] h2')?.textContent"),"Cookie settings");
    await evalJs("document.querySelector('aside[data-settings] form').requestSubmit()");
    await until(()=>evalJs("!document.querySelector('aside[data-settings]')"),"saved cookie settings");
    await evalJs("localStorage.removeItem('ryze-cookie-preferences')");
  });
  await t.test("mascot stays tethered to cookie notice while scrolling on desktop",async()=>{
    await cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await cdp("Emulation.setEmulatedMedia",{media:"screen",features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
    await cdp("Emulation.setScriptExecutionDisabled",{value:false});
    await cdp("Page.navigate",{url});
    await until(()=>evalJs('document.querySelector("[data-intro]")?.dataset.intro==="ready"'),"Hero ready for mascot tether",12000);
    await until(()=>evalJs('document.querySelector("[data-motion-slot=mascot]")?.dataset.ryzePlacement==="cookies"'),"mascot perched at cookies",6000);
    const measure=async()=>JSON.parse(await evalJs("JSON.stringify((()=>{const pet=document.querySelector('[aria-label=\"Rizzie: Book a call\"]').getBoundingClientRect();const cookie=document.querySelector('[data-motion-slot=\"cookies\"] aside').getBoundingClientRect();return {gap:cookie.top-pet.bottom,petWidth:pet.width,cookieTop:cookie.top,scrollable:document.documentElement.scrollHeight-innerHeight};})())"));
    const first=await measure();
    assert.ok(first.petWidth>=170&&first.petWidth<=230,"mascot uses desktop min/max sizes");
    assert.ok(first.scrollable>100,"page must scroll to reproduce tether bug");
    await evalJs("window.scrollTo({top: Math.min(300, document.documentElement.scrollHeight-innerHeight), behavior:'instant'})");
    await sleep(180);
    const second=await measure();
    assert.ok(Math.abs(second.gap-first.gap)<4,
      "mascot detached from cookies when scrolling: "+JSON.stringify({first,second}));
    await evalJs("window.scrollTo({top: document.documentElement.scrollHeight-innerHeight, behavior:'instant'})");
    await sleep(180);
    const bottom=await measure();
    assert.ok(Math.abs(bottom.gap-first.gap)<4,
      "mascot detached at the footer: "+JSON.stringify({first,bottom}));
    const visible=JSON.parse(await evalJs("JSON.stringify((()=>{const pet=document.querySelector('[aria-label=\"Rizzie: Book a call\"]'),rect=pet.getBoundingClientRect(),hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height*.25);return {top:rect.top,bottom:rect.bottom,hit:!!hit&&(hit===pet||pet.contains(hit)),topmost:hit?.tagName};})())"));
    assert.ok(visible.hit,"mascot is occluded near the footer: "+JSON.stringify(visible));
  });
  await t.test("valid domain shows spinning logo and navigates to the real Ryze scan",async()=>{
    await load(390,844);
    await evalJs('document.querySelector("#ryze-preview-website").focus()');
    await cdp("Input.insertText",{text:"example.com"});
    await evalJs('document.querySelector("#hero-conversation form").requestSubmit()');
    await until(()=>evalJs('!!document.querySelector("[data-audit-loader]")'),"audit logo loader",2000);
    const pending=JSON.parse(await evalJs("JSON.stringify((()=>{const loader=document.querySelector('[data-audit-loader]');return {aria:document.querySelector('[role=\"status\"]')?.textContent?.trim(),logo:!!loader.querySelector('img'),disabled:document.querySelector('#hero-conversation form button').disabled};})())"));
    assert.ok(pending.logo&&pending.disabled&&pending.aria?.includes("Preparing your audit on Ryze"),"wrong handoff state: "+JSON.stringify(pending));
    await until(()=>evalJs("location.hostname==='reports.get-ryze.ai' && location.pathname==='/scan'"),"redirect to official Ryze scan",8500);
  });
  await t.test("no JavaScript still exposes a working CTA and navigation",async()=>{
    await load(390,844,false);
    const info=JSON.parse(await evalJs('JSON.stringify({heading:!!document.querySelector("main h1"),cta:!!document.querySelector("#hero-conversation noscript a[href^=\\"https:\\"]"),footer:!!document.querySelector("footer"),links:document.querySelectorAll("footer a[href]").length})'));
    assert.ok(info.heading&&info.cta&&info.footer&&info.links>=10);
  });
});
