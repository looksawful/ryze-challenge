import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = (path) => readFileSync(new URL("../src/" + path, import.meta.url), "utf8");

test("navigation panels and links use surfaces, not fine-line frames", () => {
  const navigation = css("features/site-shell/SiteHeader.module.css");
  assert.doesNotMatch(navigation, /border:\s*1px solid (?:var\(--nav-line\)|var\(--color-border\))/);
  assert.doesNotMatch(navigation, /border-(?:bottom|top|inline-start):\s*1px solid var\(--(?:nav-line|color-border)\)/);
  assert.match(navigation, /\.header\s+\.megaPanel\s*\{/);
  assert.match(navigation, /\.header\[data-variant="dock"\]\s+\.mobileProductCard/);
  assert.match(navigation, /\.productCard:focus-visible\s*\{\s*outline:/);
  assert.match(navigation, /\.header\[data-variant="dock"\]\s+\.nativeMenu\s*>\s*summary:focus-visible/);
});

test("form, CTA, secondary controls and mascot speech bubble have no decorative stroke", () => {
  for (const path of [
    "features/hero/Hero.module.css",
    "features/hero/HeroAction.module.css",
    "ui/Button.module.css"
  ]) {
    assert.doesNotMatch(css(path), /border:\s*[12]px solid/);
  }
  const mascot = css("features/mascot/Rizzie.module.css");
  assert.doesNotMatch(mascot, /border:\s*1px solid (?:currentColor|var\(--color-foreground\))/);
  assert.match(mascot, /\.pet:focus-visible,\s*\.closeBubble:focus-visible/);
});
