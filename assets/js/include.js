import { initChrome } from "./chrome.js";

export async function mountIncludes() {
  const nodes = document.querySelectorAll("[data-include]");

  await Promise.all(
    [...nodes].map(async (element) => {
      const name = element.getAttribute("data-include");
      const response = await fetch(`/partials/${name}.html`);
      if (!response.ok) throw new Error(`partial ${name} ${response.status}`);
      element.outerHTML = await response.text();
    })
  );

  initChrome();
}
