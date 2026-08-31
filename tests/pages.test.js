import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const REQUIRED_PAGES = [
  "index.html",
  "404.html",
  "about-us/index.html",
  "services/index.html",
  "our-work/index.html",
  "contact-us/index.html",
  "sustainability/index.html",
  "clients/index.html",
  "accreditations/index.html",
  "elevate-your-brand/index.html",
  "cookie-policy/index.html",
  "games/index.html",
  "packaging/index.html",
  "barware/index.html",
  "apparel/index.html",
  "promotional-items/index.html",
  "displays/index.html",
  "case-studies/index.html",
  "st-german-maison-display/index.html",
  "titos-displays/index.html",
  "grey-goose-enamel-pins/index.html",
  "ungava-bottle-puffer-jacket/index.html",
  "grey-goose-lawn-chair/index.html",
  "greygoose-bottle-bag/index.html",
  "cisco-silicon-bottle/index.html",
  "corona-fire-table/index.html",
  "corona-cabinet/index.html",
];

test("required public pages exist", () => {
  const root = join(import.meta.dirname, "..");
  for (const rel of REQUIRED_PAGES) {
    assert.equal(existsSync(join(root, rel)), true, `missing ${rel}`);
  }
});

test("mobile home slider keeps arrow controls visible and clickable", () => {
  const css = readFileSync(
    join(import.meta.dirname, "..", "assets", "css", "pages.css"),
    "utf8"
  );
  const mobileRules = css.match(/@media \(max-width: 640px\) \{[\s\S]*\}\s*$/)?.[0] ?? "";
  const arrowRule =
    mobileRules.match(
      /#main \.hero-slider \.slider-prev,\s*#main \.hero-slider \.slider-next\s*\{([^}]*)\}/
    )?.[1] ?? "";

  assert.doesNotMatch(arrowRule, /display\s*:\s*none/);
  assert.doesNotMatch(arrowRule, /visibility\s*:\s*hidden/);
  assert.doesNotMatch(arrowRule, /(?:width|height)\s*:\s*0(?:\D|$)/);
});
