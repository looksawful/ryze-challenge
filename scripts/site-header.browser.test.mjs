import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { createReadStream, existsSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createTemporaryAppPage } from "./temporary-app-page.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const fixture = [
  '"use client";',
  'import { useEffect, useState } from "react";',
  'import { SiteHeader } from "@/features/site-shell/SiteHeader";',
  'export default function ShellFixture() {',
  'const [selection, select] = useState("");',
  'const [hydrated, markHydrated] = useState(false);',
  'useEffect(() => markHydrated(true), []);',
  'return <div data-testid="shell-fixture" data-hydrated={hydrated ? "yes" : "no"}>',
  '<SiteHeader onPreviewDestination={(item) => select(item.id + "|" + item.href)} />',
  '<main id="main"><button id="outside" type="button">Outside menu</button>',
  '<output id="selection">{selection}</output></main></div>;',
  '}',
].join("\n");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}
async function poll(fn, label, maxMs = 25000) {
  const until = Date.now() + maxMs;
  let last;
  while (Date.now() < until) {
    try {
      const value = await fn();
      if (value) return value;
    } catch (error) { last = error; }
    await sleep(140);
  }
  throw new Error("Timed out: " + label + (last ? ": " + last.message : ""));
}
function connectCdp(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    socket.addEventListener("error", reject);
    socket.addEventListener("open", () => resolve({
      async send(method, params = {}) {
        const n = ++id;
        const promise = new Promise((res, rej) => pending.set(n, { res, rej }));
        socket.send(JSON.stringify({ id: n, method, params }));
        return promise;
      },
      close: () => socket.close(),
    }));
    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      const entry = pending.get(data.id);
      if (!entry) return;
      pending.delete(data.id);
      if (data.error) entry.rej(new Error(JSON.stringify(data.error)));
      else entry.res(data.result);
    });
  });
}
const trigger = "(Array.from(document.querySelectorAll('nav[aria-label=\"Primary navigation\"] button')).find((node) => node.textContent.includes('Products')))";
const back = "(Array.from(document.querySelectorAll('dialog button')).find((node) => node.textContent.includes('Back')))";
const group = "(Array.from(document.querySelectorAll('dialog button')).find((node) => node.textContent.includes('Products')))";

test("SiteHeader browser interactions at the public component seam", { timeout: 240000 }, async (t) => {
  assert.ok(existsSync(chromePath), "Chrome missing: " + chromePath);
  const cleanupRoute = await createTemporaryAppPage(join(root, "src", "app"), "shell_preview_debug", fixture);
  let server, chrome, cdp, profile;
  t.after(async () => {
    cdp?.close();
    if (chrome && !chrome.killed) chrome.kill();
    if (server) await new Promise((resolve) => server.close(resolve));
    await cleanupRoute();
    if (profile) await rm(profile, { recursive: true, force: true, maxRetries: 6, retryDelay: 200 });
  });
  profile = await mkdtemp(join(tmpdir(), "ryze-browser-test-"));
  const port = await freePort();
  execFileSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
    cwd: root, stdio: "pipe", timeout: 150000,
  });
  server = createHttpServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relative = pathname.endsWith("/") ? pathname + "index.html" : pathname;
    if (relative.includes("..")) { res.writeHead(400); res.end(); return; }
    const filename = join(root, "out", relative.replace(/^\/+/, ""));
    if (!existsSync(filename)) { res.writeHead(404); res.end(); return; }
    const ext = filename.split(".").at(-1);
    const mime = { js: "text/javascript", css: "text/css", html: "text/html", svg: "image/svg+xml",
      png: "image/png", woff2: "font/woff2", json: "application/json", webp: "image/webp" };
    res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
    createReadStream(filename).pipe(res);
  });
  await new Promise((resolve) => server.listen(port, resolve));
  chrome = spawn(chromePath, [
    "--headless=new", "--no-first-run", "--no-default-browser-check", "--disable-gpu",
    "--no-sandbox", "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank",
  ], { stdio: "ignore", windowsHide: true });
  const debugPort = await poll(async () => {
    const path = join(profile, "DevToolsActivePort");
    if (!existsSync(path)) return null;
    return Number((await readFile(path, "utf8")).split("\n")[0]);
  }, "Chrome debugging port");
  const debugPage = await poll(async () => {
    const pages = await (await fetch("http://127.0.0.1:" + debugPort + "/json/list")).json();
    return pages.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
  }, "Chrome page");
  cdp = await connectCdp(debugPage.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: "window.__errors=[];addEventListener('error',e=>window.__errors.push(String(e.message)));addEventListener('unhandledrejection',e=>window.__errors.push(String(e.reason)));" });

  async function evaluate(expression) {
    const response = await cdp.send("Runtime.evaluate", {
      expression, returnByValue: true, awaitPromise: true,
    });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result?.value;
  }
  async function resize(width, height = 844) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width, height, deviceScaleFactor: 1, mobile: false,
    });
    await cdp.send("Page.navigate", { url: "http://localhost:" + port + "/shell_preview_debug/" });
    try {
      await poll(async () => await evaluate(
        'document.querySelector(\'[data-testid="shell-fixture"][data-hydrated="yes"]\') !== null',
      ), "hydration at " + width, 5000);
    } catch (error) {
      const debug = await evaluate('({url:location.href,body:document.body?.innerText?.slice(0,700),ready:document.querySelector("[data-testid=shell-fixture]")?.getAttribute("data-hydrated"),state:document.readyState,errors:window.__errors,scripts:[...document.querySelectorAll("script[src]")].map(s=>s.getAttribute("src")).slice(0,10),resources:performance.getEntriesByType("resource").filter(r=>r.name.includes("_next")).slice(-8).map(r=>({name:r.name.slice(-75),status:r.responseStatus,duration:r.duration}))})');
      throw new Error(error.message + " " + JSON.stringify(debug));
    }
  }
  async function expectState(expression, expected, name) {
    await poll(async () => (await evaluate(expression)) === expected, name, 3000);
  }
  async function escape() {
    await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  }

  await t.test("desktop: click toggles mega menu", async () => {
    await resize(1440);
    await evaluate(trigger + ".click()");
    await expectState(trigger + ".getAttribute('aria-expanded')", "true", "opens");
    await evaluate(trigger + ".click()");
    await expectState(trigger + ".getAttribute('aria-expanded')", "false", "second click closes");
  });

  await t.test("desktop: hover opens and first pointer click keeps menu usable", async () => {
    await resize(1440);
    const center = await evaluate("(()=>{const r=" + trigger + ".getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()");
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...center });
    await expectState(trigger + ".getAttribute('aria-expanded')", "true", "hover opens");
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", ...center, button: "left", buttons: 1, clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...center, button: "left", buttons: 0, clickCount: 1 });
    await expectState(trigger + ".getAttribute('aria-expanded')", "true", "first pointer click preserves open menu");
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", ...center, button: "left", buttons: 1, clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...center, button: "left", buttons: 0, clickCount: 1 });
    await expectState(trigger + ".getAttribute('aria-expanded')", "false", "second pointer click closes");
  });

  await t.test("desktop: Escape, outside click and intercepted link", async () => {
    await resize(1440);
    await evaluate(trigger + ".click()");
    await expectState(trigger + ".getAttribute('aria-expanded')", "true", "opens");
    await escape();
    await expectState(trigger + ".getAttribute('aria-expanded')", "false", "Escape closes");
    await evaluate(trigger + ".click()");
    await evaluate("document.querySelector('#outside').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));document.querySelector('#outside').click()");
    await expectState(trigger + ".getAttribute('aria-expanded')", "false", "outside click");
    await evaluate(trigger + ".click()");
    const originalUrl = await evaluate("location.href");
    await evaluate("document.querySelector('#ryze-mega-products a').click()");
    await expectState("document.querySelector('#selection').textContent.includes('https://www.get-ryze.ai/')", true, "preview callback");
    assert.equal(await evaluate("location.href"), originalUrl);
  });

  await t.test("mobile: nested screen, Back, Escape and focus restoration", async () => {
    await resize(390);
    await evaluate('document.querySelector(\'button[aria-label="Toggle navigation menu"]\').click()');
    await expectState("document.querySelector('dialog').open", true, "mobile dialog opens");
    assert.equal(await evaluate("document.body.style.overflow"), "hidden");
    await evaluate(group + ".click()");
    await expectState("document.querySelector('dialog').getAttribute('aria-label')", "Products", "nested group");
    assert.ok(await evaluate("document.activeElement?.textContent?.includes('Back')"), "Back receives focus");
    await evaluate(back + ".click()");
    await expectState("document.querySelector('dialog').getAttribute('aria-label')", "Navigation menu", "Back returns");
    assert.ok(await evaluate("document.activeElement?.textContent?.includes('Products')"), "Back restores focus to the chosen group");
    await escape();
    await expectState("document.querySelector('dialog').open", false, "Escape closes");
    assert.equal(await evaluate("document.body.style.overflow"), "");
    assert.equal(await evaluate("document.activeElement?.getAttribute('aria-label')"), "Toggle navigation menu");
  });

  await t.test("mobile: preview navigation is intercepted and drawer closes", async () => {
    await resize(390);
    const originalUrl = await evaluate("location.href");
    await evaluate('document.querySelector(\'button[aria-label="Toggle navigation menu"]\').click()');
    await expectState("document.querySelector('dialog').open", true, "open drawer");
    await evaluate(group + ".click()");
    await evaluate("document.querySelector('dialog a[href]').click()");
    await expectState("document.querySelector('#selection').textContent.includes('https://www.get-ryze.ai/')", true, "destination callback");
    await expectState("document.querySelector('dialog').open", false, "drawer closes after selection");
    assert.equal(await evaluate("location.href"), originalUrl);
  });

  await t.test("mobile: resizing to desktop dismisses drawer and restores scroll", async () => {
    await resize(390);
    await evaluate('document.querySelector(\'button[aria-label="Toggle navigation menu"]\').click()');
    await expectState("document.querySelector('dialog').open", true, "open drawer");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440, height: 844, deviceScaleFactor: 1, mobile: false,
    });
    await expectState("document.querySelector('dialog').open", false, "drawer closes on breakpoint");
    assert.equal(await evaluate("document.body.style.overflow"), "");
  });

  await t.test("responsive: breakpoints and no horizontal overflow", async () => {
    for (const width of [390, 640, 1023, 1024, 1440]) {
      await resize(width);
      const measurement = await evaluate("({ overflow: document.documentElement.scrollWidth - innerWidth, navWidth: document.querySelector('nav[aria-label=\"Primary navigation\"]').getBoundingClientRect().width, toggleWidth: document.querySelector('button[aria-label=\"Toggle navigation menu\"]').getBoundingClientRect().width })");
      assert.ok(measurement.overflow <= 1, "overflow at " + width + ": " + measurement.overflow);
      assert.equal(measurement.navWidth > 0, width >= 1024, "desktop nav at " + width);
      assert.equal(measurement.toggleWidth > 0, width < 1024, "mobile menu at " + width);
    }
  });

  await t.test("no-JS: all destinations remain accessible as links", async () => {
    await cdp.send("Emulation.setScriptExecutionDisabled", { value: true });
    await cdp.send("Page.navigate", { url: "http://localhost:" + port + "/shell_preview_debug/" });
    await poll(async () => await evaluate("document.querySelector('header') !== null"), "static server HTML");
    const count = await evaluate('document.querySelectorAll(\'nav[aria-label="All destinations"] a[href]\').length');
    assert.ok(count > 5, "No-JS fallback must show real links; found " + count);
    await cdp.send("Emulation.setScriptExecutionDisabled", { value: false });
  });
});
