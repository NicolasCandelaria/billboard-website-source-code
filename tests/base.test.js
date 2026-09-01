import test from "node:test";
import assert from "node:assert/strict";
import { siteUrl } from "../assets/js/base.js";
import { prefixRootPaths } from "../scripts/prefix-pages-base.mjs";

const pagesBase = "/billboard-website-source-code";

test("siteUrl prefixes GitHub Pages paths once", () => {
  assert.equal(
    siteUrl("/assets/data/projects.json", pagesBase),
    `${pagesBase}/assets/data/projects.json`
  );
  assert.equal(
    siteUrl(`${pagesBase}/assets/data/projects.json`, pagesBase),
    `${pagesBase}/assets/data/projects.json`
  );
});

test("siteUrl still works for local preview without a Pages base", () => {
  assert.equal(siteUrl("/assets/data/projects.json", ""), "/assets/data/projects.json");
});

test("prefixed siteUrl asset arguments do not double on GitHub Pages", () => {
  const source = 'fetch(siteUrl("/assets/data/projects.json"))';
  const deployed = prefixRootPaths(source, pagesBase);
  const match = deployed.match(/siteUrl\("([^"]+)"\)/);
  assert.ok(match);
  assert.equal(siteUrl(match[1], pagesBase), `${pagesBase}/assets/data/projects.json`);
});
