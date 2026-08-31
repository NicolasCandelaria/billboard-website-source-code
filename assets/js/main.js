import { mountIncludes } from "./include.js";
import { initChrome } from "./chrome.js";
import { initCookies } from "./cookies.js";
import { initWorkGrid } from "./work-grid.js";
import { initSlider } from "./slider.js";
import { initFlips } from "./flips.js";
import { initCounters } from "./counters.js";
import { initForm } from "./form.js";

async function boot() {
  try {
    await mountIncludes();
  } catch (err) {
    console.error(err);
  }
  try {
    initChrome();
  } catch (err) {
    console.error(err);
  }
  try {
    initCookies();
  } catch (err) {
    console.error(err);
  }
  try {
    await initWorkGrid();
  } catch (err) {
    console.error(err);
  }
  try {
    initSlider();
  } catch (err) {
    console.error(err);
  }
  try {
    initFlips();
  } catch (err) {
    console.error(err);
  }
  try {
    initCounters();
  } catch (err) {
    console.error(err);
  }
  try {
    initForm();
  } catch (err) {
    console.error(err);
  }
}

boot().catch((err) => {
  console.error(err);
});
