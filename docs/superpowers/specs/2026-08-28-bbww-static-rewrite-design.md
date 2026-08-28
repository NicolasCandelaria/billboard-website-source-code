# Billboard Worldwide static rewrite

Rebuild [billboardworldwide.com](https://billboardworldwide.com/) as a static HTML/CSS/JS site with no WordPress, PHP, database, or page builder. The public site must keep the same URLs, copy, images, fonts, and interaction patterns. Content is frozen after launch: updates are code edits.

This folder is the project root. Preview locally with a static file server. Hosting is out of scope until later.

## Goals

- Stop paying for WordPress hosting (currently SiteGround) without changing what visitors see.
- Keep fonts, animations, images, and content matching the live site.
- Keep a working contact form that emails `info@billboardworldwide.com`.
- Preview locally before choosing a host.

## Non-goals

- A CMS or admin UI.
- Pixel-perfect recreation of Smart Slider’s internal engine. Motion, timing, and layout must match in a side-by-side browser check; sub-pixel differences are acceptable. Missing slides, wrong type, or missing motion are not.
- Rebuilding leftover WordPress URLs that are not part of the public marketing site.
- Deploying to production or changing DNS.

## Stack

- Plain HTML, CSS, and JavaScript. No React, no WordPress, no Elementor, no Smart Slider plugin.
- Shared header and footer in `partials/`, injected at runtime (requires the local static server; `file://` is not a supported preview mode).
- Self-hosted fonts: Montserrat, Playfair Display, Roboto, copied from the live site / Google Fonts files into `assets/fonts/`.
- Images copied from the live WordPress media library into `assets/images/`. After the rebuild, pages must not request `/wp-content/`, `/wp-json/`, or other WordPress URLs.
- Contact form posts to **Web3Forms**, which emails `info@billboardworldwide.com`. The access key lives in a local config file that is not committed if it is a secret. Formspree is not used unless Web3Forms is blocked.
- Analytics: existing Google tag `G-V2TJ281ZYS`, loaded only after cookie consent (same idea as the current banner). No Jetpack.

## URL and page map

Each public URL is a directory with `index.html` so trailing-slash paths match the live site (`about-us/index.html` → `/about-us/`).

**Include**

| URL | Role |
| --- | --- |
| `/` | Home |
| `/about-us/` | About, including `#leadership` |
| `/services/` | Services, including `#creative`, `#fulfillment`, `#production`, `#prototype` |
| `/our-work/` | Filterable work grid |
| `/contact-us/` | Contact + form |
| `/sustainability/` | Sustainability, including `#sustainable` |
| `/clients/` | Clients |
| `/accreditations/` | Accreditations |
| `/elevate-your-brand/` | Campaign page |
| `/cookie-policy/` | Cookie policy |
| `/games/`, `/packaging/`, `/barware/`, `/apparel/`, `/promotional-items/`, `/displays/` | Category pages |
| `/case-studies/` | Case studies index |
| `/st-german-maison-display/`, `/titos-displays/`, `/grey-goose-enamel-pins/`, `/ungava-bottle-puffer-jacket/`, `/grey-goose-lawn-chair/`, `/greygoose-bottle-bag/`, `/cisco-silicon-bottle/`, `/corona-fire-table/`, `/corona-cabinet/` | Case study pages |

If the live homepage (or nav) still links to another public case-study URL (for example `/budwiser-bridge-set/`), add that page or a redirect during implementation. Do not invent pages that are not on the live site.

**Exclude**

- `/old-barware/`, `/lvd/`, `/1-2/`, `/msle/`
- Posts `/try/` and `/wordpress-resources-at-siteground/`
- WordPress system URLs (`/wp-json/`, `/feed/`, `/comments/feed/`, `xmlrpc.php`)

Excluded URLs get the custom 404 page, not a WordPress error.

## File layout

```
/
  index.html
  about-us/index.html
  services/index.html
  … (one folder per URL above)
  404.html
  partials/header.html
  partials/footer.html
  assets/css/   site styles (reset, layout, components, pages)
  assets/js/    header, slider, flips, counters, filters, form, cookies
  assets/fonts/
  assets/images/
  assets/data/projects.json
  docs/superpowers/specs/   this spec
```

## Components

**Chrome**

- Header: live logo, primary nav, dropdowns (About, Services, Work), Contact CTA, sticky header, mobile menu.
- Footer: live columns, `mailto:info@billboardworldwide.com`, cookie-policy link, same supporting links as live.
- Cookie banner: same visitor-facing copy and accept/dismiss pattern as the current WPConsent bar. Choice stored in `localStorage`. Analytics scripts load only after accepted.

**Home and shared marketing**

- Hero slider replacing Smart Slider: same slides, copy, type, and autoplay/arrow/bullet behavior, implemented in CSS/JS.
- Service flip cards replacing Essential Addons: same front/back content and 3D flip.
- Category tiles: Games, Packaging, Barware, Apparel, Promotional Items, Displays.
- Featured product (Grey Goose Chair), scroll-triggered stat counters, brand logo row, “Why Choose Billboard” band.

**Work**

- Our Work filter grid: All, Accessories, Apparel, Barware, Drinkware, Displays, Headwear, Uniforms, Outdoors, Wine & Spirits Accessories, plus Load More.
- Case study template: hero, gallery, copy. One layout reused per case-study URL.

**Contact form fields (unchanged)**

- First Name* , Last Name* , Email* , Company*
- Phone (optional)
- “I need help with*” select: Creative Concepts, Freehand Sketches, 2D/3D Renderings, Prototypes, Factory Production, Shipping, Warehousing & Fulfillment, General Inquiries (placeholder option is not a valid submit)
- Message (optional)
- Submit label: `Let's make it happen`

## Data flow

- Page copy lives in each HTML file. There is no CMS.
- `assets/data/projects.json` is the single list of work items (title, image, category tags, URL). Home tiles, Our Work filters, and Load More all read this file so categories cannot drift.
- Images and fonts are local files referenced by relative paths.
- Form: client-side validation → POST to Web3Forms → email to `info@billboardworldwide.com` → success or error message in the form area. Nothing is stored on our host.
- Analytics ID `G-V2TJ281ZYS` loads only after cookie consent.

## Error handling

- Invalid form: stay on the page, show inline/form-level errors, do not POST.
- Form API failure: show “Something went wrong, please email info@billboardworldwide.com”. Footer mailto remains available.
- Hidden honeypot field: if filled, drop the submit silently (no email). No CAPTCHA unless spam later requires it.
- Missing public URLs: `404.html` in the site’s look.
- JS failure: content, nav links, and the form HTML remain usable. Slider autoplay, flips, counters, filters, and sticky extras may be absent; the page must not go blank.
- Preview only through a local static server so partials and JSON fetch work.

## Testing

Done means a real browser click-through against the live site, not “the files exist.”

1. Side-by-side check of Home, About, Services, Our Work, Contact, Sustainability, one category page, and one case study: layout, type, color, images, slider, flips, counters, sticky header, filters, Load More.
2. Same set at a mobile width.
3. In-page anchors (`#leadership`, `#creative`, and the other Services/Sustainability hashes) scroll to the correct block.
4. Invalid form submit does not send mail. Valid submit shows success and a test message arrives at `info@billboardworldwide.com` (requires the Web3Forms key).
5. Header/footer/dropdowns work on inner pages, not only home.
6. Network tab shows no `/wp-content/` or `/wp-json/` requests.
7. A fake path shows `404.html`. Excluded leftover URLs do not 500.

No screenshot-automation suite in the first build.

## Implementation order

1. Scaffold folders, shared CSS, header/footer partials, fonts, 404.
2. Copy images from the live site; build `projects.json` from Our Work.
3. Home (slider, flips, tiles, counters, logos).
4. Inner marketing pages (About, Services, Sustainability, Clients, Accreditations, Elevate, Cookie Policy).
5. Our Work, category pages, case studies.
6. Contact form + Web3Forms + cookie/analytics.
7. Browser verification against the live site; fix visual gaps.

## Success criteria

- A visitor cannot tell they left WordPress from look, motion, copy, or URLs.
- Contact leads still reach `info@billboardworldwide.com`.
- The site runs as static files with no PHP or database.
- The project can be previewed locally before any hosting decision.
