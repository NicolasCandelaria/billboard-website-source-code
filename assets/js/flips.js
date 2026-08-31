export function initFlips() {
  if (!document.querySelector(".flip-card")) return;
  document.documentElement.classList.add("has-js");

  document.querySelectorAll(".flip-card").forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");

    const toggle = () => {
      const isFlipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(isFlipped));
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      toggle();
    });

    card.addEventListener("keydown", (event) => {
      if (event.target.closest("a")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    });
  });
}
