import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import {
  bookingLink, navigationGroups, navigationProductCards, headerLinks,
  footerGroups, mobileSiteSections ,
  shopifyPricingHref, shopifyStartHref, pricingPlans,
} from "../src/features/site-shell/link-model.ts";

const publicRoot = new URL("../public/", import.meta.url);
const allowedHosts = new Set([
  "www.get-ryze.ai", "ryze.cal.com", "help.get-ryze.ai", "reports.get-ryze.ai"
]);
const allGroups = [...navigationGroups, ...footerGroups, ...mobileSiteSections];
const links = [...allGroups.flatMap(group => group.links), ...headerLinks, ...navigationProductCards,
  bookingLink,
  {id:"pricing",label:"Pricing",href:shopifyPricingHref},
  {id:"start",label:"Get started",href:shopifyStartHref}];

test("every navigation group has meaningful labels and unambiguous IDs within its region", () => {
  for(const group of allGroups) {
    assert.ok(group.id && group.label, "missing navigation group");
    assert.ok(group.links.length || group.id === "pricing", "empty navigation group");
    const ids=new Set();
    for(const link of group.links) {
      assert.ok(!ids.has(link.id),group.label+": duplicate link ID "+link.id);
      ids.add(link.id);
      assert.ok(link.label && link.label.trim().length>=3,link.id+": missing accessible link name");
    }
  }
});

test("all links use an approved HTTPS destination or a safe contact mailto", () => {
  for(const link of links) {
    assert.ok(typeof link.href==="string" && link.href.trim(),link.id+": missing href");
    assert.doesNotMatch(link.href,/\s|javascript:|data:|#$/i,link.id);
    const url=new URL(link.href);
    if(url.protocol==="mailto:"){
      assert.equal(link.href,"mailto:hello@get-ryze.ai");
    }else{
      assert.equal(url.protocol,"https:",link.id+" is not HTTPS");
      assert.ok(allowedHosts.has(url.hostname),link.id+": unapproved host "+url.hostname);
      assert.ok(!url.username && !url.password,link.id+": URL contains credentials");
    }
    assert.doesNotMatch(link.label,/^(click here|read more|more|link|here)$/i,link.id);
    assert.doesNotMatch(link.label,/\s{2,}|\.{2,}|\?\?/);
  }
});

test("original interface previews have precise file references and available images", () => {
  assert.deepEqual(navigationProductCards.map(x=>x.label),
    ["Paid Ads","SEO & AI Visibility","CRO","Reporting"]);
  for(const item of navigationProductCards){
    assert.equal(item.image.startsWith("/ryze-media/navigation/"),true);
    assert.equal(item.image.endsWith(".webp"),true,"navigation assets are losslessly optimized WebP");
    const file=new URL("."+item.image, publicRoot);
    assert.ok(existsSync(file),item.image+" not found");
    assert.ok(statSync(file).size<180000,item.image+" exceeds menu-image budget");
    assert.ok(item.width>0 && item.height>0);
  }
});

test("site images and videos are not broken references or unexpected placeholders", async()=>{
  const {cardMedia}=await import("../public/ryze-canvas/src/media.js");
  assert.equal(cardMedia.length,12);
  const srcSeen = new Set();
  for(const {type,src} of cardMedia){
    assert.ok(type==="image"||type==="video");
    const path=new URL("../public/ryze-canvas/"+src.replace(/^\.\//,""),import.meta.url);
    assert.ok(existsSync(path),src+" missing");
    assert.ok(statSync(path).size>1000,src+" truncated");
    assert.ok(!srcSeen.has(src),src+" duplicated");
    srcSeen.add(src);
    if(type==="image"){
      assert.ok(src.endsWith(".webp"),"Image can be optimized: "+src);
      assert.ok(statSync(path).size<425000,src+" exceeds optimized photo budget");
    }
  }
});

test("pricing cards use four sourced monthly plan amounts and safe destination links", () => {
  assert.deepEqual(pricingPlans.map(p => p.price), [89,129,599,1499]);
  assert.equal(new Set(pricingPlans.map(p => p.id)).size, pricingPlans.length);
  for(const plan of pricingPlans){
    assert.equal(plan.href, "https://www.get-ryze.ai/pricing");
    assert.ok(plan.price > 0 && plan.description);
  }
});

test("menu categories do not repeat the same entries", () => {
  assert.deepEqual(navigationGroups.map(g=>g.label), ["Products","Solutions","Resources","Pricing"]);
  const seen = new Set();
  for(const group of navigationGroups){
    for(const link of group.links){
      assert.ok(!seen.has(link.id) && !seen.has(link.label.toLowerCase()),
        "duplicate navigation entry: "+link.label);
      seen.add(link.id);seen.add(link.label.toLowerCase());
    }
  }
});

test("link and asset labels pass common typo and punctuation checks", ()=>{
  const strings=[...links.map(x=>x.label),...links.map(x=>x.description||"")];
  for(const value of strings){
    assert.doesNotMatch(value,/\b(?:shopfiy|intergrations|autopiliot|advertiz|analize|adress|teh|recieve)\b/i);
    assert.doesNotMatch(value,/\s{2,}|\.\.|,,|\?\?/);
  }
});
