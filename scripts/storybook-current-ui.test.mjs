import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");

test("Storybook uses current website-first product stories, including real form outcomes", () => {
 const file=read("src/features/hero/HeroConversation.stories.tsx");
 for(const name of ["Playground","MissingWebsite","ReadyPreview"]) {
   assert.match(file, new RegExp("export const " + name + "\\b"), name);
 }
 assert.match(file,/play:\s*async/, "interactive scenarios should actually operate the component");
 assert.doesNotMatch(file,/Flim-inspired/);
});

test("Navigation previews include the real push drawer and current mobile behavior", () => {
 const file=read("src/features/site-shell/SiteHeader.stories.tsx");
 assert.match(file,/export const DrawerOpen\b/);
 assert.match(file,/export const OnPage\b/);
 assert.doesNotMatch(file,/mobile quick navigation stays visible/);
 assert.doesNotMatch(file,/same Segoe UI font as the Hero/);
});

test("Screens show site with and without real cookie consent, alongside responsive presets", () => {
 const file=read("src/features/site-shell/HeroWithNavigation.stories.tsx");
 assert.match(file,/export const WithCookieConsent\b/);
 assert.match(file,/HomeworkCookieNotice/);
 assert.match(file,/export const DuoOpen\b/);
 assert.match(file,/export const Phone\b/);
});

test("Rizzie story shows production persona without floating debug controls", () => {
 const file=read("src/features/mascot/Rizzie.stories.tsx");
 assert.match(file,/export const Static\b/);
 assert.doesNotMatch(file,/Show response/);
 assert.doesNotMatch(file,/Reset position/);
});

test("Legacy HeroAction is marked as archived, not promoted as current CTA", () => {
 const file=read("src/features/hero/HeroAction.stories.tsx");
 assert.match(file,/Legacy/);
 assert.match(file,/not used in the current Hero/i);
});
