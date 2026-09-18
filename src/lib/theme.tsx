import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CURATED_FONTS,
  DEFAULT_FONTS,
  PRESET_PALETTES,
  bunnyCssUrl,
  prettifySlug,
  slugifyFamily,
  type BunnyFont,
  type FontCategory,
  type PaletteTokens,
} from "./data";
import { isUnusableFamily } from "./fontcheck";
import { contrastRatio, hslToHex } from "./color";

/* ---------------------------------- types --------------------------------- */

export type ThemeMode = "light" | "dark";
export type FontSlot = "display" | "body" | "code";
export type FontSource = "bunny" | "local" | "custom";

export interface FontSelection {
  source: FontSource;
  family: string;
}

export interface LocalFontEntry {
  family: string;
  styles: string[];
}

interface LocalFontData {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
  blob: () => Promise<Blob>;
}

interface WindowWithFontAccess extends Window {
  queryLocalFonts?: (opts?: { postscriptNamesOnly?: boolean }) => Promise<LocalFontData[]>;
}

const STORAGE_KEY = "pixelpalette-theme-v1";

interface PersistedTheme {
  mode: ThemeMode;
  fonts: Record<FontSlot, FontSelection>;
  light: PaletteTokens;
  dark: PaletteTokens;
  preset: string;
  radius: number;
}

function defaultPersisted(): PersistedTheme {
  const porcelain = PRESET_PALETTES[0];
  return {
    mode: "light",
    fonts: {
      display: { source: "bunny", family: DEFAULT_FONTS.display },
      body: { source: "bunny", family: DEFAULT_FONTS.body },
      code: { source: "bunny", family: DEFAULT_FONTS.code },
    },
    light: { ...porcelain.light },
    dark: { ...porcelain.dark },
    preset: porcelain.name,
    radius: 12,
  };
}

function loadPersisted(): PersistedTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPersisted();
    const parsed = { ...defaultPersisted(), ...(JSON.parse(raw) as Partial<PersistedTheme>) };
    return parsed;
  } catch {
    return defaultPersisted();
  }
}

/* ------------------------------ font fallbacks ----------------------------- */

const CATEGORY_FALLBACK: Record<string, string> = {
  sans: "system-ui, -apple-system, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  display: "system-ui, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  handwriting: "cursive",
  unknown: "system-ui, sans-serif",
};

function curatedOf(family: string): BunnyFont | undefined {
  return CURATED_FONTS.find((f) => f.family.toLowerCase() === family.toLowerCase());
}

function mapBunnyCategory(rawCat?: string): FontCategory {
  const c = (rawCat ?? "").toLowerCase();
  if (c.includes("mono")) return "mono";
  if (c.includes("hand") || c.includes("script")) return "handwriting";
  if (c.includes("display")) return "display";
  if (c.includes("serif") && !c.includes("sans")) return "serif";
  return "sans";
}

/** Keep the API's real weights (capped) so we never request what a family lacks. */
function pickBunnyWeights(raw: unknown): number[] {
  const list = Array.isArray(raw)
    ? raw.filter((w): w is number => typeof w === "number" && w >= 100 && w <= 900)
    : [];
  if (list.length === 0) return [400];
  const uniq = [...new Set(list)].sort((a, b) => a - b);
  const preferred = [400, 500, 600, 700].filter((w) => uniq.includes(w));
  const rest = uniq.filter((w) => ![400, 500, 600, 700].includes(w));
  const out = [...preferred, ...rest].slice(0, 5);
  return out.length > 0 ? out.sort((a, b) => a - b) : [uniq[0]];
}

export function cssStack(sel: FontSelection, category?: FontCategory, slug?: string): string {
  const fallback =
    CATEGORY_FALLBACK[sel.source === "bunny" ? (category ?? curatedOf(sel.family)?.category ?? "unknown") : "unknown"];
  const quote = (n: string) => (/^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(n) ? n : `"${n}"`);
  // List both the display name and the API slug: the served @font-face uses
  // one of them, so one entry always matches.
  const names = [quote(sel.family)];
  if (sel.source === "bunny" && slug && slug.toLowerCase() !== sel.family.toLowerCase()) {
    names.push(quote(slug));
  }
  return `${names.join(", ")}, ${fallback}`;
}

/* Map a Local Font Access style string ("Bold Italic", "Light", …) to
   FontFace descriptors so every face of a family registers correctly. */
function parseLocalStyle(style: string): { style: string; weight: string } {
  const s = style.toLowerCase();
  const italic = /italic|oblique/.test(s) ? "italic" : "normal";
  let weight = "400";
  if (/thin/.test(s)) weight = "100";
  else if (/extralight|ultralight/.test(s)) weight = "200";
  else if (/(^|[^a-z])light([^a-z]|$)/.test(s)) weight = "300";
  else if (/extrabold|ultrabold/.test(s)) weight = "800";
  else if (/black|heavy/.test(s)) weight = "900";
  else if (/semibold|demibold/.test(s)) weight = "600";
  else if (/bold/.test(s)) weight = "700";
  else if (/medium/.test(s)) weight = "500";
  return { style: italic, weight };
}

/* ------------------------- random style generator ------------------------ */
/* Generative, not a preset cycle: random hues + harmony rules for colors
   (contrast-fitted), the full live font catalog, and a 0–20 radius roll. */

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}
function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shiftHue(h: number, deg: number): number {
  return (((h + deg) % 360) + 360) % 360;
}
function inkFor(bg: string): string {
  return contrastRatio("#ffffff", bg) >= contrastRatio("#171310", bg)
    ? "#ffffff"
    : "#171310";
}
/** Nudge a primary's lightness until its ink hits AA (4.5:1). */
function fitPrimary(h: number, s: number, l: number): { hex: string; ink: string } {
  let hex = hslToHex(h, s, l);
  let ink = inkFor(hex);
  for (let i = 0; i < 14 && contrastRatio(hex, ink) < 4.5; i++) {
    l = Math.min(92, Math.max(8, l + (ink === "#ffffff" ? -4 : 4)));
    hex = hslToHex(h, s, l);
    ink = inkFor(hex);
  }
  return { hex, ink };
}

/** Poll until the browser has the @font-face data (or timeout) so a swap
    never flashes fallback first. Warms every declared weight — headings
    render 600/700, and warming only 400 leaves the bolds to fetch on
    first paint (the classic FOUT hole). */
async function warmBunnyFaces(
  fams: { family: string; weights: number[] }[],
  timeoutMs = 3000,
): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const pending = new Map(fams.map((f) => [f.family, f.weights]));
  const start = Date.now();
  while (pending.size > 0 && Date.now() - start < timeoutMs) {
    for (const [family, weights] of [...pending]) {
      try {
        await Promise.all(
          weights.map((w) => document.fonts.load(`${w} 16px "${family}"`, "Ag").catch(() => [])),
        );
        const ok = weights.every((w) => {
          try {
            return document.fonts.check(`${w} 16px "${family}"`);
          } catch {
            return true;
          }
        });
        if (ok) pending.delete(family);
      } catch {
        pending.delete(family);
      }
    }
    if (pending.size > 0) await new Promise((r) => setTimeout(r, 120));
  }
}

/* --------------------------------- context --------------------------------- */

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  fonts: Record<FontSlot, FontSelection>;
  setFont: (slot: FontSlot, sel: FontSelection) => void;
  tokens: PaletteTokens;
  setToken: (id: keyof PaletteTokens, hex: string) => void;
  radius: number;
  setRadius: (px: number) => void;
  preset: string;
  applyPreset: (name: string) => void;
  reset: () => void;
  /** Roll random fonts, a generative palette (light + dark), and radius. */
  randomize: () => void;
  /* fonts catalog */
  catalog: BunnyFont[];
  catalogLoading: boolean;
  ensureBunnyFont: (family: string) => void;
  /* local fonts */
  localFonts: LocalFontEntry[];
  localStatus: "idle" | "scanning" | "ready" | "denied" | "unsupported";
  scanLocalFonts: () => Promise<void>;
  localSupported: boolean;
  /** Load a scanned family's real font data into the page (blob → FontFace).
      Loads on first visibility and caches LRU-style (cap ~30 families).
      Returns true when at least one face registered. */
  ensureLocalFont: (family: string) => Promise<boolean>;
  /** Track whether a local family is currently on screen (shields it from
      LRU eviction while visible). */
  noteLocalVisible: (family: string, visible: boolean) => void;
  /* custom uploaded fonts */
  customFonts: string[];
  addCustomFont: (file: File) => Promise<string>;
  /* misc */
  stackFor: (slot: FontSlot) => string;
  exportCss: () => string;
  exportLightCss: () => string;
  exportDarkCss: () => string;
  exportTailwindCss: () => string;
  exportJson: () => string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/* --------------------------------- provider -------------------------------- */

const PREVIEW_TIER = [
  "Inter", "Manrope", "DM Sans", "Outfit", "Space Grotesk", "Sora",
  "Fraunces", "Playfair Display", "Lora", "IBM Plex Mono", "Caveat",
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [initial] = useState<PersistedTheme>(loadPersisted);
  const [mode, setMode] = useState<ThemeMode>(initial.mode);
  const [fonts, setFonts] = useState<Record<FontSlot, FontSelection>>(initial.fonts);
  const [light, setLight] = useState<PaletteTokens>(initial.light);
  const [dark, setDark] = useState<PaletteTokens>(initial.dark);
  const [preset, setPreset] = useState(initial.preset);
  const [radius, setRadiusState] = useState(initial.radius);

  const [catalog, setCatalog] = useState<BunnyFont[]>(CURATED_FONTS);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [loadedBunny, setLoadedBunny] = useState<string[]>(() => {
    const fams = new Set<string>([
      initial.fonts.display.source === "bunny" ? initial.fonts.display.family : "",
      initial.fonts.body.source === "bunny" ? initial.fonts.body.family : "",
      initial.fonts.code.source === "bunny" ? initial.fonts.code.family : "",
      ...PREVIEW_TIER,
    ].filter(Boolean));
    return [...fams];
  });
  const [localFonts, setLocalFonts] = useState<LocalFontEntry[]>([]);
  const [localStatus, setLocalStatus] = useState<"idle" | "scanning" | "ready" | "denied" | "unsupported">("idle");
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  /* Raw FontData entries (needed for blob() access). Never persisted —
     re-populated on every scan. */
  const localRaw = useRef<LocalFontData[]>([]);
  /* Loaded local faces + LRU bookkeeping. Blob data for hundreds of families
     would blow memory, so only recently-visible families stay registered;
     the rest are re-loaded on demand when scrolled back into view. */
  const LOCAL_FACE_LIMIT = 30;
  const localFaces = useRef(new Map<string, FontFace[]>());
  const localLastUsed = useRef(new Map<string, number>());
  const localVisible = useRef(new Set<string>());
  const localPending = useRef(new Map<string, Promise<boolean>>());
  const fontsRef = useRef(fonts);
  fontsRef.current = fonts;
  const linkRef = useRef<HTMLLinkElement | null>(null);

  const localSupported =
    typeof window !== "undefined" &&
    typeof (window as unknown as WindowWithFontAccess).queryLocalFonts === "function";

  /* full Bunny catalog (progressive enhancement over the curated list) */
  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    fetch("https://fonts.bunny.net/list")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json) return;
        const extras: BunnyFont[] = [];
        const curatedSlugs = new Set(CURATED_FONTS.map((f) => slugifyFamily(f.family)));
        const seen = new Set<string>(curatedSlugs);
        const push = (slug: string, displayName: string | undefined, rawCat?: string, rawWeights?: unknown) => {
          const key = slug.trim().toLowerCase();
          if (!key || seen.has(key)) return;
          seen.add(key);
          extras.push({
            family: displayName?.trim() || prettifySlug(key),
            category: mapBunnyCategory(rawCat),
            weights: pickBunnyWeights(rawWeights),
            slug: key,
          });
        };
        const infoOf = (v: unknown): { name?: string; cat?: string; weights?: unknown } => {
          if (!v || typeof v !== "object") return {};
          const o = v as Record<string, unknown>;
          const str = (x: unknown) => (typeof x === "string" ? x : undefined);
          return {
            name: str(o.familyName) ?? str(o.family) ?? str(o.name),
            cat: str(o.category) ?? str(o.type),
            weights: o.weights,
          };
        };
        if (Array.isArray(json)) {
          for (const item of json) {
            if (typeof item === "string") {
              push(item, undefined);
            } else if (item && typeof item === "object") {
              const info = infoOf(item);
              const o = item as Record<string, unknown>;
              const key =
                (typeof o.key === "string" && o.key) ||
                (typeof o.slug === "string" && o.slug) ||
                slugifyFamily(info.name ?? "");
              push(key, info.name, info.cat, info.weights);
            }
          }
        } else if (typeof json === "object") {
          for (const [name, info] of Object.entries(json)) {
            const meta = infoOf(info);
            push(name, meta.name, meta.cat, meta.weights);
          }
        }
        if (extras.length > 0) {
          extras.sort((a, b) => a.family.localeCompare(b.family));
          setCatalog([...CURATED_FONTS, ...extras]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* single Bunny stylesheet covering every family the user touches */
  useEffect(() => {
    const resolveEntry = (family: string): BunnyFont | undefined => {
      const lower = family.toLowerCase();
      return (
        catalog.find((f) => f.family.toLowerCase() === lower) ??
        catalog.find((f) => f.slug === lower || f.slug === slugifyFamily(family)) ??
        curatedOf(family)
      );
    };
    const fams = loadedBunny.map((family) => {
      const entry = resolveEntry(family);
      return {
        family: entry?.family ?? family,
        weights: entry?.weights ?? [400],
        slug: entry?.slug,
      };
    });
    const href = bunnyCssUrl(fams);
    let link = document.getElementById("pp-bunny-fonts") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "pp-bunny-fonts";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
    linkRef.current = link;
  }, [loadedBunny, catalog]);

  const ensureBunnyFont = useCallback((family: string) => {
    setLoadedBunny((prev) =>
      prev.some((f) => f.toLowerCase() === family.toLowerCase()) ? prev : [...prev, family],
    );
    // Warm the font so swapping has no flash of fallback.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.load(`16px "${family}"`).catch(() => {});
    }
  }, []);

  /* apply CSS variables live */
  const tokens = mode === "light" ? light : dark;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    const t = mode === "light" ? light : dark;
    const styleFor = (sel: FontSelection, fallbackCat?: FontCategory): string => {
      const lower = sel.family.toLowerCase();
      const entry =
        catalog.find((f) => f.family.toLowerCase() === lower) ??
        catalog.find((f) => f.slug === lower || f.slug === slugifyFamily(sel.family));
      const category =
        sel.source === "bunny"
          ? (fallbackCat ?? entry?.category ?? curatedOf(sel.family)?.category)
          : undefined;
      return cssStack(sel, category, entry?.slug);
    };
    const vars: Record<string, string> = {
      "--bg": t.bg, "--surface": t.surface, "--surface-2": t.surface2,
      "--text": t.text, "--muted": t.muted, "--border": t.border,
      "--primary": t.primary, "--primary-ink": t.primaryInk, "--accent": t.accent,
      "--radius": `${radius}px`,
      "--font-display": styleFor(fonts.display),
      "--font-body": styleFor(fonts.body),
      "--font-code": styleFor(fonts.code, "mono"),
    };
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  }, [mode, light, dark, fonts, radius, catalog]);

  /* persist */
  useEffect(() => {
    try {
      const payload: PersistedTheme = { mode, fonts, light, dark, preset, radius };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [mode, fonts, light, dark, preset, radius]);

  /* Register a scanned family's actual font data as @font-face rules, one
     per style entry (Regular / Bold / Italic …). This is what makes local
     fonts reliably render: instead of hoping the browser matches the bare
     family name against the OS, the page serves the bytes itself — exactly
     like a webfont. Loaded on demand per family and LRU-capped (never the
     actively selected fonts), not preloaded wholesale. */
  const ensureLocalFont = useCallback(async (family: string): Promise<boolean> => {
    const key = family.toLowerCase();
    if (localFaces.current.has(key)) {
      localLastUsed.current.set(key, Date.now());
      return true;
    }
    const pending = localPending.current.get(key);
    if (pending) return pending;
    const job = (async (): Promise<boolean> => {
      const entries = localRaw.current.filter((f) => f.family === family);
      if (entries.length === 0) return false;
      const faces: FontFace[] = [];
      for (const entry of entries) {
        try {
          const blob = await entry.blob();
          const url = URL.createObjectURL(blob);
          try {
            const { style, weight } = parseLocalStyle(entry.style);
            const loaded = await new FontFace(family, `url(${url})`, { style, weight }).load();
            document.fonts.add(loaded);
            faces.push(loaded);
          } finally {
            URL.revokeObjectURL(url);
          }
        } catch {
          /* skip unreadable faces, keep the rest */
        }
      }
      if (faces.length === 0) return false;
      localFaces.current.set(key, faces);
      localLastUsed.current.set(key, Date.now());
      // Evict least-recently-visible families over the cap — but never a
      // font the site is currently using, nor one on screen right now.
      const activeNow = new Set(
        (Object.values(fontsRef.current) as FontSelection[])
          .filter((f) => f.source === "local")
          .map((f) => f.family.toLowerCase()),
      );
      while (localFaces.current.size > LOCAL_FACE_LIMIT) {
        let oldest: string | null = null;
        let oldestT = Infinity;
        for (const [k, t] of localLastUsed.current) {
          if (activeNow.has(k) || localVisible.current.has(k)) continue;
          if (t < oldestT) {
            oldestT = t;
            oldest = k;
          }
        }
        if (!oldest) break;
        const victim = localFaces.current.get(oldest);
        if (victim) {
          try {
            for (const f of victim) document.fonts.delete(f);
          } catch {
            /* ignore */
          }
        }
        localFaces.current.delete(oldest);
        localLastUsed.current.delete(oldest);
      }
      return true;
    })();
    localPending.current.set(key, job);
    try {
      return await job;
    } finally {
      localPending.current.delete(key);
    }
  }, []);

  const noteLocalVisible = useCallback((family: string, visible: boolean) => {
    const key = family.toLowerCase();
    if (visible) localVisible.current.add(key);
    else localVisible.current.delete(key);
  }, []);

  const setFont = useCallback((slot: FontSlot, sel: FontSelection) => {
    if (sel.source === "bunny") {
      setLoadedBunny((prev) =>
        prev.some((f) => f.toLowerCase() === sel.family.toLowerCase()) ? prev : [...prev, sel.family],
      );
    }
    if (sel.source === "local") {
      void ensureLocalFont(sel.family);
    }
    setFonts((prev) => ({ ...prev, [slot]: sel }));
  }, [ensureLocalFont]);

  const setToken = useCallback((id: keyof PaletteTokens, hex: string) => {
    setPreset("Custom");
    if (mode === "light") setLight((prev) => ({ ...prev, [id]: hex }));
    else setDark((prev) => ({ ...prev, [id]: hex }));
  }, [mode]);

  const setRadius = useCallback((px: number) => {
    setRadiusState(Math.min(20, Math.max(0, Math.round(px))));
  }, []);

  const applyPreset = useCallback((name: string) => {
    const p = PRESET_PALETTES.find((x) => x.name === name);
    if (!p) return;
    setLight({ ...p.light });
    setDark({ ...p.dark });
    setPreset(name);
  }, []);

  const reset = useCallback(() => {
    const d = defaultPersisted();
    setMode(d.mode);
    setFonts(d.fonts);
    setLight(d.light);
    setDark(d.dark);
    setPreset(d.preset);
    setRadiusState(d.radius);
    setLoadedBunny([
      ...new Set([d.fonts.display.family, d.fonts.body.family, d.fonts.code.family, ...PREVIEW_TIER]),
    ]);
  }, []);

  const scanLocalFonts = useCallback(async () => {
    const w = window as unknown as WindowWithFontAccess;
    if (typeof w.queryLocalFonts !== "function") {
      setLocalStatus("unsupported");
      return;
    }
    setLocalStatus("scanning");
    try {
      const list = await w.queryLocalFonts();
      localRaw.current = list;
      const byFamily = new Map<string, Set<string>>();
      for (const f of list) {
        if (isUnusableFamily(f.family)) continue;
        if (!byFamily.has(f.family)) byFamily.set(f.family, new Set());
        byFamily.get(f.family)!.add(f.style || f.fullName);
      }
      const entries: LocalFontEntry[] = [...byFamily.entries()]
        .map(([family, styles]) => ({ family, styles: [...styles] }))
        .sort((a, b) => a.family.localeCompare(b.family));
      setLocalFonts(entries);
      setLocalStatus("ready");
    } catch {
      setLocalStatus("denied");
    }
  }, []);

  const addCustomFont = useCallback(async (file: File): Promise<string> => {
    const family = file.name.replace(/\.(woff2?|ttf|otf)$/i, "").replace(/[-_]+/g, " ");
    const buf = await file.arrayBuffer();
    const face = new FontFace(`"${family}"`, buf);
    const loaded = await face.load();
    document.fonts.add(loaded);
    setCustomFonts((prev) => (prev.includes(family) ? prev : [...prev, family]));
    return family;
  }, []);

  const stackFor = useCallback(
    (slot: FontSlot) => {
      const sel = fonts[slot];
      const lower = sel.family.toLowerCase();
      const entry =
        catalog.find((f) => f.family.toLowerCase() === lower) ??
        catalog.find((f) => f.slug === lower || f.slug === slugifyFamily(sel.family));
      if (slot === "code") return cssStack(sel, "mono", entry?.slug);
      return cssStack(
        sel,
        sel.source === "bunny" ? (entry?.category ?? curatedOf(sel.family)?.category) : undefined,
        entry?.slug,
      );
    },
    [fonts, catalog],
  );

  const tokenLines = (t: PaletteTokens) =>
    [
      `  --bg: ${t.bg};`, `  --surface: ${t.surface};`, `  --surface-2: ${t.surface2};`,
      `  --text: ${t.text};`, `  --muted: ${t.muted};`, `  --border: ${t.border};`,
      `  --primary: ${t.primary};`, `  --primary-ink: ${t.primaryInk};`, `  --accent: ${t.accent};`,
    ].join("\n");

  const fontLines = () =>
    `  --radius: ${radius}px;\n` +
    `  --font-display: ${stackFor("display")};\n  --font-body: ${stackFor("body")};\n` +
    `  --font-code: ${stackFor("code")};`;

  /** Unified file: light tokens on :root, dark tokens on [data-theme="dark"]. */
  const exportCss = useCallback(() => {
    return `:root {\n${tokenLines(light)}\n${fontLines()};\n}\n\n[data-theme="dark"] {\n${tokenLines(dark)}\n}`;
  }, [light, dark, radius, stackFor]);

  const exportLightCss = useCallback(() => {
    return `/* PixelPalette light theme — use as :root */\n:root {\n${tokenLines(light)}\n${fontLines()};\n}`;
  }, [light, radius, stackFor]);

  const exportDarkCss = useCallback(() => {
    return `/* PixelPalette dark theme — use as :root or [data-theme="dark"] */\n:root {\n${tokenLines(dark)}\n${fontLines()};\n}`;
  }, [dark, radius, stackFor]);

  /** Tailwind v4 tokens (light values; pair with the full CSS for dark mode). */
  const exportTailwindCss = useCallback(() => {
    const t = light;
    return (
      `/* PixelPalette theme for Tailwind v4 — paste into your CSS */\n@theme {\n` +
      `  --color-background: ${t.bg};\n  --color-surface: ${t.surface};\n` +
      `  --color-raised: ${t.surface2};\n  --color-ink: ${t.text};\n` +
      `  --color-muted: ${t.muted};\n  --color-line: ${t.border};\n` +
      `  --color-primary: ${t.primary};\n  --color-on-primary: ${t.primaryInk};\n` +
      `  --color-accent: ${t.accent};\n  --radius: ${radius}px;\n` +
      `  --font-display: ${stackFor("display")};\n  --font-body: ${stackFor("body")};\n` +
      `  --font-code: ${stackFor("code")};\n}`
    );
  }, [light, radius, stackFor]);

  const exportJson = useCallback(() => {
    return JSON.stringify(
      {
        name: "pixelpalette-theme",
        radius,
        fonts: {
          display: fonts.display,
          body: fonts.body,
          code: fonts.code,
        },
        light,
        dark,
      },
      null,
      2,
    );
  }, [light, dark, radius, fonts]);

  const randomize = useCallback(async () => {
    // — fonts: the full live catalog; scanned locals join the pool automatically —
    const bunnyNames = (cats: FontCategory[]) =>
      catalog.filter((f) => cats.includes(f.category)).map((f) => f.family);
    const locals = localFonts.map((f) => f.family);
    const choose = (bunnyPool: string[], fallback: FontSelection): FontSelection => {
      const pool: FontSelection[] = [
        ...bunnyPool.map((family) => ({ source: "bunny" as const, family })),
        ...locals.map((family) => ({ source: "local" as const, family })),
      ];
      return pool.length > 0 ? pickOne(pool) : fallback;
    };
    const current = fontsRef.current;
    const displaySel = choose(bunnyNames(["display", "serif", "sans"]), current.display);
    const bodySel = choose(bunnyNames(["sans", "serif"]), current.body);
    const codeSel = choose(bunnyNames(["mono"]), current.code);

    // — colors + radius have no fetch involved: apply instantly for feedback —
    const hP = randInt(0, 359);
    const hA = shiftHue(hP, pickOne([30, -30, 150, 180, 210, 120, 0]));
    const sat = rand(55, 95);
    const mk = (h: number, s: number, l: number) =>
      hslToHex(Math.round(h), Math.round(s), Math.round(l));
    const pL = fitPrimary(hP, sat, rand(38, 54));
    setLight({
      bg: mk(hP, rand(8, 22), rand(95, 98)),
      surface: mk(hP, rand(10, 25), 99),
      surface2: mk(hP, rand(10, 25), rand(90, 94)),
      text: mk(hP, rand(15, 35), rand(10, 16)),
      muted: mk(hP, rand(10, 25), rand(28, 36)),
      border: mk(hP, rand(10, 25), rand(83, 90)),
      primary: pL.hex,
      primaryInk: pL.ink,
      accent: mk(hA, rand(55, 90), rand(40, 55)),
    });
    const pD = fitPrimary(hP, Math.min(95, sat + 5), rand(62, 74));
    setDark({
      bg: mk(hP, rand(15, 30), rand(5, 9)),
      surface: mk(hP, rand(15, 30), rand(10, 14)),
      surface2: mk(hP, rand(15, 30), rand(16, 22)),
      text: mk(hP, rand(8, 20), rand(90, 96)),
      muted: mk(hP, rand(10, 25), rand(58, 70)),
      border: mk(hP, rand(12, 25), rand(17, 24)),
      primary: pD.hex,
      primaryInk: pD.ink,
      accent: mk(hA, rand(60, 95), rand(62, 74)),
    });
    setPreset("Custom");
    setRadiusState(randInt(0, 20));

    // — fonts swap only once the data is here: register webfonts, warm them,
    //   await local blobs — so the old type stays until the new one can render
    const bunnySpec = (family: string): { family: string; weights: number[] } => {
      const lower = family.toLowerCase();
      const entry =
        catalog.find((f) => f.family.toLowerCase() === lower) ??
        catalog.find((f) => f.slug === lower || f.slug === slugifyFamily(family));
      return { family: entry?.family ?? family, weights: entry?.weights ?? [400, 500, 600, 700] };
    };
    const bunnyFams = [displaySel, bodySel, codeSel]
      .filter((s) => s.source === "bunny")
      .map((s) => bunnySpec(s.family));
    if (bunnyFams.length > 0) {
      setLoadedBunny((prev) => {
        const next = [...prev];
        for (const f of bunnyFams) {
          if (!next.some((x) => x.toLowerCase() === f.family.toLowerCase())) next.push(f.family);
        }
        return next;
      });
      await warmBunnyFaces(bunnyFams);
    }
    for (const sel of [displaySel, bodySel, codeSel]) {
      if (sel.source === "local") await ensureLocalFont(sel.family);
    }
    setFont("display", displaySel);
    setFont("body", bodySel);
    setFont("code", codeSel);
  }, [catalog, localFonts, setFont, ensureLocalFont]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode, setMode,
      toggleMode: () => setMode((m) => (m === "light" ? "dark" : "light")),
      fonts, setFont, tokens, setToken, radius, setRadius,
      preset, applyPreset, reset, randomize,
      catalog, catalogLoading, ensureBunnyFont,
      localFonts, localStatus, scanLocalFonts, localSupported, ensureLocalFont, noteLocalVisible,
      customFonts, addCustomFont, stackFor, exportCss,
      exportLightCss, exportDarkCss, exportTailwindCss, exportJson,
    }),
    [mode, fonts, tokens, radius, preset, catalog, catalogLoading, ensureBunnyFont,
      localFonts, localStatus, scanLocalFonts, localSupported, ensureLocalFont, noteLocalVisible,
      customFonts, addCustomFont,
      stackFor, exportCss, exportLightCss, exportDarkCss, exportTailwindCss, exportJson,
      setFont, setToken, setRadius, applyPreset, reset, randomize],
  );

  void linkRef;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
