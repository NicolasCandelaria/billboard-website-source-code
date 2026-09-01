import { siteUrl } from "./base.js";

export const PAGE_SIZE = 12;

export function filterProjects(projects, category) {
  if (!category || category === "All") return projects;
  return projects.filter((p) => p.categories.includes(category));
}

export function paginate(projects, pageSize, page) {
  const end = page * pageSize;
  return {
    items: projects.slice(0, end),
    hasMore: end < projects.length,
  };
}

export async function initWorkGrid() {
  const root = document.querySelector("#work-grid");
  if (!root) return;
  const res = await fetch(siteUrl("/assets/data/projects.json"));
  if (!res.ok) return;
  const projects = await res.json();
  const buttons = document.querySelectorAll("[data-filter]");
  const loadMore = document.querySelector("[data-load-more]");
  let category = "All";
  let page = 1;

  const render = () => {
    const filtered = filterProjects(projects, category);
    const { items, hasMore } = paginate(filtered, PAGE_SIZE, page);
    root.innerHTML = items
      .map(
        (p) =>
          `<a class="work-card" href="${p.url}"><img src="${p.image}" alt=""><span>${p.title}</span></a>`
      )
      .join("");
    if (loadMore) loadMore.hidden = !hasMore;
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      category = btn.getAttribute("data-filter");
      page = 1;
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      render();
    });
  });
  loadMore?.addEventListener("click", () => {
    page += 1;
    render();
  });
  render();
}
