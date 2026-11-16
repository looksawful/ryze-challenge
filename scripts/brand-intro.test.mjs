import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = () => readFileSync("public/ryze-logo-intro.html", "utf8");

test("brand intro is an isolated black-only mark with source-derived silhouette", () => {
  const content = html();
  assert.match(content, /<html\b[^>]*lang="ru"/i);
  assert.match(content, /background:\s*#000\b/i);
  assert.match(content, /<svg\b[^>]*class="mark"/);
  assert.match(content, /viewBox="128 48 40 40"/);
  assert.match(content, /M150\.039 49\.0953/);
  assert.doesNotMatch(content, /<h1|<nav|<footer|<header|Start For Free|AI autopilot/);
  assert.doesNotMatch(content, /<script\\s+src=|<link\\s+[^>]*href=/);
});

test("static mark survives no JS, reduced motion and renderer failure", () => {
  const content = html();
  assert.match(content, /<svg\b[^>]*class="mark"/);
  assert.match(content, /prefers-reduced-motion:\s*reduce/);
  assert.match(content, /getContext\(['"]2d/);
  assert.match(content, /if\s*\(!context/);
  assert.match(content, /scene\.dataset\.playing/);
});

test("animation is finite, replays on user activation and does not autoplay each visit", () => {
  const content = html();
  assert.match(content, /3500/);
  assert.match(content, /sessionStorage\.getItem/);
  assert.match(content, /sessionStorage\.setItem/);
  assert.match(content, /addEventListener\(['"]click/);
  assert.match(content, /addEventListener\(['"]keydown/);
  assert.match(content, /requestAnimationFrame/);
  assert.match(content, /cancelAnimationFrame/);
});
