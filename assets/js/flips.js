export function initFlips() {
  if (!document.querySelector(".flip-card")) return;
  document.documentElement.classList.add("has-js");

  document.querySelectorAll(".flip-card").forEach((card) => {
    const front = card.querySelector(".flip-front");
    const back = card.querySelector(".flip-back");
    if (!front || !back) return;

    const setHidden = (face, hidden) => {
      if (hidden) {
        face.setAttribute("inert", "");
        face.setAttribute("aria-hidden", "true");
      } else {
        face.removeAttribute("inert");
        face.removeAttribute("aria-hidden");
      }
    };

    const setFlipped = (isFlipped, moveFocus = true) => {
      card.classList[isFlipped ? "add" : "remove"]("is-flipped");
      front.setAttribute("aria-expanded", String(isFlipped));

      if (isFlipped) {
        setHidden(back, false);
        if (moveFocus) back.querySelector("a, button")?.focus();
        setHidden(front, true);
      } else {
        setHidden(front, false);
        if (moveFocus) front.focus();
        setHidden(back, true);
      }
    };

    setFlipped(card.classList.contains("is-flipped"), false);

    front.addEventListener("click", () => setFlipped(true));

    back.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      setFlipped(false);
    });

    back.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setFlipped(false);
    });

    if (globalThis.window?.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) {
      card.addEventListener("mouseenter", () => setFlipped(true, false));
      card.addEventListener("mouseleave", () => setFlipped(false, false));
    }
  });
}
