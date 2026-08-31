import { mountIncludes } from "./include.js";
import { initChrome } from "./chrome.js";
import { initCookies } from "./cookies.js";
import { initWorkGrid } from "./work-grid.js";

async function boot() {
  await mountIncludes();
  initChrome();
  initCookies();
  await initWorkGrid();
}

boot().catch((err) => {
  console.error(err);
});
