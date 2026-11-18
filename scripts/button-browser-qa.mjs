import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const browserPath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const story = process.env.STORY_URL || "http://127.0.0.1:6011/iframe.html?id=ryze-foundations-button--states&viewMode=story";
const profile = await mkdtemp(join(tmpdir(), "ryze-button-qa-"));
const browser = spawn(browserPath, [
  "--headless=new", "--no-first-run", "--disable-gpu",
  "--remote-allow-origins=*", "--remote-debugging-port=0",
  "--user-data-dir=" + profile, "about:blank",
], { stdio: "ignore", windowsHide: true });
let socket;
let commandId = 0;
const pending = new Map();
const report = { browser: browserPath, story, cases: [], errors: [] };

async function until(fn, reason, timeout = 16000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { if (await fn()) return; } catch {}
    await sleep(120);
  }
  throw new Error("Timed out: " + reason);
}
function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result?.value;
}
async function inspect(width, height, reduced) {
  await cdp("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: width < 700,
  });
  await cdp("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }],
  });
  await cdp("Page.navigate", { url: story });
  await until(async () => (await evaluate("document.querySelectorAll('#storybook-root button').length")) >= 8, "Storybook controls");
  const data = await evaluate(`(() => {
    const buttons = [...document.querySelectorAll("#storybook-root button")];
    const first = buttons[0];
    const style = getComputedStyle(first);
    const rect = first.getBoundingClientRect();
    return {
      viewport: innerWidth,
      overflow: document.documentElement.scrollWidth - innerWidth,
      controls: buttons.length,
      minHeight: Math.min(...buttons.map((button) => button.getBoundingClientRect().height)),
      clippedLabels: buttons.filter((button) => button.scrollWidth > button.clientWidth + 1).map((button) => button.textContent),
      first: { background: style.backgroundColor, transition: style.transitionDuration, x: rect.x, y: rect.y,
               width: rect.width, height: rect.height }
    };
  })()`);
  assert.equal(data.viewport, width, "viewport should match emulated CSS width");
  assert.ok(data.overflow <= 2, "no horizontal overflow");
  assert.ok(data.minHeight >= 44, "44px minimum hit target");
  assert.deepEqual(data.clippedLabels, [], "no clipped labels");
  assert.ok(data.first.width > 0 && data.first.height > 0, "button is rendered");
  if (reduced) assert.ok(data.first.transition.split(",").every((s) => s.trim() === "0s"), "reduced mode has no motion");
  report.cases.push({ width, height, reduced, ...data });
  return data;
}
try {
  assert.ok(existsSync(browserPath), "Browser missing: " + browserPath);
  await until(() => existsSync(join(profile, "DevToolsActivePort")), "DevTools port");
  const port = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]);
  const tabs = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
  const page = tabs.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl);
  assert.ok(page, "CDP page");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    const promise = pending.get(data.id);
    if (!promise) return;
    pending.delete(data.id);
    data.error ? promise.reject(new Error(data.error.message)) : promise.resolve(data.result);
  });
  await new Promise((done, fail) => {
    socket.addEventListener("open", done, { once: true });
    socket.addEventListener("error", fail, { once: true });
  });
  await cdp("Page.enable");
  await cdp("Runtime.enable");
  for (const [width, height] of [[320, 720], [390, 844], [700, 900], [874, 402], [900, 760], [1200, 800], [1440, 900], [1920, 1080]]) {
    await inspect(width, height, false);
  }
  await inspect(390, 844, true);
  await inspect(1440, 900, true);
  await inspect(1440, 900, false);
  const before = report.cases.at(-1).first;
  const x = before.x + before.width / 2;
  const y = before.y + before.height / 2;
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await sleep(320);
  const hover = await evaluate("getComputedStyle(document.querySelector('#storybook-root button')).backgroundColor");
  assert.notEqual(hover, before.background, "hover must respond visually");
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await sleep(200);
  const pressed = await evaluate("getComputedStyle(document.querySelector('#storybook-root button')).scale");
  assert.equal(pressed, "0.985", "pressed surface feels tactile");
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  report.hover = { before: before.background, after: hover, pressed };
  console.log(JSON.stringify({ status: "PASS", checked: report.cases.length, hover: report.hover }, null, 2));
} catch (error) {
  report.errors.push(String(error?.stack || error));
  console.error(JSON.stringify({ status: "FAIL", errors: report.errors }, null, 2));
  process.exitCode = 1;
} finally {
  writeFileSync(resolve(process.env.QA_REPORT || "docs/notes/button-browser-qa.json"), JSON.stringify(report, null, 2));
  socket?.close();
  browser.kill();
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
}
