import { mountIncludes } from "./include.js";
import { initChrome } from "./chrome.js";
import { initCookies } from "./cookies.js";

async function boot() {
  await mountIncludes();
  initChrome();
  initCookies();
}

boot().catch((err) => {
  console.error(err);
});
