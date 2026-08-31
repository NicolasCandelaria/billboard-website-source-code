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

test("required live titles map to their observed image files", () => {
  const expectedImages = new Map([
    ["Felix & Lucie Tote Basket", "/assets/images/felix-lucie-tote-basket-1024x1024.jpg"],
    ["Felix & Lucie Stripe Table Top Napkin Set", "/assets/images/Felix-Lucie-Stripe-Table-Top-Napkin-Set-1024x1024.jpg"],
    ["White Claw Bar", "/assets/images/Corona-Bar-1024x1024.jpg"],
    ["Budweiser Standing Cooler", "/assets/images/Pabst-Standing-Cooler-1024x1024.jpg"],
    ["Costa Crew Polo", "/assets/images/Tim-Horton-crew-Polo-1024x1024.jpg"],
    ["Grey Goose Wine Box", "/assets/images/Grey-Goose-Ice-Bucket-2.jpg"],
  ]);

  for (const [title, expectedImage] of expectedImages) {
    const project = projects.find((candidate) => candidate.title === title);
    assert.ok(project, `${title} must be present`);
    assert.equal(project.image, expectedImage, `${title} must use ${expectedImage}`);
  }
});

test("different project titles do not share an image", () => {
  const titlesByImage = new Map();
  for (const project of projects) {
    const priorTitle = titlesByImage.get(project.image);
    assert.ok(
      !priorTitle || priorTitle === project.title,
      `${priorTitle} and ${project.title} must not share ${project.image}`
    );
    titlesByImage.set(project.image, project.title);
  }
});

test("rendered links use the project url contract", () => {
  const source = fs.readFileSync(
    new URL("../assets/js/work-grid.js", import.meta.url),
    "utf8"
  );
  assert.match(source, /href="\$\{p\.url\}"/);
  assert.match(source, /src="\$\{p\.image\}"/);
});
