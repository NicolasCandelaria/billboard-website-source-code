import { mountIncludes } from "./include.js";
import { initChrome } from "./chrome.js";
import { initCookies } from "./cookies.js";
import { initWorkGrid } from "./work-grid.js";
import { initSlider } from "./slider.js";
import { initFlips } from "./flips.js";
import { initCounters } from "./counters.js";

async function boot() {
  await mountIncludes();
  initChrome();
  initCookies();
  await initWorkGrid();
  initSlider();
  initFlips();
  initCounters();
}

boot().catch((err) => {
  console.error(err);
});
