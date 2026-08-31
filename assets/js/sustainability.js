const loadMore = document.querySelector("[data-sustainability-load-more]");

loadMore?.addEventListener("click", () => {
  document.querySelectorAll(".sustainable-extra[hidden]").forEach((item) => {
    item.hidden = false;
  });
  loadMore.hidden = true;
});
