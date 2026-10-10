import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const expectedFontFamilies = ["Noto Sans JP", "Noto Color Emoji", "Moirai One"];
const buildDirectory = resolve(process.argv[2] ?? "dist");
const entryPath = resolve(buildDirectory, "index.html");
const woff2Signature = "774f4632";

let entryHtml;

try {
  entryHtml = await readFile(entryPath, "utf8");
} catch (error) {
  throw new Error(
    `Expected generated entry page at ${entryPath}, but it is unavailable.`,
    { cause: error },
  );
}

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const referencedFonts = new Map();

for (const family of expectedFontFamilies) {
  const fontFacePattern = new RegExp(
    String.raw`@font-face\s*\{[^}]*font-family:\s*["']${escapeRegExp(family)}(?:-[^"']*)?["'][^}]*src:\s*url\(["']([^"']+\.woff2)["']\)`,
    "u",
  );

  const match = entryHtml.match(fontFacePattern);

  if (!match) {
    throw new Error(
      `Expected ${family} to reference a generated WOFF2 file in ${entryPath}.`,
    );
  }

  referencedFonts.set(family, match[1]);
}

for (const [family, fontUrl] of referencedFonts) {
  if (!fontUrl.startsWith("/_astro/fonts/")) {
    throw new Error(`Unexpected generated font URL for ${family}: ${fontUrl}`);
  }

  const fontPath = resolve(buildDirectory, fontUrl.slice(1));
  let fontData;

  try {
    fontData = await readFile(fontPath);
  } catch (error) {
    throw new Error(`Generated font for ${family} is unavailable: ${fontPath}`, {
      cause: error,
    });
  }

  if (fontData.subarray(0, 4).toString("hex") !== woff2Signature) {
    throw new Error(
      `Generated font for ${family} is not a valid WOFF2 file: ${fontPath}`,
    );
  }
}

console.log(
  `Verified generated self-hosted fonts: ${expectedFontFamilies.join(", ")}.`,
);
