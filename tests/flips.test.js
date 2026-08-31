import test from "node:test";
import assert from "node:assert/strict";
import { initFlips } from "../assets/js/flips.js";

function createClassList() {
  const classes = new Set();
  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
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

function createElement() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    classList: createClassList(),
    focused: false,
    setAttribute: (name, value) => attributes.set(name, String(value)),
    removeAttribute: (name) => attributes.delete(name),
    hasAttribute: (name) => attributes.has(name),
    getAttribute: (name) => attributes.get(name),
    addEventListener: (type, listener) => listeners.set(type, listener),
    focus() {
      this.focused = true;
    },
    dispatch(type, event = {}) {
      listeners.get(type)?.({
        target: { closest: () => null },
        preventDefault() {},
        ...event,
      });
    },
  };
}

function createCard() {
  const card = createElement();
  const front = createElement();
  const back = createElement();
  const link = createElement();
  back.querySelector = () => link;
  card.querySelector = (selector) =>
    selector === ".flip-front" ? front : selector === ".flip-back" ? back : null;
  return { card, front, back, link };
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

test("initFlips uses the front control without making the card a button", () => {
  const { card, front, back, link } = createCard();
  withDocument([card], () => {
    initFlips();
    assert.equal(card.getAttribute("tabindex"), undefined);
    assert.equal(card.getAttribute("role"), undefined);
    assert.equal(front.getAttribute("aria-expanded"), "false");
    assert.equal(back.getAttribute("aria-hidden"), "true");
    assert.equal(back.hasAttribute("inert"), true);

    front.dispatch("click");
    assert.equal(card.classList.contains("is-flipped"), true);
    assert.equal(front.getAttribute("aria-expanded"), "true");
    assert.equal(front.getAttribute("aria-hidden"), "true");
    assert.equal(front.hasAttribute("inert"), true);
    assert.equal(back.getAttribute("aria-hidden"), undefined);
    assert.equal(back.hasAttribute("inert"), false);
    assert.equal(link.focused, true);
  });
});

test("clicking the revealed back face restores the front control", () => {
  const { card, front, back } = createCard();
  withDocument([card], () => {
    initFlips();
    front.dispatch("click");
    back.dispatch("click");

    assert.equal(card.classList.contains("is-flipped"), false);
    assert.equal(front.getAttribute("aria-hidden"), undefined);
    assert.equal(front.hasAttribute("inert"), false);
    assert.equal(back.getAttribute("aria-hidden"), "true");
    assert.equal(back.hasAttribute("inert"), true);
    assert.equal(front.focused, true);
  });
});
