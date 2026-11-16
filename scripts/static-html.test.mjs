import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("static export contains meaningful HTML before JavaScript executes", () => {
  const html = readFileSync("out/index.html", "utf8");
  assert.match(html, /<main[^>]*data-theme="dusk"[^>]*>/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  const headline = html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  assert.equal(headline, "AI autopilot for your Shopify");
  assert.match(html, /A new way to grow your store\./);
  assert.match(html, /Paid ads, SEO, AI visibility &amp; CRO\./);
  assert.match(html, /One AI autopilot built around your business\./);
  assert.match(html, /Plugs into<br\/>\s*(?:<!-- -->)?any platform/);
  assert.match(html, /<summary[^>]*>Start For Free<\/summary>/);
  assert.match(html, /<link[^>]*stylesheet/);
});

test("all static platform logos and brand mark use the configured basePath", () => {
  const html = readFileSync("out/index.html", "utf8");
  const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";
  for (const file of [
    "brand-mark.svg",
    "platform-logos/shopify.png",
    "platform-logos/google-ads.svg",
    "platform-logos/meta.svg",
    "platform-logos/tiktok.svg",
    "platform-logos/google-analytics.svg",
  ]) {
    assert.ok(html.includes(`src="${prefix}/${file}"`), `Expected asset: ${prefix}/${file}`);
  }
  for (const alt of ["Shopify", "Google Ads", "Meta Ads", "TikTok", "Google Analytics"]) {
    assert.ok(html.includes(`alt="${alt}"`), `Missing accessible logo: ${alt}`);
  }
});

test("cookie consent notice renders in the initial static HTML", () => {
  const html = readFileSync("out/index.html", "utf8");
  assert.match(html, /data-cookie-consent/);
  assert.match(html, /data-view="notice"/);
  assert.match(html, /Cookie settings/);
  assert.match(html, /Minimize cookie settings/);
  assert.match(html, /Customize cookie settings/);
  assert.match(html, /Reject all cookies/);
  assert.match(html, /Accept all cookies/);
});
