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

const imgRe =
  /https:\/\/billboardworldwide\.com\/wp-content\/uploads\/[^"'\\\s)]+/g;

const isImage = (buf) => {
  const prefix = buf.subarray(0, 16);
  const text = buf.subarray(0, 512).toString("utf8").trimStart().toLowerCase();

  return (
    prefix.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) ||
    prefix.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex")) ||
    prefix.subarray(0, 4).toString("ascii") === "RIFF" &&
      prefix.subarray(8, 12).toString("ascii") === "WEBP" ||
    prefix.subarray(0, 6).toString("ascii") === "GIF87a" ||
    prefix.subarray(0, 6).toString("ascii") === "GIF89a" ||
    prefix.subarray(4, 12).toString("ascii") === "ftypavif" ||
    text.startsWith("<svg") ||
    text.startsWith("<?xml") && text.includes("<svg")
  );
};

const urls = new Set();
for (const page of PAGES) {
  try {
    const response = await fetch(page);
    if (!response.ok) {
      console.warn(`Skipping page ${response.status}: ${page}`);
      continue;
    }

    const html = await response.text();
    for (const match of html.matchAll(imgRe)) {
      urls.add(match[0].split("?")[0]);
    }
  } catch (error) {
    console.warn(`Skipping page fetch failure: ${page} (${error.message})`);
  }
}

await mkdir("assets/images", { recursive: true });
for (const url of urls) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Skipping asset ${response.status}: ${url}`);
      continue;
    }

    const buf = Buffer.from(await response.arrayBuffer());
    if (!isImage(buf)) {
      console.warn(`Skipping non-image response: ${url}`);
      continue;
    }

    const name = basename(decodeURIComponent(url));
    await writeFile(`assets/images/${name}`, buf);
    console.log(url, "->", `/assets/images/${name}`);
  } catch (error) {
    console.warn(`Skipping asset fetch failure: ${url} (${error.message})`);
  }
}
