import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".superpowers") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

test("HTML does not reference WordPress paths", () => {
  const root = join(import.meta.dirname, "..");
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, "utf8");
    assert.equal(html.includes("/wp-content/"), false, file);
    assert.equal(html.includes("/wp-json/"), false, file);
  }
});
