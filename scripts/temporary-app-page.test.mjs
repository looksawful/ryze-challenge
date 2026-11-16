import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createTemporaryAppPage } from "./temporary-app-page.mjs";

async function sandbox(t) {
  const directory = await mkdtemp(join(tmpdir(), "ryze-test-route-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("existing route and its files are never overwritten or removed", async (t) => {
  const app = await sandbox(t);
  const existing = join(app, "shell_preview_debug");
  await mkdir(existing);
  await writeFile(join(existing, "page.tsx"), "original");
  await writeFile(join(existing, "notes.txt"), "keep");
  await assert.rejects(
    createTemporaryAppPage(app, "shell_preview_debug", "fixture"),
    { code: "EEXIST" },
  );
  assert.equal(await readFile(join(existing, "page.tsx"), "utf8"), "original");
  assert.equal(await readFile(join(existing, "notes.txt"), "utf8"), "keep");
});

test("cleanup deletes only the owned fixture and preserves new neighboring files", async (t) => {
  const app = await sandbox(t);
  const cleanup = await createTemporaryAppPage(app, "shell_preview_debug", "fixture");
  const directory = join(app, "shell_preview_debug");
  await writeFile(join(directory, "notes.txt"), "keep");
  await assert.rejects(cleanup(), { code: "ENOTEMPTY" });
  assert.equal(await readFile(join(directory, "notes.txt"), "utf8"), "keep");
});
test("cleanup removes an untouched temporary route", async (t) => {
  const app = await sandbox(t);
  const cleanup = await createTemporaryAppPage(app, "shell_preview_debug", "fixture");
  await cleanup();
  await assert.rejects(readFile(join(app, "shell_preview_debug", "page.tsx")), { code: "ENOENT" });
});
