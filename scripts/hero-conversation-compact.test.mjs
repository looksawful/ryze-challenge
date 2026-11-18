import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const component = readFileSync(new URL("../src/features/hero/HeroConversation.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/features/hero/HeroConversation.module.css", import.meta.url), "utf8");

test("email-first Hero starts with a single chat-like field, not a transcript card", () => {
  assert.doesNotMatch(component, /className=\{styles\.topline\}/);
  assert.doesNotMatch(component, /className=\{styles\.transcript\}/);
  assert.match(component, /type="email"/);
  assert.match(component, /<form\b[^>]*className=\{styles\.composer\}/);
  assert.match(component, /type="submit"/);
});

test("chat shell is transparent and the input alone owns the pill surface", () => {
  assert.match(css, /\.chat\s*\{[^}]*background:\s*transparent/s);
  assert.match(css, /\.composer\s*\{[^}]*border-radius:\s*999px/s);
  assert.doesNotMatch(css, /\.chat\s*\{[^}]*backdrop-filter\s*:/s);
});

test("email is a local preview, not a fictitious subscription", () => {
  assert.match(component, /No email has been sent/);
  assert.match(component, /setSubmitted\(true\)/);
});
