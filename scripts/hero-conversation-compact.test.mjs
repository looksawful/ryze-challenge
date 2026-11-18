import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const component = readFileSync(new URL("../src/features/hero/HeroConversation.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/features/hero/HeroConversation.module.css", import.meta.url), "utf8");

test("website-first Hero starts with a single chat-like field, not a transcript card", () => {
  assert.doesNotMatch(component, /className=\{styles\.topline\}/);
  assert.doesNotMatch(component, /className=\{styles\.transcript\}/);
  assert.match(component, /type="text" name="website"/);
  assert.match(component, /<form\b[^>]*className=\{styles\.composer\}/);
  assert.match(component, /type="submit"/);
});

test("chat shell is transparent and the input alone owns the pill surface", () => {
  assert.match(css, /\.chat\s*\{[^}]*background:\s*transparent/s);
  assert.match(css, /\.composer\s*\{[^}]*border-radius:\s*999px/s);
  assert.doesNotMatch(css, /\.chat\s*\{[^}]*backdrop-filter\s*:/s);
});

test("website address is a local preview, not a fictitious subscription", () => {
  assert.match(component, /Website address accepted/);
  assert.match(component, /role=\{reply\.kind === "error" \? "alert" : "status"\}/);
  assert.doesNotMatch(component, /className=\{styles\.proof\}/);
  assert.doesNotMatch(component, /<Image\b/);
});

test("valid submission is text-only and invalid addresses produce accessible feedback", () => {
  assert.match(component, /Website address accepted\./);
  assert.match(component, /aria-invalid=\{Boolean\(error\)\}/);
  assert.match(component, /id=\{reply\.kind === "error" \? "ryze-website-error"/);
  assert.doesNotMatch(component, /className=\{styles\.(?:proof|previewImage|choices)\}/);
  assert.doesNotMatch(component, /capabilities\.map/);
});

test("no-JavaScript action has a real destination, not a disabled submit", () => {
  assert.match(component, /<noscript>/);
  assert.match(component, /className=\{styles\.staticStart\}/);
  assert.match(css, /\.chat:has\(\.staticStart\) \.composer \{ display: none; \}/);
});
