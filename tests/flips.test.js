import test from "node:test";
import assert from "node:assert/strict";
import { initFlips } from "../assets/js/flips.js";

function createClassList() {
  const classes = new Set();
  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    contains: (name) => classes.has(name),
    toggle(name) {
      if (classes.has(name)) {
        classes.delete(name);
        return false;
      }
      classes.add(name);
      return true;
    },
  };
}

function createCard() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    classList: createClassList(),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: (name) => attributes.get(name),
    addEventListener: (type, listener) => listeners.set(type, listener),
    dispatch(type, event = {}) {
      listeners.get(type)?.({
        target: { closest: () => null },
        preventDefault() {},
        ...event,
      });
    },
  };
}

function withDocument(cards, run) {
  const previousDocument = globalThis.document;
  globalThis.document = {
    documentElement: { classList: createClassList() },
    querySelector: () => cards[0] ?? null,
    querySelectorAll: () => cards,
  };
  try {
    run();
  } finally {
    globalThis.document = previousDocument;
  }
}

test("initFlips makes cards keyboard-focusable and click toggles the back", () => {
  const card = createCard();
  withDocument([card], () => {
    initFlips();
    assert.equal(card.getAttribute("tabindex"), "0");
    assert.equal(card.getAttribute("role"), "button");
    assert.equal(card.getAttribute("aria-pressed"), "false");

    card.dispatch("click");
    assert.equal(card.classList.contains("is-flipped"), true);
    assert.equal(card.getAttribute("aria-pressed"), "true");
  });
});

test("Enter and Space toggle a focused flip card", () => {
  const card = createCard();
  withDocument([card], () => {
    initFlips();

    card.dispatch("keydown", { key: "Enter" });
    assert.equal(card.classList.contains("is-flipped"), true);

    let prevented = false;
    card.dispatch("keydown", {
      key: " ",
      preventDefault: () => {
        prevented = true;
      },
    });
    assert.equal(prevented, true);
    assert.equal(card.classList.contains("is-flipped"), false);
  });
});
