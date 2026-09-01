import test from "node:test";
import assert from "node:assert/strict";
import { prefixRootPaths } from "../scripts/prefix-pages-base.mjs";

const base = "/billboard-website-source-code";

test("prefixes root-absolute href, css url, fetch, and json assets", () => {
  const src = [
    '<a href="/about-us/">About</a>',
    '<link href="/assets/css/reset.css">',
    "url('/assets/fonts/roboto-400.woff2')",
    'fetch("/partials/header.html")',
    'location.replace("/games/")',
    '<meta http-equiv="refresh" content="0; url=/games/">',
    '{"image":"/assets/images/logo.png"}',
    '<a href="/">Home</a>',
  ].join("\n");

  const out = prefixRootPaths(src, base);
  assert.match(out, /href="\/billboard-website-source-code\/about-us\/"/);
  assert.match(out, /href="\/billboard-website-source-code\/assets\/css\/reset\.css"/);
  assert.match(out, /url\('\/billboard-website-source-code\/assets\/fonts\/roboto-400\.woff2'\)/);
  assert.match(out, /fetch\("\/billboard-website-source-code\/partials\/header\.html"\)/);
  assert.match(out, /location\.replace\("\/billboard-website-source-code\/games\/"\)/);
  assert.match(out, /content="0; url=\/billboard-website-source-code\/games\/"/);
  assert.match(out, /"image":"\/billboard-website-source-code\/assets\/images\/logo\.png"/);
  assert.match(out, /href="\/billboard-website-source-code\/"/);
});

test("does not prefix external or already-prefixed paths", () => {
  const src = [
    '<a href="https://billboardworldwide.com/about-us/">Live</a>',
    '<a href="mailto:info@billboardworldwide.com">Email</a>',
    '<a href="/billboard-website-source-code/contact-us/">Contact</a>',
    'url(https://example.com/x.png)',
  ].join("\n");
  const out = prefixRootPaths(src, base);
  assert.equal(out, src);
});
