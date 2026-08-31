import test from "node:test";
import assert from "node:assert/strict";
import { nextValue } from "../assets/js/counters.js";

test("nextValue eases toward target", () => {
  assert.equal(nextValue(0, 100, 0), 0);
  assert.equal(nextValue(0, 100, 1), 100);
  assert.ok(nextValue(0, 100, 0.5) > 0);
  assert.ok(nextValue(0, 100, 0.5) < 100);
});
