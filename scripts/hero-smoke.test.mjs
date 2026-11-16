import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import test from "node:test";

const output = resolve("out");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };

async function eventually(check, label, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { if (await check()) return; } catch { /* Page is loading. */ }
    await sleep(100);
  }
  throw new Error("Timeout: " + label);
}

test("release smoke against the real exported Hero", { timeout: 160000 }, async (t) => {
  assert.ok(existsSync(join(output, "index.html")), "Run npm run build first");
  assert.ok(existsSync(chromePath), "Chrome unavailable");
  const server = createServer((req, res) => {
    const route = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const filename = resolve(output, "." + (route.endsWith("/") ? route + "index.html" : route));
    if (!filename.startsWith(output + sep)) { res.writeHead(403); res.end(); return; }
    if (!existsSync(filename)) { res.writeHead(404); res.end(); return; }
    res.setHeader("content-type", mime[extname(filename)] || "application/octet-stream");
    createReadStream(filename).pipe(res);
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const url = "http://127.0.0.1:" + server.address().port + "/";
  const profile = await mkdtemp(join(tmpdir(), "ryze-smoke-"));
  const chrome = spawn(chromePath, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--disable-extensions",
    "--remote-allow-origins=*", "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank",
  ], { stdio: "ignore", windowsHide: true });
  let socket;
  let nextId = 0;
  const pending = new Map();
  t.after(async () => {
    socket?.close();
    chrome.kill();
    await new Promise((done) => server.close(done));
    await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  });

  const portfile = join(profile, "DevToolsActivePort");
  await eventually(() => existsSync(portfile), "Chrome debugging port");
  const port = Number(readFileSync(portfile, "utf8").split("\n")[0]);
  const tabs = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
  const page = tabs.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
  assert.ok(page, "Chrome page");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  socket.addEventListener("message", (event) => {
    const result = JSON.parse(event.data);
    const task = pending.get(result.id);
    if (!task) return;
    pending.delete(result.id);
    if (result.error) task.reject(new Error(result.error.message));
    else task.resolve(result.result);
  });
  await new Promise((done, fail) => {
    socket.addEventListener("open", done, { once: true });
    socket.addEventListener("error", fail, { once: true });
  });
  const cdp = (method, params = {}) => new Promise((done, fail) => {
    const id = ++nextId;
    pending.set(id, { resolve: done, reject: fail });
    socket.send(JSON.stringify({ id, method, params }));
  });
  async function js(expression) {
    const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result?.value;
  }
  async function load(width, height, enabled = true) {
    await cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await cdp("Emulation.setScriptExecutionDisabled", { value: !enabled });
    await cdp("Page.navigate", { url });
    await eventually(() => js("document.readyState === 'complete' && !!document.querySelector('main h1')"), "Hero");
    if (enabled) await eventually(() => js("!!document.querySelector('aside[aria-labelledby]') || !!localStorage.getItem('ryze-cookie-preferences')"), "hydration");
  }
  await cdp("Page.enable");
  await cdp("Runtime.enable");

  await t.test("responsive HTML and no-JS navigation", async () => {
    for (const [width, height] of [[320, 568], [402, 874], [874, 402], [1440, 1024], [1897, 1024], [2803, 1024]]) {
      await load(width, height);
      const overflow = await js("document.documentElement.scrollWidth - innerWidth");
      assert.ok(overflow <= 1, "Horizontal overflow at " + width + "x" + height + ": " + overflow);
    }
    await load(402, 874, false);
    assert.equal(await js("document.querySelectorAll('main h1').length"), 1);
    assert.equal(await js("!!document.querySelector('nav[aria-label=\"All destinations\"]')"), true);
  });

  await t.test("mobile navigation intercepts destinations", async () => {
    await load(402, 874);
    await eventually(() => js("!!document.querySelector('[aria-label=\"More navigation\"]')"), "mobile dock");
    await js("document.querySelector('[aria-label=\"More navigation\"]').click()");
    await eventually(() => js("!!document.querySelector('dialog[data-preview-part=\"mobile-menu\"][open]')"), "mobile menu");
    await js("Array.from(document.querySelectorAll('dialog[open] button')).find(b => b.textContent.includes('Products')).click()");
    await eventually(() => js("!!document.querySelector('dialog[open] a[href]')"), "product link");
    const before = await js("location.href");
    await js("document.querySelector('dialog[open] a[href]').click()");
    await eventually(() => js("!!document.querySelector('[data-rizzie-bubble]')"), "Rizzie explanation");
    assert.equal(await js("location.href"), before);
  });

  await t.test("desktop navigation intercepts destinations", async () => {
    await load(1440, 1024);
    await js("document.querySelector('nav[aria-label=\"Primary navigation\"] button').click()");
    await eventually(() => js("!!document.querySelector('[data-preview-part=\"mega-menu\"] a[href]')"), "desktop menu");
    const before = await js("location.href");
    await js("document.querySelector('[data-preview-part=\"mega-menu\"] a[href]').click()");
    await eventually(() => js("!!document.querySelector('[data-rizzie-bubble]')"), "Rizzie explanation");
    assert.equal(await js("location.href"), before);
  });

  await t.test("domain CTA opens mobile drawer and desktop mock result", async () => {
    await load(402, 874);
    await js("document.querySelector('#hero-action details summary').click()");
    await eventually(() => js("document.querySelector('dialog[aria-label=\"Store domain entry\"][open] input') === document.activeElement"), "drawer focus");
    await js("document.querySelector('dialog[aria-label=\"Store domain entry\"] [aria-label=\"Close domain entry\"]').click()");
    await eventually(() => js("document.activeElement?.textContent === 'Start For Free'"), "focus restored");

    await load(1440, 1024);
    await js("document.querySelector('#hero-action details summary').click()");
    await eventually(() => js("!!document.querySelector('#hero-action input[inputmode=\"url\"]')"), "domain input");
    await js("document.querySelector('#hero-action form').requestSubmit()");
    await eventually(() => js("!!document.querySelector('#hero-action [role=\"alert\"]')"), "empty-domain validation");
    await js("(() => {const el=document.querySelector('#hero-action input');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(el,'shop.example.com');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
    await js("document.querySelector('#hero-action form').requestSubmit()");
    await eventually(() => js("!!document.querySelector('#hero-action [aria-label=\"Example response\"]')"), "mock response");
    const before = await js("location.href");
    await js("Array.from(document.querySelectorAll('#hero-action button')).find(b=>b.textContent==='Preview experience').click()");
    await eventually(() => js("!!document.querySelector('[data-rizzie-bubble]')"), "Rizzie preview");
    assert.equal(await js("location.href"), before);
    await js("Array.from(document.querySelectorAll('#hero-action button')).find(b=>b.textContent==='Edit domain').click()");
    await eventually(() => js("document.querySelector('#hero-action')?.dataset.stage === 'editing' && document.activeElement === document.querySelector('#hero-action input')"), "domain retry focus");
  });

  await t.test("cookie choice persists and settings reopen", async () => {
    await load(402, 874);
    await js("Array.from(document.querySelectorAll('aside[aria-labelledby] button')).find(b=>b.textContent.includes('Reject all cookies')).click()");
    await eventually(() => js("!document.querySelector('aside[aria-labelledby]')"), "cookie dismissed");
    await load(402, 874);
    assert.equal(await js("!!document.querySelector('aside[aria-labelledby]')"), false);
    await js("document.querySelector('[data-cookie-settings-trigger]').click()");
    await eventually(() => js("!!document.querySelector('aside[data-settings]')"), "cookie preferences");
  });
});
