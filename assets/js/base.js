export function siteBase() {
  if (typeof location === "undefined") return "";
  if (!location.hostname.endsWith("github.io")) return "";
  const first = location.pathname.split("/").filter(Boolean)[0];
  return first ? `/${first}` : "";
}

export function siteUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteBase()}${normalized}`;
}
