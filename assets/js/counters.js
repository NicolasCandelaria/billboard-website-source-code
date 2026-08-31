export function nextValue(from, to, t) {
  const clamped = Math.min(1, Math.max(0, t));
  return Math.round(from + (to - from) * clamped);
}

export function animateCounter(el, to, durationMs) {
  const start = performance.now();
  const tick = (now) => {
    const t = (now - start) / durationMs;
    el.textContent = String(nextValue(0, to, t));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      io.unobserve(el);
      animateCounter(el, Number(el.getAttribute("data-count")), 1200);
    }
  });
  els.forEach((el) => io.observe(el));
}
