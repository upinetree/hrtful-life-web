import { defineConfig, fontProviders } from "astro/config";

import mdx from "@astrojs/mdx";

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const collectSourceFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.(astro|md|mdx)$/.test(entry.name) ? [path] : [];
  });

const fontGlyphs = Array.from(
  collectSourceFiles(fileURLToPath(new URL("./src", import.meta.url)))
    .map((path) => readFileSync(path, "utf8"))
    .join("")
    .replace(/\s/g, "") + " ",
)
  .filter((glyph, index, glyphs) => glyphs.indexOf(glyph) === index);

const emojiGlyphs = fontGlyphs.filter(
  (glyph) => /\p{Emoji}/u.test(glyph) || glyph === "\u200d" || glyph === "\ufe0f",
);

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Noto Sans JP",
      cssVariable: "--font-noto-sans-jp",
      weights: [400, 600, 700],
      styles: ["normal"],
      options: {
        experimental: {
          glyphs: fontGlyphs,
        },
      },
      fallbacks: ["var(--font-noto-color-emoji)", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Noto Color Emoji",
      cssVariable: "--font-noto-color-emoji",
      weights: [400],
      styles: ["normal"],
      options: {
        experimental: {
          glyphs: emojiGlyphs,
        },
      },
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Moirai One",
      cssVariable: "--font-moirai-one",
      weights: [400],
      styles: ["normal"],
      options: {
        experimental: {
          glyphs: ["HRTful.life"],
        },
      },
      fallbacks: ["sans-serif"],
    },
  ],
  integrations: [mdx()],
});
