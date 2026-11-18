import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const source = path => readFileSync(new URL(path, root), "utf8");
function jsx(path) {
  const file = ts.createSourceFile(path, source(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const nodes = [];
  const walk = node => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) nodes.push(node);
    ts.forEachChild(node, walk);
  };
  walk(file);
  return {file,nodes};
}
const opening = node => ts.isJsxElement(node) ? node.openingElement : node;
const tagName = node => opening(node).tagName.getText();
function attribute(node, name) {
  const attr = opening(node).attributes.properties.find(p =>
    ts.isJsxAttribute(p) && p.name.text === name);
  return attr ? (attr.initializer?.getText() ?? "") : null;
}
function humanCopy(path) {
  const {file} = jsx(path);
  const values = [];
  const walk = node => {
    if (ts.isJsxText(node)) {
      const value = node.getText(file).replace(/\s+/g," ").trim();
      if (value) values.push(value);
    }
    if (ts.isJsxAttribute(node) && ["aria-label","placeholder","title","alt"].includes(node.name.text) && node.initializer && ts.isStringLiteral(node.initializer)) {
      values.push(node.initializer.text);
    }
    ts.forEachChild(node,walk);
  };
  walk(file);
  return values;
}

test("real Hero has one semantic H1 and a shared prose/flow region", () => {
  const {nodes} = jsx("src/features/hero/Hero.tsx");
  assert.equal(nodes.filter(n => tagName(n) === "Typography" && attribute(n,"as") === '"h1"').length,1);
  const region=nodes.find(n=>tagName(n)==="div" && attribute(n,"data-flow")!==null);
  assert.ok(region,"lead and description belong to one flow container");
  const descendants=[];
  ts.forEachChild(region,n=>{if(ts.isJsxElement(n))descendants.push(n.openingElement.tagName.getText())});
  assert.ok(source("src/features/hero/Hero.module.css").includes(".prose > * + *"),"flow rhythm selector");
});

test("website CTA names its actual action, does not pretend to analyze a shop", () => {
  const {nodes}=jsx("src/features/hero/HeroConversation.tsx");
  const form=nodes.find(n=>tagName(n)==="form");
  assert.ok(form);
  const input=nodes.find(n=>tagName(n)==="input" && attribute(n,"id")==='"ryze-preview-website"');
  const label=nodes.find(n=>tagName(n)==="label" && attribute(n,"htmlFor")==='"ryze-preview-website"');
  assert.ok(input && label);
  assert.ok(attribute(input,"aria-invalid")!==null);
  assert.ok(attribute(input,"aria-describedby")!==null);
  const submit=nodes.find(n=>tagName(n)==="button" && attribute(n,"type")==='"submit"');
  assert.ok(submit);
  assert.equal(attribute(submit,"aria-label"),'"Check for free"');
  assert.ok(submit.getText().includes(">Check for free</button>"));
  assert.ok(nodes.some(n=>tagName(n)==="span" && attribute(n,"role")?.includes('"alert"')));
  assert.ok(nodes.some(n=>tagName(n)==="p" && attribute(n,"data-chat-message")==='"user"'));
  assert.ok(nodes.some(n=>tagName(n)==="p" && attribute(n,"data-chat-message")==='"assistant"'));
  assert.match(source("src/features/hero/HeroConversation.tsx"),/CHAT_RHYTHM\.character/);
  assert.ok(!nodes.some(n=>tagName(n)==="Image" && n.pos >= form.pos));
});

test("header has accessible home link, pink lockup and white contact action", () => {
  const {nodes}=jsx("src/features/site-shell/SiteHeader.tsx");
  assert.ok(nodes.some(n=>tagName(n)==="a" && attribute(n,"aria-label")==='"Ryze home"'));
  assert.match(source("src/features/site-shell/SiteHeader.tsx"),/ryze-lockup-pink\.svg/);
  const css=source("src/features/site-shell/SiteHeader.module.css");
  assert.match(css,/\.header\[data-variant="dock"\] \.booking\s*\{[^}]*color:\s*#fff;/s);
  assert.match(css,/\.header\[data-variant="dock"\] \.booking\s*\{[^}]*border:\s*2px solid #fff;/s);
});

test("visible copy passes a bounded typo and punctuation lint", () => {
  const paths=[
    "src/features/hero/Hero.tsx",
    "src/features/hero/HeroConversation.tsx",
    "src/features/site-shell/SiteHeader.tsx",
    "src/features/integrations/IntegrationLogos.tsx",
  ];
  const words=paths.flatMap(humanCopy);
  assert.ok(words.length >= 15);
  for(const value of words){
    assert.doesNotMatch(value,/\b(?:Shopfiy|Shopfy|autopiliot|intergrations|analize|teh|recieve|adress|Shopifyy)\b/i);
    assert.doesNotMatch(value,/\s{2,}|\.\.|,,/);
    assert.doesNotMatch(value,/\b(?:click here|learn more here)\b/i);
  }
  assert.ok(words.some(value=>value.includes("Plugs into")) && words.some(value=>value.includes("any platform")));
});
