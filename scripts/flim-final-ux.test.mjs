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
const svgIntro = read("public/ryze-canvas/index.html");

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
  assert.match(consent, /view === "notice" \? \(/);
  assert.match(consent, /<h2 ref=\{titleRef\}/);
  assert.doesNotMatch(consent, /Customize cookie settings/);
  assert.match(consent, /Analytics/);
});

test("Form uses accent pink submit and conversation replies instead of alert/bordered error states", () => {
  assert.match(chatCss, /\.composer button[\s\S]*?background:\s*var\(--accent-current/);
  assert.match(chat, /role=\{reply\.kind === "error" \? "alert" : "status"\}/);
  assert.match(chat, /Website address accepted/);
  assert.doesNotMatch(chat, /<Image\b/);
  assert.doesNotMatch(chat, /className=\{styles\.error\}/);
});

test("Mascot ends to the left of the website form in the fluid desktop grid", () => {
  assert.match(heroCss, /\.mascot\s*\{[^}]*grid-column:\s*1\s*\/\s*3/s);
  assert.match(heroCss, /\.action\s*\{[^}]*grid-column:\s*3\s*\/\s*11/s);
});

test("Existing large brand intro remains enabled and renders the Ryze logo", () => {
  assert.match(backdrop, /ryze-canvas\/index\.html/);
  assert.match(scene, /Original SVG logo on 3D plane/);
  assert.match(svgIntro, /function renderWind\(/);
  assert.doesNotMatch(svgIntro, /melting=false;/);
  assert.match(svgIntro, /frame.dataset.state=\x27assembling\x27/);
});

test("header contact is a transparent accent-outline action", () => {
  assert.match(headerCss, /\.header\[data-variant="dock"\] \.booking \{[^}]*border: 2px solid var\(--accent-current/s);
  assert.match(headerCss, /\.header\[data-variant="dock"\] \.booking \{[^}]*background: transparent/s);
});

test("mobile navigation is modal and keyboard focus cannot leave the drawer", () => {
  assert.match(header, /dialog\.showModal\(\)/);
  assert.match(header, /document\.addEventListener\("keydown", containFocus, true\)/);
  assert.match(header, /aria-modal="true"/);
});

test("product cards reuse the original four interface screenshots", () => {
  const model = read("src/features/site-shell/link-model.ts");
  for (const image of [
    "paid-ads-walkthrough.webp", "seo.png", "site-audit.png", "reporting.png"
  ]) assert.match(model, new RegExp("/ryze-media/navigation/" + image.replace(".", "\\.")));
});
