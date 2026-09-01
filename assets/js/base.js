export function siteBase() {
  if (typeof location === "undefined") return "";
  if (!location.hostname.endsWith("github.io")) return "";
  const first = location.pathname.split("/").filter(Boolean)[0];
  return first ? `/${first}` : "";
}

export function siteUrl(path, base = siteBase()) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  if (normalized === base || normalized.startsWith(`${base}/`)) {
    return normalized;
  }
  return `${base}${normalized}`;
}
