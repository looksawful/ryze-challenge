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
    const intersection = (a, b) => a && b
      ? Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x))
      * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y)) : 0;
    const hits = [];
    if (petRect) for (const py of [0.2, 0.5, 0.8]) for (const px of [0.2, 0.5, 0.8]) {
      const x = petRect.x + petRect.width * px, y = petRect.y + petRect.height * py;
      if (x >= 0 && x < innerWidth && y >= 0 && y < innerHeight) {
        hits.push(mascot.contains(document.elementFromPoint(x, y)));
      }
    }
    return { pet: !!mascot, viewport: [innerWidth, innerHeight],
      cookieOverlap: intersection(petRect, rect(notice)),
      dockOverlap: intersection(petRect, rect(dock)),
      ctaOverlap: intersection(petRect, rect(part("action"))),
      textOverlap: intersection(petRect, rect(part("description"))),
      clickableSamples: hits.filter(Boolean).length, visibleSamples: hits.length,
      overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  })())`;
  const checks = [
    [320, 480], [360, 540], [490, 480],
    [320, 568], [340, 568], [359, 568], [360, 568], [375, 568],
    [402, 568], [490, 568], [402, 720], [402, 874],
    [700, 320], [874, 320], [700, 402], [874, 402], [1023, 402],
    [874, 600], [1440, 1024],
  ];
  let errors = 0;
  for (const [width, height] of checks) {
    await cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await cdp("Page.navigate", { url });
    await sleep(900);
    // Tiny phones cannot display the entire Hero above the fold. Verify that
    // its normal scrolling path exposes the full tap target without an overlay.
    if (height < 568 && width < 700) {
      await evaluate('document.querySelector(\'a[aria-label="Rizzie: Start For Free"]\')?.scrollIntoView({ block: "center" }); true');
      await sleep(150);
    }
    const result = JSON.parse(await evaluate(expression));
    const blocked = result.visibleSamples - result.clickableSamples;
    const bad = !result.pet || result.overflow || result.cookieOverlap > 0 || result.dockOverlap > 0
      || result.ctaOverlap > 0 || result.textOverlap > 0 || blocked > 0;
    console.log((bad ? "FAIL" : "PASS") + " " + width + "x" + height
      + " hit=" + result.clickableSamples + "/" + result.visibleSamples
      + " overlap(cookie,dock,cta,text)="
      + [result.cookieOverlap, result.dockOverlap, result.ctaOverlap, result.textOverlap].map(Math.round).join(","));
    if (bad) errors++;
  }
  assert.equal(errors, 0, "Rizzie must stay fully clickable and clear of fixed overlays");
} finally {
  try { socket?.close(); } catch { /* browser may already have exited */ }
  chrome.kill();
  await sleep(200);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
