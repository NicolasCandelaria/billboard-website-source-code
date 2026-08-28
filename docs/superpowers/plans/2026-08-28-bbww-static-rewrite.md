# Billboard Worldwide Static Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild billboardworldwide.com as a static HTML/CSS/JS site that matches the live WordPress site in URLs, copy, images, fonts, and motion, with a working contact form and local preview only.

**Architecture:** One folder per public URL (`about-us/index.html` → `/about-us/`). Shared header/footer/cookie banner live in `partials/` and are injected by `assets/js/include.js`. Interactive behavior is small ES modules booted from `assets/js/main.js`. Work items come from `assets/data/projects.json`. The contact form POSTs to Web3Forms. Nothing talks to WordPress.

**Tech Stack:** HTML, CSS, vanilla JS (ES modules), Node `node:test` for unit tests, `npx serve` for local preview, Web3Forms for mail, Google tag `G-V2TJ281ZYS` after cookie consent.

## Global Constraints

- No WordPress, PHP, database, Elementor, Smart Slider plugin, Jetpack, or React.
- URLs keep trailing slashes via `name/index.html`.
- After rebuild, pages must not request `/wp-content/` or `/wp-json/`.
- Fonts: self-hosted Montserrat, Playfair Display, Roboto.
- Contact email: `info@billboardworldwide.com` via Web3Forms.
- Analytics ID: `G-V2TJ281ZYS`, loaded only after cookie consent.
- Preview only through a local static server, never `file://`.
- Copy, images, and motion come from the live site; do not paraphrase marketing copy.
- Skip leftover URLs: `/old-barware/`, `/lvd/`, `/1-2/`, `/msle/`, `/try/`, `/wordpress-resources-at-siteground/`.
- Source of visual truth: https://billboardworldwide.com/ and the spec at `docs/superpowers/specs/2026-08-28-bbww-static-rewrite-design.md`.
- This folder may not be a git repo yet; Task 1 initializes it. Do not `git push`. Do not change DNS or deploy.

---

## File map

| Path | Responsibility |
| --- | --- |
| `package.json` | `test` and `preview` scripts |
| `tests/form.test.js` | Form validation and honeypot |
| `tests/work-grid.test.js` | Filter + Load More |
| `tests/cookies.test.js` | Consent gating |
| `tests/pages.test.js` | Required public files exist |
| `assets/css/reset.css` | Minimal reset |
| `assets/css/tokens.css` | Colors, type, breakpoints |
| `assets/css/chrome.css` | Header, footer, cookie bar, 404 |
| `assets/css/components.css` | Slider, flips, counters, work grid, form, logos |
| `assets/css/pages.css` | Page-specific layout |
| `assets/js/config.js` | Web3Forms key placeholder |
| `assets/js/include.js` | Fetch and inject partials |
| `assets/js/chrome.js` | Sticky header, mobile menu, dropdowns |
| `assets/js/slider.js` | Hero slider |
| `assets/js/flips.js` | Service flip cards |
| `assets/js/counters.js` | Scroll counters |
| `assets/js/work-grid.js` | Filter + Load More |
| `assets/js/form.js` | Contact form |
| `assets/js/cookies.js` | Banner + analytics |
| `assets/js/main.js` | Boot |
| `partials/header.html` | Logo + nav |
| `partials/footer.html` | CTA, addresses, columns |
| `partials/cookies.html` | Cookie banner |
| `assets/data/projects.json` | Work items |
| `assets/fonts/` | woff2 files |
| `assets/images/` | All site images |
| `scripts/download-assets.mjs` | Copy images/fonts from the live site |
| `index.html` and one folder per spec URL | Pages |
| `404.html` | Custom 404 |

Root-absolute asset URLs (`/assets/...`) are required so header/footer work on every page.

---

### Task 1: Repo, scripts, and page-file test

**Files:**
- Create: `package.json`
- Create: `tests/pages.test.js`
- Create: `.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` runs `node --test tests/*.test.js`; `npm run preview` serves `.` on port 4173; required public paths listed in `REQUIRED_PAGES` inside `tests/pages.test.js`

- [ ] **Step 1: Write the failing page-file test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const REQUIRED_PAGES = [
  "index.html",
  "404.html",
  "about-us/index.html",
  "services/index.html",
  "our-work/index.html",
  "contact-us/index.html",
  "sustainability/index.html",
  "clients/index.html",
  "accreditations/index.html",
  "elevate-your-brand/index.html",
  "cookie-policy/index.html",
  "games/index.html",
  "packaging/index.html",
  "barware/index.html",
  "apparel/index.html",
  "promotional-items/index.html",
  "displays/index.html",
  "case-studies/index.html",
  "st-german-maison-display/index.html",
  "titos-displays/index.html",
  "grey-goose-enamel-pins/index.html",
  "ungava-bottle-puffer-jacket/index.html",
  "grey-goose-lawn-chair/index.html",
  "greygoose-bottle-bag/index.html",
  "cisco-silicon-bottle/index.html",
  "corona-fire-table/index.html",
  "corona-cabinet/index.html",
];

test("required public pages exist", () => {
  const root = join(import.meta.dirname, "..");
  for (const rel of REQUIRED_PAGES) {
    assert.equal(existsSync(join(root, rel)), true, `missing ${rel}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/pages.test.js`

Expected: FAIL with `missing index.html` (or `Cannot find module` if the file is not saved yet — save the test first, then rerun; fail on missing pages).

- [ ] **Step 3: Write package.json, gitignore, and git init**

```json
{
  "name": "billboard-worldwide",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.js",
    "preview": "npx --yes serve -p 4173 ."
  }
}
```

```
node_modules/
.DS_Store
assets/js/config.local.js
```

Do not create the HTML pages in this task. Leave the page test failing until Task 4 adds stubs. That is intentional: Task 4 is the task that makes this test pass.

If `.git` does not exist:

```bash
git init
```

- [ ] **Step 4: Commit scaffolding**

```bash
git add package.json .gitignore tests/pages.test.js
git commit -m "chore: add static site test harness and preview script"
```

---

### Task 2: Design tokens and reset

**Files:**
- Create: `assets/css/reset.css`
- Create: `assets/css/tokens.css`

**Interfaces:**
- Consumes: nothing
- Produces: CSS variables `--color-ink`, `--color-paper`, `--color-gold`, `--font-sans`, `--font-serif`, `--font-slider`, `--header-h`, `--max`, `--bp-nav`

- [ ] **Step 1: Write reset.css**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
}
body {
  margin: 0;
}
img,
svg {
  max-width: 100%;
  height: auto;
  display: block;
}
button,
input,
select,
textarea {
  font: inherit;
}
a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 2: Write tokens.css using the live site’s type and gold**

Live values: gold `#c5ae87`, body/nav `#000000` on `#ffffff`, nav 17px Montserrat, display headings Playfair Display, slider body Roboto.

```css
:root {
  --color-ink: #000000;
  --color-paper: #ffffff;
  --color-gold: #c5ae87;
  --color-gold-border: #c5ae8780;
  --color-footer: #111111;
  --font-sans: "Montserrat", system-ui, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-slider: "Roboto", "Montserrat", sans-serif;
  --header-h: 90px;
  --max: 1200px;
  --max-wide: 1600px;
  --bp-nav: 921px;
}
body {
  color: var(--color-ink);
  background: var(--color-paper);
  font-family: var(--font-sans);
  line-height: 1.6;
}
h1,
h2,
h3,
.display {
  font-family: var(--font-serif);
  font-weight: 400;
  line-height: 1.2;
}
```

- [ ] **Step 3: Commit**

```bash
git add assets/css/reset.css assets/css/tokens.css
git commit -m "feat: add CSS reset and live-site design tokens"
```

---

### Task 3: Header, footer, include, and chrome JS

**Files:**
- Create: `partials/header.html`
- Create: `partials/footer.html`
- Create: `assets/js/include.js`
- Create: `assets/js/chrome.js`
- Create: `assets/css/chrome.css`
- Create: `tests/include.test.js` (optional smoke: export `resolvePartial` — skip if unused)
- Create: placeholder `assets/images/logo.png` and `assets/images/logo-white.png` by downloading:

```
https://billboardworldwide.com/wp-content/uploads/2022/01/billboard-agency-international-logo-b.png
https://billboardworldwide.com/wp-content/uploads/2022/01/Billboard-Logo-White-1.png
```

**Interfaces:**
- Consumes: tokens from Task 2
- Produces: `mountIncludes()` in `include.js` fetches `/partials/header.html` into `[data-include="header"]` and `/partials/footer.html` into `[data-include="footer"]`, then calls `initChrome()`. `initChrome()` binds mobile toggle `#nav-toggle`, dropdowns `.has-sub`, and sticky class `is-stuck` on `#site-header` after 8px scroll.

- [ ] **Step 1: Download logos**

```bash
mkdir -p assets/images
curl.exe -L "https://billboardworldwide.com/wp-content/uploads/2022/01/billboard-agency-international-logo-b.png" -o assets/images/logo.png
curl.exe -L "https://billboardworldwide.com/wp-content/uploads/2022/01/Billboard-Logo-White-1.png" -o assets/images/logo-white.png
```

On macOS/Linux use `curl -L` without `.exe`. Confirm both files are non-empty.

- [ ] **Step 2: Write include.js**

```js
export async function mountIncludes() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all(
    [...nodes].map(async (el) => {
      const name = el.getAttribute("data-include");
      const res = await fetch(`/partials/${name}.html`);
      if (!res.ok) throw new Error(`partial ${name} ${res.status}`);
      el.outerHTML = await res.text();
    })
  );
}
```

- [ ] **Step 3: Write chrome.js**

```js
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
    link.addEventListener("click", (e) => {
      if (window.matchMedia("(max-width: 921px)").matches) {
        e.preventDefault();
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
```

- [ ] **Step 4: Write header and footer partials**

`partials/header.html` must contain this nav tree (live primary menu). Use `/` links, not `https://billboardworldwide.com`.

```html
<header id="site-header" class="site-header">
  <div class="site-header-inner">
    <a class="site-logo" href="/"><img src="/assets/images/logo.png" width="150" height="35" alt="Billboard Agency International"></a>
    <button id="nav-toggle" class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="Primary">
      <ul class="menu">
        <li class="has-sub">
          <a class="menu-link" href="/about-us/">About Us</a>
          <ul class="sub-menu">
            <li><a href="/about-us/">About Us</a></li>
            <li><a href="/about-us/#leadership">Leadership</a></li>
            <li><a href="/accreditations/">Accreditations</a></li>
            <li><a href="/clients/">Clients</a></li>
          </ul>
        </li>
        <li class="has-sub">
          <a class="menu-link" href="/services/">Services</a>
          <ul class="sub-menu">
            <li><a href="/services/#creative">Creative Concepts</a></li>
            <li><a href="/services/#prototype">Prototype</a></li>
            <li><a href="/services/#production">Production</a></li>
            <li><a href="/services/#fulfillment">Fulfillment</a></li>
          </ul>
        </li>
        <li><a class="menu-link" href="/our-work/">Our Work</a></li>
        <li><a class="menu-link" href="/sustainability/">Sustainability</a></li>
        <li><a class="menu-link menu-cta" href="/contact-us/">Contact Us</a></li>
      </ul>
    </nav>
  </div>
</header>
```

If the live dropdown items differ when you inspect https://billboardworldwide.com/, replace the submenu lists with the live labels and hrefs. Do not invent extra items.

`partials/footer.html` must include, transcribed from the live footer:

- Heading: “Need a Solution for Your Brand? Get in touch” and button “Lets Make it Happen” → `/contact-us/`
- Canada: `17828 65a Ave, Suite 223 and 122, Surrey, BC V3S 1Z3, Canada`
- Pakistan: `13/2 23rd Street Khayaban-e-Tauheed, DHA phase 5 Karachi, Pakistan`
- White logo `/assets/images/logo-white.png`
- `mailto:info@billboardworldwide.com`
- Link to `/cookie-policy/`
- Remaining live footer columns (About/Services/Work links) copied from the live `#colophon` block, not paraphrased

Use `<footer id="site-footer">`. Background is dark (`var(--color-footer)`), gold labels `var(--color-gold)`, white body text.

- [ ] **Step 5: Write chrome.css**

Style `#site-header` as a white bar, logo left, nav right, 17px Montserrat, underline-on-hover, dropdown 240px white panel, sticky `is-stuck` with bottom border. Below `--bp-nav`, hide `.menu` until `.is-open`. Footer: two-row layout matching live (CTA + addresses, then link columns). Match spacing by comparing `npm run preview` against the live header/footer, not by inventing a new layout.

- [ ] **Step 6: Commit**

```bash
git add partials/header.html partials/footer.html assets/js/include.js assets/js/chrome.js assets/css/chrome.css assets/images/logo.png assets/images/logo-white.png
git commit -m "feat: add shared header, footer, and chrome behavior"
```

---

### Task 4: Page stubs, 404, main.js, and passing page test

**Files:**
- Create: `assets/js/main.js`
- Create: `404.html`
- Create: every path in `REQUIRED_PAGES` as a stub that uses the shell below
- Test: `tests/pages.test.js` (from Task 1)

**Interfaces:**
- Consumes: `mountIncludes` from `include.js`, `initChrome` from `chrome.js`
- Produces: `main.js` default boot: `await mountIncludes(); initChrome();` plus later inits added in following tasks. Every page includes:

```html
<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PAGE TITLE – Full Service Marketing Agency</title>
  <link rel="icon" href="/assets/images/favicon-32.png">
  <link rel="stylesheet" href="/assets/css/reset.css">
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/chrome.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <link rel="stylesheet" href="/assets/css/pages.css">
</head>
<body>
  <div data-include="header"></div>
  <main id="main">STUB</main>
  <div data-include="footer"></div>
  <div data-include="cookies"></div>
  <script type="module" src="/assets/js/main.js"></script>
</body>
</html>
```

Page titles must match the live `<title>` for that URL. Favicon: download `https://billboardworldwide.com/wp-content/uploads/2022/06/cropped-BAI-Logo-32-X-32-32x32.png` to `assets/images/favicon-32.png`.

- [ ] **Step 1: Write main.js**

```js
import { mountIncludes } from "./include.js";
import { initChrome } from "./chrome.js";

async function boot() {
  await mountIncludes();
  initChrome();
}

boot().catch((err) => {
  console.error(err);
});
```

Until Task 7, `data-include="cookies"` will 404. In `mountIncludes`, skip missing partials instead of throwing:

```js
if (!res.ok) {
  if (name === "cookies") return;
  throw new Error(`partial ${name} ${res.status}`);
}
```

- [ ] **Step 2: Create all REQUIRED_PAGES stubs and 404.html**

`404.html` uses the same shell. Main copy: heading “Page not found” and a link home. Style it in `chrome.css` so it looks like the rest of the site, not a browser default.

Empty `assets/css/components.css` and `assets/css/pages.css` may be created here so links 200.

- [ ] **Step 3: Run tests**

Run: `npm test`

Expected: PASS for `required public pages exist`.

- [ ] **Step 4: Preview chrome**

Run: `npm run preview`

Open http://localhost:4173/ and http://localhost:4173/about-us/ . Header and footer must appear on both. If they do not, `include.js` fetch failed (wrong path or server not running).

- [ ] **Step 5: Commit**

```bash
git add assets/js/main.js assets/css/components.css assets/css/pages.css 404.html index.html about-us services our-work contact-us sustainability clients accreditations elevate-your-brand cookie-policy games packaging barware apparel promotional-items displays case-studies st-german-maison-display titos-displays grey-goose-enamel-pins ungava-bottle-puffer-jacket grey-goose-lawn-chair greygoose-bottle-bag cisco-silicon-bottle corona-fire-table corona-cabinet assets/images/favicon-32.png
git commit -m "feat: add URL-matching page stubs and 404"
```

---

### Task 5: Self-host fonts

**Files:**
- Create: `assets/fonts/*.woff2`
- Create: `assets/css/fonts.css`
- Modify: page `<head>` to include `/assets/css/fonts.css` (add the link in `main` shell by updating every stub, or inject from a comment in tokens — prefer adding the `<link>` to all pages created in Task 4)

**Interfaces:**
- Consumes: Google families used live: Montserrat 400, Playfair Display 400, Roboto 300 and 400
- Produces: `@font-face` rules pointing at local woff2 only (no `fonts.googleapis.com` at runtime)

- [ ] **Step 1: Download woff2 files**

Use the Google CSS API and save files locally:

```bash
mkdir -p assets/fonts
curl.exe -L -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Montserrat:wght@400&family=Playfair+Display:wght@400&family=Roboto:wght@300;400&display=swap" -o assets/fonts/google.css
```

Open `assets/fonts/google.css`, download each `https://fonts.gstatic.com/...woff2` URL into `assets/fonts/` with stable names:

- `montserrat-400.woff2`
- `playfair-display-400.woff2`
- `roboto-300.woff2`
- `roboto-400.woff2`

Delete `assets/fonts/google.css` after extracting URLs so the site does not ship Google CSS.

- [ ] **Step 2: Write fonts.css**

```css
@font-face {
  font-family: "Montserrat";
  src: url("/assets/fonts/montserrat-400.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Playfair Display";
  src: url("/assets/fonts/playfair-display-400.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Roboto";
  src: url("/assets/fonts/roboto-300.woff2") format("woff2");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Roboto";
  src: url("/assets/fonts/roboto-400.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 3: Add the stylesheet link to every HTML page head** (including 404 and partials do not need it; pages do)

- [ ] **Step 4: Confirm no Google Fonts network request**

Open preview, DevTools Network: no `fonts.googleapis.com` or `fonts.gstatic.com`.

- [ ] **Step 5: Commit**

```bash
git add assets/fonts assets/css/fonts.css *.html **/*.html
git commit -m "feat: self-host Montserrat, Playfair Display, and Roboto"
```

---

### Task 6: Asset downloader and images

**Files:**
- Create: `scripts/download-assets.mjs`
- Create: `assets/images/**` (downloaded)

**Interfaces:**
- Consumes: live site HTML
- Produces: local files under `assets/images/` named from the original basename; a printed mapping of remote URL → local path for use in HTML

- [ ] **Step 1: Write download-assets.mjs**

```js
import { writeFile, mkdir } from "node:fs/promises";
import { basename } from "node:path";

const PAGES = [
  "https://billboardworldwide.com/",
  "https://billboardworldwide.com/about-us/",
  "https://billboardworldwide.com/services/",
  "https://billboardworldwide.com/our-work/",
  "https://billboardworldwide.com/contact-us/",
  "https://billboardworldwide.com/sustainability/",
  "https://billboardworldwide.com/clients/",
  "https://billboardworldwide.com/accreditations/",
  "https://billboardworldwide.com/elevate-your-brand/",
  "https://billboardworldwide.com/cookie-policy/",
  "https://billboardworldwide.com/games/",
  "https://billboardworldwide.com/packaging/",
  "https://billboardworldwide.com/barware/",
  "https://billboardworldwide.com/apparel/",
  "https://billboardworldwide.com/promotional-items/",
  "https://billboardworldwide.com/displays/",
  "https://billboardworldwide.com/case-studies/",
  "https://billboardworldwide.com/grey-goose-lawn-chair/",
  "https://billboardworldwide.com/corona-fire-table/",
  "https://billboardworldwide.com/corona-cabinet/",
  "https://billboardworldwide.com/cisco-silicon-bottle/",
  "https://billboardworldwide.com/greygoose-bottle-bag/",
  "https://billboardworldwide.com/ungava-bottle-puffer-jacket/",
  "https://billboardworldwide.com/grey-goose-enamel-pins/",
  "https://billboardworldwide.com/titos-displays/",
  "https://billboardworldwide.com/st-german-maison-display/",
];

const imgRe = /https:\/\/billboardworldwide\.com\/wp-content\/uploads\/[^"'\\\s)]+/g;

const urls = new Set();
for (const page of PAGES) {
  const html = await (await fetch(page)).text();
  for (const m of html.matchAll(imgRe)) urls.add(m[0].split("?")[0]);
}

await mkdir("assets/images", { recursive: true });
for (const url of urls) {
  const name = basename(decodeURIComponent(url));
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  await writeFile(`assets/images/${name}`, buf);
  console.log(url, "->", `/assets/images/${name}`);
}
```

Also add the remaining spec case-study URLs to `PAGES` if they were omitted. If a URL 404s, skip it and keep going.

- [ ] **Step 2: Run the downloader**

Run: `node scripts/download-assets.mjs`

Expected: many files in `assets/images/`, including service icons (`creative-concepts.png`, `sketches.png`, `3d-renderings.png`, `design.png`, `manufacturing.png`, `shipping-icon.png`, `warehousing.png`, `delivery.png`) and brand logos (Grey Goose, Corona, Delta, Mercedes, etc.).

- [ ] **Step 3: Commit images and script**

Do not commit if a download is a WordPress PHP error page. Spot-check one PNG opens.

```bash
git add scripts/download-assets.mjs assets/images
git commit -m "feat: vendor live-site images locally"
```

---

### Task 7: Cookie banner and analytics gating

**Files:**
- Create: `partials/cookies.html`
- Create: `assets/js/cookies.js`
- Create: `tests/cookies.test.js`
- Modify: `assets/js/main.js` to call `initCookies()`
- Modify: `assets/css/chrome.css` for the banner

**Interfaces:**
- Consumes: live WPConsent copy from https://billboardworldwide.com/ (banner text “This website uses cookies” and buttons)
- Produces: `STORAGE_KEY = "bbww-cookie-consent"` values `"accepted"` | `"dismissed"`. `shouldLoadAnalytics(consent)` returns true only for `"accepted"`. `loadAnalytics()` injects `https://www.googletagmanager.com/gtag/js?id=G-V2TJ281ZYS` and `gtag('config', 'G-V2TJ281ZYS')` once.

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { shouldLoadAnalytics } from "../assets/js/cookies.js";

test("analytics only after accept", () => {
  assert.equal(shouldLoadAnalytics(undefined), false);
  assert.equal(shouldLoadAnalytics("dismissed"), false);
  assert.equal(shouldLoadAnalytics("accepted"), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/cookies.test.js`

Expected: FAIL (`Cannot find module` or `shouldLoadAnalytics is not a function`).

- [ ] **Step 3: Implement cookies.js**

```js
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
```

- [ ] **Step 4: Write partials/cookies.html matching live banner copy**

Inspect the live banner and copy its visible text and button labels exactly. Structure:

```html
<div id="cookie-banner" class="cookie-banner" hidden>
  <p><!-- live copy --></p>
  <a href="/cookie-policy/">Cookie Policy</a>
  <button type="button" data-cookie-accept><!-- live accept label --></button>
  <button type="button" data-cookie-dismiss><!-- live dismiss/close label --></button>
</div>
```

- [ ] **Step 5: Wire main.js**

```js
import { mountIncludes } from "./include.js";
import { initChrome } from "./chrome.js";
import { initCookies } from "./cookies.js";

async function boot() {
  await mountIncludes();
  initChrome();
  initCookies();
}

boot().catch((err) => {
  console.error(err);
});
```

Remove the cookies special-case skip in `include.js` now that the partial exists.

- [ ] **Step 6: Run tests**

Run: `npm test`

Expected: PASS including `analytics only after accept`.

- [ ] **Step 7: Commit**

```bash
git add assets/js/cookies.js assets/js/main.js assets/js/include.js partials/cookies.html tests/cookies.test.js assets/css/chrome.css
git commit -m "feat: add cookie banner and consent-gated analytics"
```

---

### Task 8: Work grid data and filter/Load More

**Files:**
- Create: `assets/data/projects.json`
- Create: `assets/js/work-grid.js`
- Create: `tests/work-grid.test.js`
- Modify: `assets/css/components.css`
- Modify: `assets/js/main.js` to call `initWorkGrid()` when `#work-grid` exists

**Interfaces:**
- Consumes: live Our Work filters and cards from https://billboardworldwide.com/our-work/ (click Load More until no more)
- Produces: `filterProjects(projects, category)` where `category === "All"` returns all, else items whose `categories` array includes that string. `paginate(projects, pageSize, page)` returns `{ items, hasMore }` with `page` 1-based. `PAGE_SIZE = 12`. Each project: `{ "title": string, "image": "/assets/images/...", "url": "/slug/", "categories": string[] }`.

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { filterProjects, paginate, PAGE_SIZE } from "../assets/js/work-grid.js";

const sample = [
  { title: "A", categories: ["Apparel"] },
  { title: "B", categories: ["Barware", "Displays"] },
  { title: "C", categories: ["Apparel"] },
];

test("All returns every project", () => {
  assert.equal(filterProjects(sample, "All").length, 3);
});

test("category filter matches tags", () => {
  assert.deepEqual(
    filterProjects(sample, "Apparel").map((p) => p.title),
    ["A", "C"]
  );
});

test("paginate slices and reports hasMore", () => {
  const many = Array.from({ length: 13 }, (_, i) => ({ title: String(i), categories: ["All"] }));
  const first = paginate(many, PAGE_SIZE, 1);
  assert.equal(first.items.length, 12);
  assert.equal(first.hasMore, true);
  const second = paginate(many, PAGE_SIZE, 2);
  assert.equal(second.items.length, 1);
  assert.equal(second.hasMore, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/work-grid.test.js`

Expected: FAIL module not found.

- [ ] **Step 3: Implement work-grid.js**

```js
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
  const res = await fetch("/assets/data/projects.json");
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
```

- [ ] **Step 4: Build projects.json from the live Our Work grid**

Open https://billboardworldwide.com/our-work/, record every card after Load More, including title, destination URL, visible category tags, and image file (match a file from Task 6). Known first-page titles that must appear:

- Mercedes Benz Polo Set
- Topo Chico Crossbody Bag
- Kraken Sherpa Jacket
- Kraken x Modelo Sweater
- 2026 Olympics Shell Jacket
- Topo Chico Sunglasses
- Urban Air LED topper
- Casamigos Gardening Tools
- Delta Airlines Polo Uniform
- Assorted Drink Buckets
- Volvo Dream Set
- Starry Inflatable Cooler

Filter labels that must exist as `data-filter` values: All, Accessories, Apparel, Barware, Drinkware, Displays, Headwear, Uniforms, Outdoors, Wine & Spirits Accessories.

If a live card links to a URL not in the spec page map, still put the live `url` in JSON and add that page in Task 13 rather than pointing at a dead stub.

- [ ] **Step 5: Run tests and wire main.js**

```js
import { initWorkGrid } from "./work-grid.js";
// inside boot, after initCookies:
await initWorkGrid();
```

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/js/work-grid.js assets/js/main.js assets/data/projects.json tests/work-grid.test.js assets/css/components.css
git commit -m "feat: add Our Work data, filters, and load more"
```

---

### Task 9: Hero slider, flip cards, counters

**Files:**
- Create: `assets/js/slider.js`
- Create: `assets/js/flips.js`
- Create: `assets/js/counters.js`
- Create: `tests/counters.test.js`
- Modify: `assets/css/components.css`
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes: live home slider at https://billboardworldwide.com/ (Smart Slider id `n2-ss-2`, ~1920×800, arrows + bullets)
- Produces: `initSlider(root)` autoplays, loops, arrows `.slider-prev`/`.slider-next`, bullets `[data-slide-to]`. `initFlips()` is CSS-driven; JS only adds `js` class on `.flip-card` for reduced-motion opt-out. `animateCounter(el, to, durationMs)` and `initCounters()` using `data-count` when the element intersects the viewport.

- [ ] **Step 1: Write counter test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { nextValue } from "../assets/js/counters.js";

test("nextValue eases toward target", () => {
  assert.equal(nextValue(0, 100, 0), 0);
  assert.equal(nextValue(0, 100, 1), 100);
  assert.ok(nextValue(0, 100, 0.5) > 0);
  assert.ok(nextValue(0, 100, 0.5) < 100);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/counters.test.js`

Expected: FAIL.

- [ ] **Step 3: Implement counters.js, slider.js, flips.js**

```js
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
```

```js
export function initSlider(root = document.querySelector(".hero-slider")) {
  if (!root) return;
  const slides = [...root.querySelectorAll(".slide")];
  if (!slides.length) return;
  let i = 0;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    root.querySelectorAll("[data-slide-to]").forEach((b, idx) => {
      b.classList.toggle("is-active", idx === i);
    });
  };
  root.querySelector(".slider-prev")?.addEventListener("click", () => show(i - 1));
  root.querySelector(".slider-next")?.addEventListener("click", () => show(i + 1));
  root.querySelectorAll("[data-slide-to]").forEach((b) => {
    b.addEventListener("click", () => show(Number(b.getAttribute("data-slide-to"))));
  });
  show(0);
  setInterval(() => show(i + 1), 5000);
}
```

```js
export function initFlips() {
  document.documentElement.classList.add("has-js");
}
```

Slider markup contract for home:

```html
<section class="hero-slider" aria-label="Featured">
  <div class="slide is-active">...</div>
  <div class="slide">...</div>
  <button class="slider-prev" type="button" aria-label="Previous"></button>
  <button class="slider-next" type="button" aria-label="Next"></button>
  <div class="slider-bullets">
    <button data-slide-to="0" class="is-active" type="button"></button>
  </div>
</section>
```

Flip card contract:

```html
<article class="flip-card">
  <div class="flip-card-inner">
    <div class="flip-front">...</div>
    <div class="flip-back">...</div>
  </div>
</article>
```

CSS: 3D rotateY on hover for `.flip-card`; `@media (prefers-reduced-motion: reduce)` disables transform and autoplay interval should still be present but CSS won’t animate. Gold border `#c5ae8780`, height ~198px matching live flip boxes.

- [ ] **Step 4: Wire main.js**

```js
import { initSlider } from "./slider.js";
import { initFlips } from "./flips.js";
import { initCounters } from "./counters.js";
// in boot:
initSlider();
initFlips();
initCounters();
```

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/js/slider.js assets/js/flips.js assets/js/counters.js assets/js/main.js tests/counters.test.js assets/css/components.css
git commit -m "feat: add hero slider, flip cards, and counters"
```

---

### Task 10: Home page

**Files:**
- Modify: `index.html`
- Modify: `assets/css/pages.css`

**Interfaces:**
- Consumes: slider/flips/counters/work-grid/chrome from earlier tasks; live home https://billboardworldwide.com/
- Produces: complete home matching live sections in order

- [ ] **Step 1: Replace the home stub with live sections, in this order**

1. Hero slider — copy every Smart Slider slide (image + heading + body) from the live home. Do not invent slides.
2. Intro: heading “Full Service Marketing Agency” and the “This is Billboard! A 30-year strong…” paragraph.
3. Services heading and eight flip cards with live titles and body, using local icons:

| Front title | Icon file (from Task 6) |
| --- | --- |
| New Creative Concepts | `creative-concepts.png` |
| Freehand Sketches | `sketches.png` |
| 2D/3D Rendering | `3d-renderings.png` |
| Prototyping | `design.png` |
| Factory Production | `manufacturing.png` |
| Shipping (Air, Ocean, Ground) | `shipping-icon.png` |
| Warehousing & Fulfillment | `warehousing.png` |
| Deliveries | `delivery.png` |

4. Category tiles linking to `/games/`, `/packaging/`, `/barware/`, `/apparel/`, `/promotional-items/`, `/displays/` with live titles (Games, Packaging, Barware, Apparel, Promotional Items, Displays).
5. Featured Grey Goose Chair block linking to `/grey-goose-lawn-chair/`.
6. Achievements + counters. Use the live target numbers in `data-count` (the live page animates from 0; read the final values from the DOM, not the 0 placeholder).
7. Sustainability teaser linking to `/sustainability/`.
8. Why Choose Billboard copy (live paragraph).
9. Brands logo row using local logo files.

Set `<title>` to the live home title: `Full Service Marketing Agency – Billboard Agency International` (or whatever the live `<title>` currently is — copy it exactly).

- [ ] **Step 2: Style in pages.css until a side-by-side with the live home matches**

Check desktop and a ~390px mobile width. Slider arrows/bullets must work.

- [ ] **Step 3: Network check**

Preview home. No requests to `/wp-content/` or `/wp-json/`.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/pages.css
git commit -m "feat: rebuild home page to match live site"
```

---

### Task 11: Inner marketing pages

**Files:**
- Modify: `about-us/index.html`
- Modify: `services/index.html`
- Modify: `sustainability/index.html`
- Modify: `clients/index.html`
- Modify: `accreditations/index.html`
- Modify: `elevate-your-brand/index.html`
- Modify: `cookie-policy/index.html`
- Modify: `assets/css/pages.css`

**Interfaces:**
- Consumes: page shell, chrome, local images
- Produces: pages whose visible copy and images match the live URLs; required anchors exist

- [ ] **Step 1: About Us**

Transcribe https://billboardworldwide.com/about-us/. Required: `#leadership` on the leadership block. Do not drop office/table-tennis paragraph if it is on the live page.

- [ ] **Step 2: Services**

Transcribe https://billboardworldwide.com/services/. Required ids on the matching live sections:

- `#creative` — New Creative Concepts
- `#prototype` — Prototypes
- `#production` — Factory Production
- `#fulfillment` — Warehouse and Fulfillment

Keep the live eight-service list and wording (including the live “manufactures” / “effecient” spellings if they appear — do not copy-edit the client’s site).

- [ ] **Step 3: Sustainability, Clients, Accreditations, Elevate, Cookie Policy**

Transcribe each live URL. Sustainability must include `#sustainable` on the same block the live page uses for `/sustainability/#sustainable`. Cookie policy copy comes from https://billboardworldwide.com/cookie-policy/, not a generic template.

- [ ] **Step 4: Browser check**

Preview each URL. Click header dropdowns to `#leadership` and `#creative` and confirm scroll. Compare against live.

- [ ] **Step 5: Commit**

```bash
git add about-us/index.html services/index.html sustainability/index.html clients/index.html accreditations/index.html elevate-your-brand/index.html cookie-policy/index.html assets/css/pages.css
git commit -m "feat: rebuild inner marketing pages from live copy"
```

---

### Task 12: Our Work, categories, and case studies

**Files:**
- Modify: `our-work/index.html`
- Modify: `games/index.html`, `packaging/index.html`, `barware/index.html`, `apparel/index.html`, `promotional-items/index.html`, `displays/index.html`, `case-studies/index.html`
- Modify: each case-study `index.html` listed in Task 1
- Modify: `assets/css/pages.css`

**Interfaces:**
- Consumes: `#work-grid`, `[data-filter]`, `[data-load-more]`, `projects.json`
- Produces: Our Work page with live filter labels; category and case-study pages transcribed from live URLs

- [ ] **Step 1: Our Work page**

```html
<main id="main">
  <h1>Our Work</h1>
  <div class="work-filters">
    <button type="button" data-filter="All" class="is-active">All</button>
    <button type="button" data-filter="Accessories">Accessories</button>
    <button type="button" data-filter="Apparel">Apparel</button>
    <button type="button" data-filter="Barware">Barware</button>
    <button type="button" data-filter="Drinkware">Drinkware</button>
    <button type="button" data-filter="Displays">Displays</button>
    <button type="button" data-filter="Headwear">Headwear</button>
    <button type="button" data-filter="Uniforms">Uniforms</button>
    <button type="button" data-filter="Outdoors">Outdoors</button>
    <button type="button" data-filter="Wine & Spirits Accessories">Wine &amp; Spirits Accessories</button>
  </div>
  <div id="work-grid" class="work-grid"></div>
  <button type="button" data-load-more>Load More</button>
</main>
```

Match live heading size and filter chip style in CSS.

- [ ] **Step 2: Category pages**

Transcribe each live category URL. Keep the same hero, galleries, and CTAs. Internal links must stay on the static site (`/contact-us/`, not WordPress admin).

- [ ] **Step 3: Case study pages**

For each spec case-study URL, open the live page and transcribe hero, gallery, and body. Shared layout class `.case-study`. If the live homepage still links to `/budwiser-bridge-set/` (or any other public case-study URL not stubbed), add `budwiser-bridge-set/index.html` (or a `meta refresh`/JS redirect only if the live URL 404s) and append it to `REQUIRED_PAGES` plus a test rerun.

- [ ] **Step 4: Browser check**

Our Work: each filter shrinks the grid; Load More reveals the rest; cards navigate. Open one category and one case study vs live.

- [ ] **Step 5: Commit**

```bash
git add our-work games packaging barware apparel promotional-items displays case-studies st-german-maison-display titos-displays grey-goose-enamel-pins ungava-bottle-puffer-jacket grey-goose-lawn-chair greygoose-bottle-bag cisco-silicon-bottle corona-fire-table corona-cabinet assets/css/pages.css tests/pages.test.js
git commit -m "feat: rebuild work grid, categories, and case studies"
```

---

### Task 13: Contact form

**Files:**
- Create: `assets/js/form.js`
- Create: `assets/js/config.js`
- Create: `tests/form.test.js`
- Modify: `contact-us/index.html`
- Modify: `assets/js/main.js`
- Modify: `assets/css/components.css`

**Interfaces:**
- Consumes: live form fields from https://billboardworldwide.com/contact-us/
- Produces: `validateContact(data)` returns `{ ok: boolean, errors: Record<string,string> }`. `shouldDropAsSpam(honeypot)` true when honeypot is non-empty. `submitContact(payload, fetchFn)` POSTs JSON to `https://api.web3forms.com/submit` with `access_key` from `config.js` and `to` is not required (Web3Forms uses the key’s inbox). Email destination is the Web3Forms key registered to `info@billboardworldwide.com`.

- [ ] **Step 1: Write failing tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { validateContact, shouldDropAsSpam } from "../assets/js/form.js";

const valid = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  phone: "",
  helpWith: "General Inquiries",
  message: "Hello",
};

test("rejects missing required fields", () => {
  const r = validateContact({ ...valid, firstName: "", email: "nope" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.firstName);
  assert.ok(r.errors.email);
});

test("rejects placeholder helpWith", () => {
  const r = validateContact({ ...valid, helpWith: "I need help with*" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.helpWith);
});

test("accepts a complete form", () => {
  assert.equal(validateContact(valid).ok, true);
});

test("honeypot drops bots", () => {
  assert.equal(shouldDropAsSpam("http://spam"), true);
  assert.equal(shouldDropAsSpam(""), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/form.test.js`

Expected: FAIL.

- [ ] **Step 3: Implement config.js and form.js**

```js
export const WEB3FORMS_KEY = "";
```

If the implementer has a key, put it in `assets/js/config.local.js` (gitignored) and export from `config.js` via:

```js
let key = "";
try {
  key = (await import("./config.local.js")).WEB3FORMS_KEY;
} catch {
  key = "";
}
export const WEB3FORMS_KEY = key;
```

Node tests do not import `config.js`. Keep `form.js` free of top-level await if tests import it.

```js
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACEHOLDER_HELP = "I need help with*";

export function shouldDropAsSpam(honeypot) {
  return Boolean(honeypot && honeypot.trim());
}

export function validateContact(data) {
  const errors = {};
  if (!data.firstName?.trim()) errors.firstName = "Required";
  if (!data.lastName?.trim()) errors.lastName = "Required";
  if (!EMAIL.test(data.email || "")) errors.email = "Enter a valid email";
  if (!data.company?.trim()) errors.company = "Required";
  if (!data.helpWith || data.helpWith === PLACEHOLDER_HELP) {
    errors.helpWith = "Required";
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export async function submitContact(payload, fetchFn = fetch) {
  const res = await fetchFn("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("form api");
  return res.json();
}

export function initForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (shouldDropAsSpam(data.website)) return;
    const result = validateContact(data);
    form.querySelectorAll("[data-error]").forEach((el) => {
      el.textContent = result.errors[el.getAttribute("data-error")] || "";
    });
    if (!result.ok) return;
    const { WEB3FORMS_KEY } = await import("./config.js");
    if (!WEB3FORMS_KEY) {
      status.textContent =
        "Something went wrong, please email info@billboardworldwide.com";
      return;
    }
    try {
      await submitContact({
        access_key: WEB3FORMS_KEY,
        subject: `Website contact: ${data.helpWith}`,
        from_name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        company: data.company,
        phone: data.phone,
        helpWith: data.helpWith,
        message: data.message,
      });
      status.textContent = "Thank you. We will get back to you soon.";
      form.reset();
    } catch {
      status.textContent =
        "Something went wrong, please email info@billboardworldwide.com";
    }
  });
}
```

- [ ] **Step 4: Build contact-us/index.html from the live page**

Keep live intro copy, Canada office block, and Why Choose / brands bands if present. Form fields (names used by `validateContact`):

```html
<form id="contact-form" novalidate>
  <input name="website" class="hp" tabindex="-1" autocomplete="off">
  <input name="firstName" placeholder="First Name*" required>
  <span data-error="firstName"></span>
  <input name="lastName" placeholder="Last Name*" required>
  <span data-error="lastName"></span>
  <input name="email" type="email" placeholder="Email*" required>
  <span data-error="email"></span>
  <input name="company" placeholder="Company*" required>
  <span data-error="company"></span>
  <input name="phone" type="tel" placeholder="Phone">
  <select name="helpWith" required>
    <option value="I need help with*">I need help with*</option>
    <option>Creative Concepts</option>
    <option>Freehand Sketches</option>
    <option>2D/3D Renderings</option>
    <option>Prototypes</option>
    <option>Factory Production</option>
    <option>Shipping</option>
    <option>Warehousing &amp; Fulfillment</option>
    <option>General Inquiries</option>
  </select>
  <span data-error="helpWith"></span>
  <textarea name="message" placeholder="Your Message Here"></textarea>
  <button type="submit">Let's make it happen</button>
  <p data-form-status role="status"></p>
</form>
```

Hide `.hp` with CSS (`position:absolute;left:-9999px`). Match live input styling.

- [ ] **Step 5: Wire initForm in main.js, run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Manual form check**

Without a key: valid submit shows the email-fallback error, not a network success. With a key in `config.local.js`: send a test and confirm mail at `info@billboardworldwide.com`. Invalid submit must not POST (watch Network).

- [ ] **Step 7: Commit**

```bash
git add assets/js/form.js assets/js/config.js assets/js/main.js tests/form.test.js contact-us/index.html assets/css/components.css
git commit -m "feat: add static contact form with Web3Forms"
```

Do not commit `config.local.js`.

---

### Task 14: Visual QA and WordPress-free check

**Files:**
- Modify: any CSS/HTML/JS that fails the checks below
- Create: `tests/no-wordpress.test.js`

**Interfaces:**
- Consumes: all pages
- Produces: `npm test` also fails if source HTML still contains `wp-content` or `wp-json`

- [ ] **Step 1: Write no-wordpress test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

test("HTML does not reference WordPress paths", () => {
  const root = join(import.meta.dirname, "..");
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, "utf8");
    assert.equal(html.includes("/wp-content/"), false, file);
    assert.equal(html.includes("/wp-json/"), false, file);
  }
});
```

- [ ] **Step 2: Run tests**

Run: `npm test`

Expected: PASS. If FAIL, replace remaining WordPress URLs with `/assets/images/...`.

- [ ] **Step 3: Browser verification (required, not optional)**

`npm run preview` vs https://billboardworldwide.com/ for:

- Home, About, Services, Our Work, Contact, Sustainability
- One category page and one case study
- Desktop and ~390px width
- Anchors `#leadership`, `#creative`, other Services/Sustainability hashes
- Header/footer on an inner page
- Fake path `/this-is-not-a-page/` shows `404.html` (with `serve`, add `"serve.json"`:

```json
{ "redirects": [], "rewrites": [], "unlisted": [], "headers": [], "cleanUrls": false, "trailingSlash": true }
```

If `npx serve` does not map 404, document that production hosting must point 404s at `404.html`. Locally, open http://localhost:4173/404.html directly as well.)

- Slider, flips, counters, filters, Load More
- Form invalid vs valid paths from Task 13
- Network tab: no `/wp-content/`, `/wp-json/`

Fix CSS/spacing/type until a visitor would not notice WordPress is gone, aside from sub-pixel slider differences allowed by the spec.

- [ ] **Step 4: Commit QA fixes**

```bash
git add tests/no-wordpress.test.js serve.json
git add -u
git commit -m "fix: match live visuals and strip WordPress URLs"
```

---

## Self-review vs spec

| Spec requirement | Task |
| --- | --- |
| Static HTML/CSS/JS, no WP/PHP/DB | 1–14 |
| Trailing-slash URLs / folder index.html | 4 |
| Header/footer partials | 3 |
| Self-hosted fonts | 5 |
| Local images, no wp-content | 6, 14 |
| Web3Forms → info@ | 13 |
| GA G-V2TJ281ZYS after consent | 7 |
| Page map include/exclude | 1, 4, 11–12 |
| Slider, flips, counters, tiles | 9–10 |
| Our Work filters + Load More + JSON | 8, 12 |
| Case studies | 12 |
| Form fields and errors | 13 |
| 404 | 4, 14 |
| JS failure still shows content | 3–4 (content in HTML) |
| Local preview, no deploy | 1 (`npm run preview`) |
| Browser side-by-side QA | 10–14 |

No Formspree. No CMS. Hosting/DNS remain out of scope.
