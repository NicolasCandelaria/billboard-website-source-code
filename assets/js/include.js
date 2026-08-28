export async function mountIncludes() {
  const nodes = document.querySelectorAll("[data-include]");

  await Promise.all(
    [...nodes].map(async (element) => {
      const name = element.getAttribute("data-include");
      const response = await fetch(`/partials/${name}.html`);
      if (!response.ok) {
        if (name === "cookies") return;
        throw new Error(`partial ${name} ${response.status}`);
      }
      element.outerHTML = await response.text();
    })
  );
}
