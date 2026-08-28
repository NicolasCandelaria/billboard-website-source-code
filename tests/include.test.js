import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = join(import.meta.dirname, "..");
const includePath = join(root, "assets", "js", "include.js");
const chromePath = join(root, "assets", "js", "chrome.js");

function moduleUrl(path) {
  return `${pathToFileURL(path).href}?test=${Date.now()}-${Math.random()}`;
}

test("mountIncludes fetches and mounts header and footer partials", async () => {
  assert.equal(existsSync(includePath), true, "include.js must exist");

  const includes = ["header", "footer"].map((name) => ({
    name,
    outerHTML: "",
    getAttribute() {
      return this.name;
    },
  }));
  const requested = [];

  globalThis.document = {
    querySelectorAll(selector) {
      return selector === "[data-include]" ? includes : [];
    },
    querySelector() {
      return null;
    },
  };
  globalThis.window = {
    scrollY: 0,
    addEventListener() {},
    matchMedia() {
      return { matches: false };
    },
  };
  globalThis.fetch = async (url) => {
    requested.push(url);
    return {
      ok: true,
      async text() {
        return `<div>${url}</div>`;
      },
    };
  };

  const { mountIncludes } = await import(moduleUrl(includePath));
  await mountIncludes();

  assert.deepEqual(requested, [
    "/partials/header.html",
    "/partials/footer.html",
  ]);
  assert.equal(includes[0].outerHTML, "<div>/partials/header.html</div>");
  assert.equal(includes[1].outerHTML, "<div>/partials/footer.html</div>");
});

test("initChrome binds navigation, submenu, and sticky behavior", async () => {
  assert.equal(existsSync(chromePath), true, "chrome.js must exist");

  const listeners = {};
  const windowListeners = {};
  const classes = new Set();
  const nav = {
    classList: {
      toggle(name) {
        if (classes.has(name)) {
          classes.delete(name);
          return false;
        }
        classes.add(name);
        return true;
      },
    },
  };
  const attributes = {};
  const toggle = {
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
    setAttribute(name, value) {
      attributes[name] = value;
    },
  };
  const headerClasses = new Set();
  const header = {
    classList: {
      toggle(name, enabled) {
        enabled ? headerClasses.add(name) : headerClasses.delete(name);
      },
    },
  };
  const parentClasses = new Set();
  const subListeners = {};
  const subLink = {
    parentElement: {
      classList: {
        toggle(name) {
          parentClasses.has(name)
            ? parentClasses.delete(name)
            : parentClasses.add(name);
        },
      },
    },
    addEventListener(type, listener) {
      subListeners[type] = listener;
    },
  };

  globalThis.document = {
    querySelector(selector) {
      return {
        "#site-header": header,
        "#nav-toggle": toggle,
        "#site-nav": nav,
      }[selector];
    },
    querySelectorAll(selector) {
      return selector === ".has-sub > .menu-link" ? [subLink] : [];
    },
  };
  globalThis.window = {
    scrollY: 0,
    matchMedia() {
      return { matches: true };
    },
    addEventListener(type, listener) {
      windowListeners[type] = listener;
    },
  };

  const { initChrome } = await import(moduleUrl(chromePath));
  initChrome();

  listeners.click();
  assert.equal(classes.has("is-open"), true);
  assert.equal(attributes["aria-expanded"], "true");

  let prevented = false;
  subListeners.click({
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.equal(parentClasses.has("is-open"), true);

  window.scrollY = 9;
  windowListeners.scroll();
  assert.equal(headerClasses.has("is-stuck"), true);
});
