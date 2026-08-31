import test from "node:test";
import assert from "node:assert/strict";
import { validateContact, shouldDropAsSpam } from "../assets/js/form.js";

const valid = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  phone: "",
  helpWith: "General Inquiries",
  message: "Hello",
};

test("rejects missing required fields", () => {
  const r = validateContact({ ...valid, firstName: "", email: "nope" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.firstName);
  assert.ok(r.errors.email);
});

test("rejects placeholder helpWith", () => {
  const r = validateContact({ ...valid, helpWith: "I need help with*" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.helpWith);
});

test("accepts a complete form", () => {
  assert.equal(validateContact(valid).ok, true);
});

test("honeypot drops bots", () => {
  assert.equal(shouldDropAsSpam("http://spam"), true);
  assert.equal(shouldDropAsSpam(""), false);
});
