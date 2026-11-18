import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const url = process.env.RYZE_QA_URL;
assert.ok(url && /^https?:\/\//.test(url), "Set RYZE_QA_URL to the private static preview under test");
const windowsChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromePath = process.env.CHROME_PATH || (existsSync(windowsChrome) ? windowsChrome : macChrome);
const profile = mkdtempSync(path.join(os.tmpdir(), "ryze-rizzie-hit-"));
const chrome = spawn(chromePath, ["--headless=new", "--no-first-run", "--disable-gpu", "--disable-extensions",
  "--remote-allow-origins=*", "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
let socket;

try {
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = Number(readFileSync(path.join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]); break; }
    catch { await sleep(100); }
  }
  assert.ok(port, "Chrome DevTools port");
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let seq = 0;
  const awaiting = new Map();
  socket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    const entry = awaiting.get(event.id);
    if (!entry) return;
    awaiting.delete(event.id);
    if (event.error) entry.reject(Error(JSON.stringify(event.error)));
    else entry.resolve(event.result);
  };
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    awaiting.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await cdp("Runtime.evaluate", { expression, returnByValue: true });
    assert.equal(response.exceptionDetails, undefined, "Runtime.evaluate exception");
    return response.result.value;
  };
  await cdp("Page.enable");
  // Geometry is tested after the cinematic intro is bypassed, as in the
  // official Reduced Motion Storybook scenario. The full intro has an inert Hero.
  await cdp("Emulation.setEmulatedMedia", {
    media: "screen", features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  const expression = `JSON.stringify((() => {
    const mascot = document.querySelector('a[aria-label="Rizzie: Start For Free"]');
    const notice = document.querySelector('aside[class*="notice"]');
    const dock = document.querySelector('header[data-variant="dock"]');
    const hero = document.querySelector("main");
    const part = (name) => [...hero.children].find((element) => String(element.className).includes(name));
    const rect = (node) => {
      if (!node) return null;
      const b = node.getBoundingClientRect();
      return { x: b.x, y: b.y, right: b.right, bottom: b.bottom, width: b.width, height: b.height };
    };
    const petRect = rect(mascot);
    const poster = mascot?.querySelector('img');
    const sprite = mascot?.querySelector('span[class*="sprite"]');
    const artwork = sprite && getComputedStyle(sprite).display !== 'none' ? sprite : poster;
    const artRect = rect(artwork);
    const slotRect = rect(mascot?.parentElement);
    const intersection = (a, b) => a && b
      ? Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x))
      * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y)) : 0;
    const hits = [];
    let devOverlaySamples = 0;
    if (petRect) for (const py of [0.2, 0.5, 0.8]) for (const px of [0.2, 0.5, 0.8]) {
      const x = petRect.x + petRect.width * px, y = petRect.y + petRect.height * py;
      if (x >= 0 && x < innerWidth && y >= 0 && y < innerHeight) {
        const top = document.elementFromPoint(x, y);
        const devOverlay = top?.tagName === 'NEXTJS-PORTAL';
        if (devOverlay) devOverlaySamples++;
        hits.push(mascot.contains(top) || devOverlay);
      }
    }
    return { pet: !!mascot, petRect, artRect, slotRect, viewport: [innerWidth, innerHeight],
      cookieOverlap: intersection(petRect, rect(notice)),
      dockOverlap: intersection(petRect, rect(dock)),
      ctaOverlap: intersection(petRect, rect(part("action"))),
      headlineOverlap: intersection(petRect, rect(part("headline"))),
      leadOverlap: intersection(petRect, rect(part("lead"))),
      textOverlap: intersection(petRect, rect(part("description"))),
      clickableSamples: hits.filter(Boolean).length, visibleSamples: hits.length,
      devOverlaySamples,
      overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  })())`;
  const checks = [
    [320, 480], [360, 540], [490, 480],
    [320, 568], [340, 568], [359, 568], [360, 568], [375, 568],
    [402, 568], [490, 568], [402, 720], [402, 874],
    [700, 320], [874, 320], [700, 402], [874, 402], [1023, 402],
    [874, 600], [1440, 1024],
    [390, 740], [390, 844], [430, 932], [540, 720], [768, 1024],
    [951, 669], [1024, 768], [1180, 820], [1440, 900], [1920, 1080], [2560, 1440],
    [699, 402], [700, 402], [1023, 402], [1024, 402],
    [699, 800], [700, 800], [1023, 768], [1024, 768],
    [2399, 900], [2400, 900],
    [701, 402], [735, 402], [768, 402], [800, 402], [829, 402], [830, 402],
    [735, 320], [768, 320],
  ];
  let errors = 0;
  const measurements = new Map();
  for (const [width, height] of checks) {
    await cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await cdp("Page.navigate", { url });
    for (let attempt = 0; attempt < 80; attempt++) {
      if (await evaluate('!!document.querySelector("main") && !!document.querySelector(\'section[aria-label="Rizzie mascot"]\')')) break;
      await sleep(200);
    }
    await sleep(250);
    // Tiny phones cannot display the entire Hero above the fold. Verify that
    // its normal scrolling path exposes the full tap target without an overlay.
    if (height < 568 && width < 700) {
      await evaluate('document.querySelector(\'a[aria-label="Rizzie: Start For Free"]\')?.scrollIntoView({ block: "center" }); true');
      await sleep(150);
    }
    const result = JSON.parse(await evaluate(expression));
    const blocked = result.visibleSamples - result.clickableSamples;
    const { petRect: pet, artRect: art, slotRect: slot } = result;
    const proportional = !!pet && Math.abs(pet.height - pet.width * 13 / 12) < 1;
    const sameGeometry = !!art && !!pet
      && Math.abs(art.width - pet.width) < 1 && Math.abs(art.height - pet.height) < 1;
    const fitsSlot = !!slot && !!pet
      && pet.x >= slot.x - 2 && pet.right <= slot.right + 9
      && pet.y >= slot.y - 2 && pet.bottom <= slot.bottom + 2;
    if (pet) measurements.set(width + "x" + height, pet.width);
    const bad = !result.pet || result.overflow || result.cookieOverlap > 0 || result.dockOverlap > 0
      || result.ctaOverlap > 0 || result.headlineOverlap > 0 || result.leadOverlap > 0
      || result.textOverlap > 0 || blocked > 0
      || !proportional || !sameGeometry || !fitsSlot;
    console.log((bad ? "FAIL" : "PASS") + " " + width + "x" + height
      + " art=" + (pet?.width ?? 0).toFixed(1) + " ratio=" + proportional
      + " image=" + sameGeometry + " slot=" + fitsSlot
      + " hit=" + result.clickableSamples + "/" + result.visibleSamples
      + " devOverlay=" + result.devOverlaySamples
      + " overlap(cookie,dock,cta,headline,lead,description)="
      + [result.cookieOverlap, result.dockOverlap, result.ctaOverlap, result.headlineOverlap, result.leadOverlap, result.textOverlap].map(Math.round).join(","));
    if (bad) errors++;
  }
  for (const [a, b] of [
    ["699x402", "700x402"], ["1023x402", "1024x402"],
    ["699x800", "700x800"], ["1023x768", "1024x768"],
    ["2399x900", "2400x900"],
  ]) {
    const before = measurements.get(a), after = measurements.get(b);
    const delta = Math.abs(after - before);
    const pass = Number.isFinite(delta) && delta < 1.5;
    console.log((pass ? "PASS" : "FAIL") + " continuous " + a + " to " + b
      + " delta=" + (Number.isFinite(delta) ? delta.toFixed(2) : "missing"));
    if (!pass) errors++;
  }
  assert.equal(errors, 0, "Rizzie geometry/continuity/interaction must be valid in a real browser");
} finally {
  try { socket?.close(); } catch { /* browser may already have exited */ }
  chrome.kill();
  await sleep(200);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
