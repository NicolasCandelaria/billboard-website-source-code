import { mountIncludes } from "./include.js";
import { initChrome } from "./chrome.js";

async function boot() {
  await mountIncludes();
  initChrome();
}

boot().catch((err) => {
  console.error(err);
});
