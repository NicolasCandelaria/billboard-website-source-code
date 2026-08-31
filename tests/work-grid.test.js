import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { filterProjects, paginate, PAGE_SIZE } from "../assets/js/work-grid.js";

const projects = JSON.parse(
  fs.readFileSync(new URL("../assets/data/projects.json", import.meta.url), "utf8")
);

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

test("project destinations are their local lightbox images", () => {
  assert.ok(projects.length > 0);
  for (const project of projects) {
    assert.match(project.image, /^\/assets\/images\/[^/]+$/);
    assert.equal(project.url, project.image);
    assert.doesNotMatch(project.url, /^\/(?!assets\/images\/)[^?#]+\/$/);
  }
});

test("known mismatched title and image pairs are absent", () => {
  const forbiddenPairs = [
    ["White Claw Bar", "Corona-Bar"],
    ["Budweiser Standing Cooler", "Pabst-Standing-Cooler"],
    ["Costa Crew Polo", "Tim-Horton"],
    ["Grey Goose Wine Box", "Grey-Goose-Ice-Bucket"],
  ];

  for (const [title, imageFragment] of forbiddenPairs) {
    assert.equal(
      projects.some(
        (project) =>
          project.title === title && project.image.includes(imageFragment)
      ),
      false,
      `${title} must not use ${imageFragment}`
    );
  }
});
