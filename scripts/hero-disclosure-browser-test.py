"""Chrome regression for Hero's native disclosure. Run after npm run build.
Uses the already-installed websocket-client Python dependency from other browser tests.
"""
import json
import os
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
    (320, 568), (320, 640), (390, 844), (402, 874),
    (699, 600), (700, 320), (874, 402), (1024, 500),
    (1280, 600), (1440, 600), (1440, 1024),
    (1897, 600), (1897, 1024), (2803, 1024),
]
CHROME = os.environ.get("CHROME_PATH", r"C:\Program Files\Google\Chrome\Application\chrome.exe")
if os.environ.get("RYZE_SMOKE") == "1":
    SIZES = [(320, 568), (874, 402), (1440, 1024), (2803, 1024)]


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
failures = []
try:
    with tempfile.TemporaryDirectory(prefix="hero-disclosure-browser-", ignore_cleanup_errors=True) as profile:
        process = subprocess.Popen(
            [CHROME, "--headless=new", "--no-first-run", "--disable-extensions",
             "--disable-gpu", "--remote-allow-origins=*", "--remote-debugging-port=0",
             "--user-data-dir=" + profile, "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        try:
            port_file = pathlib.Path(profile) / "DevToolsActivePort"
            for _ in range(100):
                if port_file.exists():
                    break
                time.sleep(.1)
            assert port_file.exists(), "Chrome did not start"
            port = int(port_file.read_text().splitlines()[0])
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list"))
            page = next(tab for tab in tabs if tab["type"] == "page")
            ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=15, origin="http://localhost")
            command_id = 0

            def cdp(method, params=None):
                global command_id
                command_id += 1
                ws.send(json.dumps({"id": command_id, "method": method, "params": params or {}}))
                while True:
                    event = json.loads(ws.recv())
                    if event.get("id") == command_id:
                        if "error" in event:
                            raise RuntimeError(event["error"])
                        return event.get("result", {})

            def evaluate(expression):
                value = cdp("Runtime.evaluate", {"expression": expression, "returnByValue": True})
                if value.get("exceptionDetails"):
                    raise RuntimeError(value["exceptionDetails"])
                return value["result"].get("value")

            cdp("Page.enable")
            cdp("Runtime.enable")
            address = f"http://127.0.0.1:{server.server_port}/"
            for width, height in SIZES:
                cdp("Emulation.setDeviceMetricsOverride", {
                    "width": width, "height": height, "deviceScaleFactor": 1, "mobile": False
                })
                cdp("Page.navigate", {"url": address})
                time.sleep(.65)
                evaluate("""document.querySelector('[aria-label="Minimize cookie settings"]')?.click()""")
                time.sleep(.1)
                evaluate("""document.querySelector('main details summary').scrollIntoView({block:'nearest'})""")
                time.sleep(.05)
                before = json.loads(evaluate("""JSON.stringify((() => {
                  let a=document.querySelector('main details'), b=document.querySelector('main [class*=integration]');
                  let box=e=>{let r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
                  return {action:box(a),integration:box(b)}
                })())"""))
                summary = before["action"]
                x = summary["x"] + summary["w"] / 2
                y = summary["y"] + min(summary["h"] / 2, 30)
                cdp("Input.dispatchMouseEvent", {"type": "mousePressed", "x": x, "y": y, "button": "left", "clickCount": 1})
                cdp("Input.dispatchMouseEvent", {"type": "mouseReleased", "x": x, "y": y, "button": "left", "clickCount": 1})
                time.sleep(.15)
                actual = json.loads(evaluate("""JSON.stringify((() => {
                  const details=document.querySelector('main details');
                  const note=details.querySelector('p');
                  const noteRect=note.getBoundingClientRect();
                  const rect=e=>{let r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
                  const intersection=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*
                    Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
                  const collisions=[...document.querySelector('main').children]
                    .filter(e=>e!==details)
                    .map(e=>({name:e.tagName,area:Math.round(intersection(noteRect,e.getBoundingClientRect()))}))
                    .filter(x=>x.area>4);
                  return {open:details.open,note:rect(note),visible:Math.max(0,Math.min(innerHeight,noteRect.bottom)-
                    Math.max(0,noteRect.top)),action:rect(details),
                    integration:rect(document.querySelector('main [class*=integration]')),
                    collisions,docWidth:document.documentElement.scrollWidth,
                    scrollRoom:Math.max(0,Math.max(document.documentElement.scrollHeight,
                      document.body.scrollHeight)-scrollY-innerHeight)}
                })())"""))
                issues = []
                if not actual["open"]:
                    issues.append("native summary did not open")
                if actual["visible"] + 1 < actual["note"]["h"]:
                    # Expanded content can scroll naturally on short viewports.
                    scroll_needed = max(0, actual["note"]["y"] + actual["note"]["h"] - height)
                    if actual["note"]["y"] < -1 or scroll_needed > actual["scrollRoom"] + 1:
                        issues.append("note clipped and not reachable by scrolling")
                for name in ("action", "integration"):
                    if any(abs(actual[name][key] - before[name][key]) > .5 for key in ("x", "y", "w", "h")):
                        issues.append(name + " moved")
                if actual["collisions"]:
                    issues.append("note obscures Hero content: " + str(actual["collisions"]))
                if actual["docWidth"] > width + 1:
                    issues.append("horizontal overflow")
                print(("FAIL" if issues else "PASS") + f" {width}x{height} " +
                      ", ".join(issues), flush=True)
                if issues:
                    failures.append((width, height, issues))
            ws.close()
        finally:
            process.terminate()
            try:
                process.wait(timeout=4)
            except subprocess.TimeoutExpired:
                process.kill()
finally:
    server.shutdown()

if failures:
    raise SystemExit(f"{len(failures)} of {len(SIZES)} disclosure viewport cases failed")
