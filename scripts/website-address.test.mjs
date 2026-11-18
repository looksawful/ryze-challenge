import test from "node:test";
import assert from "node:assert/strict";
import { normalizeWebsiteAddress } from "../src/features/hero/website-address.ts";

test("accepts shop domains without www or scheme", () => {
  assert.equal(normalizeWebsiteAddress("example.com"), "example.com");
  assert.equal(normalizeWebsiteAddress("www.example.com"), "www.example.com");
  assert.equal(normalizeWebsiteAddress("https://example.com/store"), "example.com");
  assert.equal(normalizeWebsiteAddress("shop.example.co.uk/collections"), "shop.example.co.uk");
});

test("rejects invalid and non-web addresses", () => {
  for (const value of ["", "not a website", "localhost", "bad..domain.com", "user@example.com", "ftp://example.com", "https://example.com@evil.example/path", "example"]) {
    assert.equal(normalizeWebsiteAddress(value), null, value);
  }
});
