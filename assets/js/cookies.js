export const STORAGE_KEY = "bbww-cookie-consent";
export const GA_ID = "G-V2TJ281ZYS";

export function shouldLoadAnalytics(consent) {
  return consent === "accepted";
}

export function loadAnalytics() {
  if (document.getElementById("ga-gtag")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  const s = document.createElement("script");
  s.id = "ga-gtag";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
}

export function initCookies() {
  const root = document.querySelector("#cookie-banner");
  if (!root) return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (shouldLoadAnalytics(existing)) loadAnalytics();
  if (existing) {
    root.hidden = true;
    return;
  }
  root.hidden = false;
  root.querySelector("[data-cookie-accept]")?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    root.hidden = true;
    loadAnalytics();
  });
  root.querySelector("[data-cookie-dismiss]")?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    root.hidden = true;
  });
}
