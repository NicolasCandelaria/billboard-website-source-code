import test from "node:test";
import assert from "node:assert/strict";
import { shouldLoadAnalytics } from "../assets/js/cookies.js";

test("analytics only after accept", () => {
  assert.equal(shouldLoadAnalytics(undefined), false);
  assert.equal(shouldLoadAnalytics("dismissed"), false);
  assert.equal(shouldLoadAnalytics("accepted"), true);
});
