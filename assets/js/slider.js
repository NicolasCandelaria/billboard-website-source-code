export function initSlider(root = document.querySelector(".hero-slider")) {
  if (!root) return;
  const slides = [...root.querySelectorAll(".slide")];
  if (!slides.length) return;

  let i = 0;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === i);
    });
    root.querySelectorAll("[data-slide-to]").forEach((bullet, index) => {
      bullet.classList.toggle("is-active", index === i);
    });
  };

  root.querySelector(".slider-prev")?.addEventListener("click", () => show(i - 1));
  root.querySelector(".slider-next")?.addEventListener("click", () => show(i + 1));
  root.querySelectorAll("[data-slide-to]").forEach((bullet) => {
    bullet.addEventListener("click", () => {
      show(Number(bullet.getAttribute("data-slide-to")));
    });
  });

  show(0);
  setInterval(() => show(i + 1), 5000);
}
