import assert from "node:assert/strict";
import test from "node:test";
import {
  navigationGroups,
  headerLinks,
  footerGroups,
  bookingLink,
  previewNotice,
  mobileSiteSections,
  shopifyDockSections,
  shopifyPricingHref,
  shopifyStartHref,
} from "../src/features/site-shell/link-model.ts";

test("header groups and direct actions use only verified Ryze destinations", () => {
  assert.deepEqual(navigationGroups.map((group) => group.id), [
    "products",
    "growth",
    "resources",
  ]);
  assert.equal(headerLinks.find((link) => link.label === "Pricing")?.href,
    "https://www.get-ryze.ai/payment-setup");
  assert.equal(bookingLink.href, "https://ryze.cal.com/hello/partner-program");
});

test("footer keeps separate verified pricing destination", () => {
  assert.equal(footerGroups.length, 6);
  const product = footerGroups.find((group) => group.id === "product");
  assert.equal(product?.links.find((link) => link.label === "Pricing")?.href,
    "https://www.get-ryze.ai/pricing");
});

test("all links point to grounded Ryze, documentation, booking, or email destinations", () => {
  const links = [
    ...navigationGroups.flatMap((group) => group.links),
    ...headerLinks,
    bookingLink,
    ...footerGroups.flatMap((group) => group.links),
  ];
  for (const link of links) {
    const url = new URL(link.href);
    const allowed =
      (url.protocol === "https:" && ["www.get-ryze.ai", "help.get-ryze.ai", "ryze.cal.com"].includes(url.hostname)) ||
      (url.protocol === "mailto:" && link.href === "mailto:hello@get-ryze.ai");
    assert.ok(allowed, `unverified destination: ${link.href}`);
  }
  assert.ok(links.some((link) => link.label === "Shopify CRO"));
  assert.ok(links.some((link) => link.label === "MCP"));
});

test("preview copy identifies the real target without pretending to navigate", () => {
  const item = navigationGroups[0].links[0];
  const message = previewNotice(item);
  assert.match(message, /this preview stays on the same page/i);
  assert.ok(message.includes(item.label));
});

test("Shopify mobile navigation exposes global Muse and the five approved dock actions", () => {
  assert.deepEqual(shopifyDockSections.map((link) => link.label), [
    "Ads", "SEO / AI", "CRO",
  ]);
  assert.deepEqual(mobileSiteSections.map((group) => group.label), [
    "Products", "Explore", "Resources", "Company",
  ]);
  assert.equal(mobileSiteSections[0].links.find((link) => link.label === "Muse")?.href,
    "https://www.get-ryze.ai/muse");
  assert.equal(shopifyPricingHref, "https://www.get-ryze.ai/pricing");
  assert.equal(shopifyStartHref, "https://reports.get-ryze.ai/o/all");
  for (const section of shopifyDockSections) {
    assert.ok(section.targetId.startsWith("shopify-"));
    assert.equal(new URL(section.href).hostname, "www.get-ryze.ai");
  }
});
