import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const hero = read("src/features/hero/Hero.tsx");
const heroCss = read("src/features/hero/Hero.module.css");
const header = read("src/features/site-shell/SiteHeader.tsx");
const headerCss = read("src/features/site-shell/SiteHeader.module.css");
const consent = read("src/features/consent/HomeworkCookieNotice.tsx");
const chat = read("src/features/hero/HeroConversation.tsx");
const chatCss = read("src/features/hero/HeroConversation.module.css");
const backdrop = read("src/features/site-shell/HeroMotionBackground.tsx");
const scene = read("public/ryze-canvas/src/main.js");

test("Contact us is a small surfaced header action, not floating hero copy", () => {
  assert.doesNotMatch(hero, /className=\{styles\.contact\}/);
  assert.match(header, /variant === "dock"[\s\S]*?Contact us/);
  assert.match(headerCss, /\.header\[data-variant="dock"\] \.booking/);
  assert.match(headerCss, /border-radius:\s*999px/);
});

test("Official Ryze lockup is visible at left in wide header, while mobile contact is in the drawer", () => {
  assert.match(header, /ryze-lockup-white\.svg/);
  assert.match(headerCss, /@media\s*\(min-width:\s*75rem\)[\s\S]*?\.brand/);
  assert.match(header, /className=\{styles\.mobileStart\}[^>]*>Contact us</);
});

test("Consent has one short notice without an unused heading, retains the settings dialog", () => {
  assert.match(consent, /We use optional cookies/);
  assert.match(consent, /view === "settings" \? \(/);
  assert.doesNotMatch(consent, /Customize cookie settings/);
  assert.match(consent, /Analytics/);
});

test("Form uses accent pink submit and conversation replies instead of alert/bordered error states", () => {
  assert.match(chatCss, /\.composer button[\s\S]*?background:\s*var\(--accent-current\)/);
  assert.match(chat, /role="status"/);
  assert.match(chat, /role="alert"/);
  assert.match(chat, /Starting your preview/);
  assert.doesNotMatch(chat, /className=\{styles\.error\}/);
});

test("Mascot appears in same form row at every wide breakpoint", () => {
  assert.match(heroCss, /@media\s*\(width >= 800px\)[\s\S]*?\.mascot/);
  assert.match(heroCss, /grid-area:\s*5\s*\/\s*1\s*\/\s*6\s*\/\s*3/);
});

test("Existing large brand intro remains enabled and renders the Ryze logo", () => {
  assert.match(backdrop, /ryze-canvas\/index\.html/);
  assert.match(scene, /Original SVG logo on 3D plane/);
});
