import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function sourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".superpowers") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...sourceFiles(p));
    else if (/\.(?:html|css|js)$/.test(name)) out.push(p);
  }
  return out;
}

test("HTML, CSS, and JS do not reference WordPress paths", () => {
  const root = join(import.meta.dirname, "..");
  const forbiddenPaths = [
    `/${["wp", "content"].join("-")}/`,
    `/${["wp", "json"].join("-")}/`,
  ];
  for (const file of sourceFiles(root)) {
    const source = readFileSync(file, "utf8");
    for (const forbiddenPath of forbiddenPaths) {
      assert.equal(source.includes(forbiddenPath), false, `${file}: ${forbiddenPath}`);
    }
  }
});
