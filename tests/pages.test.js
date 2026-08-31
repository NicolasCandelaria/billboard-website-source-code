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
  "budwiser-bridge-set/index.html",
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

test("home slider bullets provide at least 44px pointer targets", () => {
  const css = readFileSync(
    join(import.meta.dirname, "..", "assets", "css", "pages.css"),
    "utf8"
  );
  const bulletRule =
    css.match(
      /#main \.hero-slider \.slider-bullets button\s*\{([^}]*)\}/
    )?.[1] ?? "";

  assert.match(bulletRule, /height\s*:\s*44px/);
  assert.match(bulletRule, /width\s*:\s*44px/);
});

test("home flip cards use front buttons and initially hide their back faces", () => {
  const html = readFileSync(
    join(import.meta.dirname, "..", "index.html"),
    "utf8"
  );

  assert.equal(html.match(/<button class="flip-front"/g)?.length, 8);
  assert.equal(
    html.match(/<div class="flip-back" inert aria-hidden="true">/g)?.length,
    8
  );
  assert.doesNotMatch(html, /<article class="flip-card"[^>]*role="button"/);
});

test("Task 11 uses recovered sustainability imagery and live client punctuation", () => {
  const root = join(import.meta.dirname, "..");
  const sustainability = readFileSync(
    join(root, "sustainability", "index.html"),
    "utf8"
  );
  const clients = readFileSync(join(root, "clients", "index.html"), "utf8");

  for (const image of [
    "Sustainability.jpg",
    "CISCO-Wooden-Cooking-Spoon-Set.jpg",
    "Tesla-Woodless-Pencil.jpg",
    "SAP-Cross-Body-Bag.jpg",
    "corona-sunglasses-1.jpg",
    "volvo-wooden-cooking-spoon-set.jpg",
    "shell-polo-t-shirt.jpg",
  ]) {
    const path = join(root, "assets", "images", image);
    assert.equal(existsSync(path), true);
    const bytes = readFileSync(path);
    assert.deepEqual([...bytes.subarray(0, 2)], [0xff, 0xd8], `${image} is JPEG`);
  }

  assert.match(sustainability, /\/assets\/images\/Sustainability\.jpg/);
  assert.match(clients, /brands’ marketing/);
});

test("sustainability gallery progressively reveals archived live items", () => {
  const root = join(import.meta.dirname, "..");
  const html = readFileSync(join(root, "sustainability", "index.html"), "utf8");

  assert.ok((html.match(/class="sustainable-item/g) ?? []).length >= 12);
  assert.equal(
    (html.match(/class="sustainable-item sustainable-extra"/g) ?? []).length,
    6
  );
  assert.doesNotMatch(
    html,
    /class="sustainable-item sustainable-extra" hidden/
  );
  assert.match(html, /data-sustainability-load-more/);
  assert.match(html, /\/assets\/js\/sustainability\.js/);
});

test("seven inner marketing pages contain no WordPress runtime strings", () => {
  const root = join(import.meta.dirname, "..");
  for (const page of [
    "about-us",
    "services",
    "sustainability",
    "clients",
    "accreditations",
    "elevate-your-brand",
    "cookie-policy",
  ]) {
    const html = readFileSync(join(root, page, "index.html"), "utf8");
    assert.doesNotMatch(html, /wp-(?:content|json)/i, page);
  }
});
