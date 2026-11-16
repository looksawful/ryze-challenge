"""Issue #14: geometry regression for the real static HTML.
Run after npm run build: python scripts/consent_browser_test.py
Requires Chrome and the websocket-client Python package, no app dependencies.
"""
import json
import pathlib
import subprocess
import tempfile
import threading
import time
import urllib.request
import http.server
import websocket

ROOT = pathlib.Path(__file__).resolve().parent.parent / "out"
SIZES = [
    (320, 568), (320, 640), (360, 780), (402, 600), (402, 874),
    (680, 700), (700, 320), (874, 300), (874, 402),
    (1024, 500), (1024, 768), (1200, 800), (1280, 600), (1366, 500),
    (1366, 768), (1440, 600), (1440, 1024), (1600, 600), (1600, 900),
    (1897, 600), (1897, 1024), (2399, 1024), (2400, 700),
    (2400, 1024), (2803, 1024),
]
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *_):
        pass

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass


server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
failures = 0
try:
    with tempfile.TemporaryDirectory(prefix="ryze-cookie-test-") as profile:
        proc = subprocess.Popen(
            [CHROME, "--headless=new", "--no-first-run", "--disable-extensions",
             "--disable-gpu", "--remote-allow-origins=*", "--remote-debugging-port=0",
             "--user-data-dir=" + profile, "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        try:
            portfile = pathlib.Path(profile) / "DevToolsActivePort"
            for _ in range(100):
                if portfile.exists():
                    break
                time.sleep(0.1)
            assert portfile.exists(), "Chrome DevTools failed to start"
            port = int(portfile.read_text().splitlines()[0])
            pages = json.load(urllib.request.urlopen("http://127.0.0.1:%d/json/list" % port))
            target = next(p for p in pages if p["type"] == "page")
            ws = websocket.create_connection(target["webSocketDebuggerUrl"], timeout=15, origin="http://localhost")
            seq = 0

            def cdp(method, params=None):
                global seq
                seq += 1
                ws.send(json.dumps({"id": seq, "method": method, "params": params or {}}))
                while True:
                    result = json.loads(ws.recv())
                    if result.get("id") == seq:
                        if "error" in result:
                            raise RuntimeError(str(result["error"]))
                        return result.get("result", {})

            def evaluate(expression):
                obj = cdp("Runtime.evaluate", {"expression": expression, "returnByValue": True})
                if obj.get("exceptionDetails"):
                    raise RuntimeError(str(obj["exceptionDetails"]))
                return obj["result"].get("value")

            cdp("Page.enable")
            cdp("Runtime.enable")
            url = "http://127.0.0.1:%d/" % server.server_port

            for width, height in SIZES:
                cdp("Emulation.setDeviceMetricsOverride", {
                    "width": width, "height": height, "deviceScaleFactor": 1, "mobile": False
                })
                cdp("Page.navigate", {"url": url})
                time.sleep(0.6)
                for view in ("notice", "settings"):
                    if view == "settings":
                        evaluate("""document.querySelector('[data-cookie-consent] button:not([aria-label])').click()""")
                        time.sleep(0.25)
                    data = json.loads(evaluate("""JSON.stringify((() => {
                      const root = document.querySelector('[data-cookie-consent]');
                      const panel = root.querySelector('aside');
                      const box = panel.getBoundingClientRect();
                      const area = (a,b) => Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)) *
                                           Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
                      const blockers = [...document.querySelector('main').children]
                        .filter(e => e !== root && !e.contains(root))
                        .map(e => ({ name: e.tagName + '.' + String(e.className).split('_').at(-1),
                                     overlap: Math.round(area(box,e.getBoundingClientRect())) }))
                        .filter(e => e.overlap > 4);
                      return {view: root.dataset.view, blockers,
                        panel: {x:Math.round(box.x), y:Math.round(box.y),
                                width:Math.round(box.width), height:Math.round(box.height),
                                position:getComputedStyle(panel).position},
                        docWidth:document.documentElement.scrollWidth};
                    })())"""))
                    errors = []
                    if data["view"] != view:
                        errors.append("wrong view " + data["view"])
                    if data["blockers"]:
                        errors.append("intersection " + json.dumps(data["blockers"]))
                    if data["docWidth"] > width + 1:
                        errors.append("horizontal overflow " + str(data["docWidth"]))
                    p = data["panel"]
                    visible = max(0, min(height, p["y"] + p["height"]) - max(0, p["y"]))
                    if visible < min(50, p["height"] / 3):
                        errors.append("initial panel not sufficiently visible, y=" + str(p["y"]))
                    if errors:
                        failures += 1
                    print("%s %sx%s %s %sx%s %s" % (
                        "FAIL" if errors else "PASS", width, height, view,
                        data["panel"]["width"], data["panel"]["height"],
                        "; ".join(errors) if errors else ""), flush=True)
            # Exercise the actual client interactions after layout assertions.
            cdp("Emulation.setDeviceMetricsOverride", {
                "width": 402, "height": 874, "deviceScaleFactor": 1, "mobile": False
            })
            cdp("Page.navigate", {"url": url})
            time.sleep(0.8)

            def expect_view(label, expected):
                for _ in range(20):
                    actual = evaluate("""document.querySelector('[data-cookie-consent]').dataset.view""")
                    if actual == expected:
                        print("PASS interaction " + label, flush=True)
                        return
                    time.sleep(0.05)
                raise AssertionError(label + ": expected " + expected + ", got " + str(actual))

            def click(selector):
                evaluate("document.querySelector(" + json.dumps(selector) + ").click()")

            def expect_focus(label):
                for _ in range(20):
                    if evaluate("document.activeElement.getAttribute('aria-label')") == label:
                        print("PASS focus " + label, flush=True)
                        return
                    time.sleep(0.05)
                raise AssertionError("Focus did not reach " + label)

            expect_view("initial", "notice")
            click('[aria-label="Minimize cookie settings"]')
            expect_view("minus collapses", "collapsed")
            expect_focus("Open cookie settings")

            click('[aria-label="Open cookie settings"]')
            expect_view("reopen notice", "notice")
            for _ in range(20):
                if evaluate("document.activeElement.tagName") == "H2":
                    break
                time.sleep(0.05)
            assert evaluate("document.activeElement.tagName") == "H2"

            click('[data-cookie-consent] button:not([aria-label])')
            expect_view("customize", "settings")
            assert evaluate("""(() => { const input = document.querySelector('input[role="switch"]');
                input.click(); return input.checked; })()""") is True
            evaluate("""[...document.querySelectorAll('[data-cookie-consent] button')]
              .find(button => button.textContent.trim() === 'Save preferences').click()""")
            expect_view("save preferences", "collapsed")
            click('[aria-label="Open cookie settings"]')
            expect_view("reopen after saving", "notice")
            time.sleep(0.3)
            cdp("Input.dispatchMouseEvent", {
                "type": "mouseWheel", "x": 25, "y": 550, "deltaX": 0, "deltaY": 180
            })
            expect_view("wheel collapses", "collapsed")

            cdp("Page.navigate", {"url": url})
            time.sleep(0.7)
            expect_view("reload resets choice", "notice")
            cdp("Emulation.setEmulatedMedia", {
                "features": [{"name": "prefers-reduced-motion", "value": "reduce"}]
            })
            assert evaluate("""getComputedStyle(
                document.querySelector('[data-cookie-consent] aside')
            ).transitionDuration""") in ("0s", "0s, 0s")
            print("PASS interaction reduced motion", flush=True)
            ws.close()
        finally:
            proc.terminate()
            try:
                proc.wait(timeout=4)
            except subprocess.TimeoutExpired:
                proc.kill()
finally:
    server.shutdown()

if failures:
    raise SystemExit("%d geometry cases failed" % failures)
