import test from "node:test";
import assert from "node:assert/strict";
import { filterProjects, paginate, PAGE_SIZE } from "../assets/js/work-grid.js";

const sample = [
  { title: "A", categories: ["Apparel"] },
  { title: "B", categories: ["Barware", "Displays"] },
  { title: "C", categories: ["Apparel"] },
];

test("All returns every project", () => {
  assert.equal(filterProjects(sample, "All").length, 3);
});

test("category filter matches tags", () => {
  assert.deepEqual(
    filterProjects(sample, "Apparel").map((p) => p.title),
    ["A", "C"]
  );
});

test("paginate slices and reports hasMore", () => {
  const many = Array.from({ length: 13 }, (_, i) => ({ title: String(i), categories: ["All"] }));
  const first = paginate(many, PAGE_SIZE, 1);
  assert.equal(first.items.length, 12);
  assert.equal(first.hasMore, true);
  const second = paginate(many, PAGE_SIZE, 2);
  assert.equal(second.items.length, 1);
  assert.equal(second.hasMore, false);
});
