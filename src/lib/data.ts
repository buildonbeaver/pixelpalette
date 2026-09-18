/* Curated Bunny Fonts catalog + preset color palettes.
   Bunny Fonts mirrors the Google Fonts library, so `family` here is the
   exact family name used in the Bunny CSS v1 API:
   https://fonts.bunny.net/css?family=Inter:400,500,600,700 */

export type FontCategory = "sans" | "serif" | "display" | "mono" | "handwriting";

export interface BunnyFont {
  family: string;
  category: FontCategory;
  weights: number[];
  /** Original fonts.bunny.net key (e.g. "alegreya-sans-sc"). Used verbatim
      in CSS requests; `family` is the human-readable display name. */
  slug?: string;
}

/** "Alegreya Sans SC" → "alegreya-sans-sc" */
export function slugifyFamily(family: string): string {
  return family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Last-resort prettifier for bare slugs: "alegreya-sans-sc" → "Alegreya Sans SC" */
export function prettifySlug(slug: string): string {
  return slug
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) =>
      /^\d+$/.test(part)
        ? part
        : part.length <= 2
          ? part.toUpperCase()
          : part[0].toUpperCase() + part.slice(1),
    )
    .join(" ");
}

export const FONT_CATEGORIES: { id: FontCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "display", label: "Display" },
  { id: "mono", label: "Mono" },
  { id: "handwriting", label: "Handwriting" },
];

export const CURATED_FONTS: BunnyFont[] = [
  { family: "Inter", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Manrope", category: "sans", weights: [400, 500, 600, 700, 800] },
  { family: "DM Sans", category: "sans", weights: [400, 500, 700] },
  { family: "Outfit", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Plus Jakarta Sans", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Public Sans", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Figtree", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Work Sans", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Archivo", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Karla", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Montserrat", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Poppins", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Nunito", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Raleway", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Rubik", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Open Sans", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Lato", category: "sans", weights: [400, 700] },
  { family: "Roboto", category: "sans", weights: [400, 500, 700] },
  { family: "Source Sans 3", category: "sans", weights: [400, 600, 700] },
  { family: "Mulish", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Fraunces", category: "serif", weights: [400, 500, 600, 700] },
  { family: "Playfair Display", category: "serif", weights: [400, 500, 600, 700] },
  { family: "Merriweather", category: "serif", weights: [400, 700] },
  { family: "Lora", category: "serif", weights: [400, 500, 600, 700] },
  { family: "Source Serif 4", category: "serif", weights: [400, 600, 700] },
  { family: "DM Serif Display", category: "serif", weights: [400] },
  { family: "Libre Baskerville", category: "serif", weights: [400, 700] },
  { family: "Crimson Pro", category: "serif", weights: [400, 500, 600, 700] },
  { family: "Bitter", category: "serif", weights: [400, 500, 600, 700] },
  { family: "PT Serif", category: "serif", weights: [400, 700] },
  { family: "Space Grotesk", category: "display", weights: [400, 500, 600, 700] },
  { family: "Sora", category: "display", weights: [400, 500, 600, 700] },
  { family: "Bricolage Grotesque", category: "display", weights: [400, 500, 600, 700] },
  { family: "Syne", category: "display", weights: [400, 500, 600, 700, 800] },
  { family: "Unbounded", category: "display", weights: [400, 500, 600, 700] },
  { family: "Oswald", category: "display", weights: [400, 500, 600, 700] },
  { family: "Anton", category: "display", weights: [400] },
  { family: "Bebas Neue", category: "display", weights: [400] },
  { family: "Abril Fatface", category: "display", weights: [400] },
  { family: "Alfa Slab One", category: "display", weights: [400] },
  { family: "Righteous", category: "display", weights: [400] },
  { family: "JetBrains Mono", category: "mono", weights: [400, 500, 600, 700] },
  { family: "IBM Plex Mono", category: "mono", weights: [400, 500, 600] },
  { family: "Space Mono", category: "mono", weights: [400, 700] },
  { family: "Fira Code", category: "mono", weights: [400, 500, 600] },
  { family: "Source Code Pro", category: "mono", weights: [400, 500, 600, 700] },
  { family: "Roboto Mono", category: "mono", weights: [400, 500, 600, 700] },
  { family: "Caveat", category: "handwriting", weights: [400, 500, 600, 700] },
  { family: "Pacifico", category: "handwriting", weights: [400] },
  { family: "Dancing Script", category: "handwriting", weights: [400, 500, 600, 700] },
  { family: "Satisfy", category: "handwriting", weights: [400] },
];

/** Build a Bunny CSS v1 URL for a set of families. */
export function bunnyCssUrl(families: { family: string; weights: number[]; slug?: string }[]): string {
  const parts = families.map(({ family, weights, slug }) => {
    const key = slug ?? family.replace(/\s+/g, "+");
    const w = [...new Set(weights)].sort((a, b) => a - b).join(",");
    return `${key}:${w}`;
  });
  return `https://fonts.bunny.net/css?family=${parts.join("|")}&display=swap`;
}

/* ------------------------------- palettes ------------------------------- */

export interface PaletteTokens {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryInk: string;
  accent: string;
}

export interface PresetPalette {
  name: string;
  light: PaletteTokens;
  dark: PaletteTokens;
}

export const TOKEN_LABELS: { id: keyof PaletteTokens; label: string; hint: string }[] = [
  { id: "bg", label: "Background", hint: "Page backdrop" },
  { id: "surface", label: "Surface", hint: "Cards, panels" },
  { id: "surface2", label: "Raised", hint: "Inputs, chips, hovers" },
  { id: "text", label: "Text", hint: "Headings, body" },
  { id: "muted", label: "Muted", hint: "Secondary text" },
  { id: "border", label: "Border", hint: "Dividers, outlines" },
  { id: "primary", label: "Primary", hint: "Buttons, links" },
  { id: "primaryInk", label: "On primary", hint: "Text on buttons" },
  { id: "accent", label: "Accent", hint: "Highlights" },
];

export const PRESET_PALETTES: PresetPalette[] = [
  {
    name: "Porcelain",
    light: {
      bg: "#fafaf9", surface: "#ffffff", surface2: "#f5f5f4",
      text: "#1c1917", muted: "#78716c", border: "#e7e5e4",
      primary: "#4f46e5", primaryInk: "#ffffff", accent: "#0d9488",
    },
    dark: {
      bg: "#0c0a09", surface: "#1c1917", surface2: "#292524",
      text: "#fafaf9", muted: "#a8a29e", border: "#44403c",
      primary: "#818cf8", primaryInk: "#0c0a09", accent: "#2dd4bf",
    },
  },
  {
    name: "Forest",
    light: {
      bg: "#f7f8f3", surface: "#ffffff", surface2: "#eef1e6",
      text: "#1a2e1f", muted: "#5d7263", border: "#dde4d2",
      primary: "#2d6a4f", primaryInk: "#ffffff", accent: "#d4a017",
    },
    dark: {
      bg: "#0d1510", surface: "#16211a", surface2: "#1f2f25",
      text: "#edf3ea", muted: "#93a898", border: "#2e4034",
      primary: "#74c69d", primaryInk: "#0d1510", accent: "#e9c46a",
    },
  },
  {
    name: "Ocean",
    light: {
      bg: "#f4f8fb", surface: "#ffffff", surface2: "#e9f1f7",
      text: "#0c2436", muted: "#54778f", border: "#d5e5f0",
      primary: "#0369a1", primaryInk: "#ffffff", accent: "#0891b2",
    },
    dark: {
      bg: "#08131c", surface: "#0e1e2b", surface2: "#152a3c",
      text: "#eaf4fa", muted: "#8fb0c4", border: "#1f3a4f",
      primary: "#38bdf8", primaryInk: "#08131c", accent: "#22d3ee",
    },
  },
  {
    name: "Sunset",
    light: {
      bg: "#fdf7f2", surface: "#ffffff", surface2: "#faede3",
      text: "#31170b", muted: "#8a5f4b", border: "#f0d9c6",
      primary: "#c2410c", primaryInk: "#ffffff", accent: "#be185d",
    },
    dark: {
      bg: "#170c07", surface: "#241209", surface2: "#332015",
      text: "#fbeee4", muted: "#c19a83", border: "#4a2c1c",
      primary: "#fb923c", primaryInk: "#170c07", accent: "#f472b6",
    },
  },
  {
    name: "Grape",
    light: {
      bg: "#f8f6fc", surface: "#ffffff", surface2: "#f0eaf9",
      text: "#241540", muted: "#6f6390", border: "#ddd2f0",
      primary: "#7c3aed", primaryInk: "#ffffff", accent: "#db2777",
    },
    dark: {
      bg: "#120b20", surface: "#1d1332", surface2: "#2a1d47",
      text: "#f1ebfb", muted: "#a99ac6", border: "#3d2c63",
      primary: "#a78bfa", primaryInk: "#120b20", accent: "#f472b6",
    },
  },
  {
    name: "Mono",
    light: {
      bg: "#ffffff", surface: "#ffffff", surface2: "#f1f1f1",
      text: "#111111", muted: "#6b6b6b", border: "#e2e2e2",
      primary: "#111111", primaryInk: "#ffffff", accent: "#555555",
    },
    dark: {
      bg: "#000000", surface: "#111111", surface2: "#1e1e1e",
      text: "#f5f5f5", muted: "#a3a3a3", border: "#2e2e2e",
      primary: "#f5f5f5", primaryInk: "#000000", accent: "#d4d4d4",
    },
  },
];

export const DEFAULT_FONTS = {
  display: "Fraunces",
  body: "Inter",
  code: "JetBrains Mono",
};
