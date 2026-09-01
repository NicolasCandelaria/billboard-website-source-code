import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT_EXT = /\.(?:html|css|js|json)$/;

export function prefixRootPaths(text, base = "/billboard-website-source-code") {
  const b = String(base).replace(/\/$/, "");
  if (!b.startsWith("/")) return text;
  const name = b.slice(1);

  const prefixPath = (path) => {
    if (path === name || path.startsWith(`${name}/`)) {
      return `${b}${path.slice(name.length)}`;
    }
    return path ? `${b}/${path}` : `${b}/`;
  };

  let out = text;
  out = out.replace(
    /(href|src|action)=(["'])\/(?!\/)([^"']*)/g,
    (_m, attr, quote, path) => `${attr}=${quote}${prefixPath(path)}`
  );
  out = out.replace(
    /url\((['"]?)\/(?!\/)([^"')\s]*)/g,
    (_m, quote, path) => `url(${quote}${prefixPath(path)}`
  );
  out = out.replace(
    /(fetch|location\.replace)\((["'])\/(?!\/)([^"']*)/g,
    (_m, fn, quote, path) => `${fn}(${quote}${prefixPath(path)}`
  );
  out = out.replace(
    /content="0; url=\/(?!\/)([^"]*)/g,
    (_m, path) => `content="0; url=${prefixPath(path)}`
  );
  out = out.replace(
    /"(\/assets\/[^"]*)"/g,
    (_m, path) => `"${prefixPath(path.slice(1))}"`
  );
  return out;
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (TEXT_EXT.test(name)) out.push(p);
  }
  return out;
}

function main() {
  const root = process.argv[2];
  if (!root) {
    console.error("usage: node scripts/prefix-pages-base.mjs <site-dir>");
    process.exit(2);
  }
  const base = process.env.PAGES_BASE || "/billboard-website-source-code";
  for (const file of walk(root)) {
    const before = readFileSync(file, "utf8");
    const after = prefixRootPaths(before, base);
    if (after !== before) writeFileSync(file, after);
  }
}

const invoked = process.argv[1]?.replaceAll("\\", "/").endsWith("prefix-pages-base.mjs");
if (invoked) {
  main();
}
