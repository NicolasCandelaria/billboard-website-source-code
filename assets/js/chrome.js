export function initChrome() {
  const header = document.querySelector("#site-header");
  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll(".has-sub > .menu-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (window.matchMedia("(max-width: 921px)").matches) {
        event.preventDefault();
        link.parentElement.classList.toggle("is-open");
      }
    });
  });

  const onScroll = () => {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
