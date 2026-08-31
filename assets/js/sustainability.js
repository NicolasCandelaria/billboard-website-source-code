const loadMore = document.querySelector("[data-sustainability-load-more]");
const extras = document.querySelectorAll(".sustainable-extra");

if (loadMore && extras.length) {
  extras.forEach((item) => {
    item.hidden = true;
  });

  loadMore.addEventListener("click", () => {
    extras.forEach((item) => {
      item.hidden = false;
    });
    loadMore.hidden = true;
  });
}
