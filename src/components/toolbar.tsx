import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { contrastLabel, contrastRatio, hexToHsl, hslToHex, normalizeHex } from "../lib/color";
import {
  FONT_CATEGORIES,
  PRESET_PALETTES,
  TOKEN_LABELS,
  type BunnyFont,
  type FontCategory,
  type PaletteTokens,
} from "../lib/data";
import { useTheme, type FontSlot } from "../lib/theme";
import { verifyLocalFont } from "../lib/fontcheck";

/* ------------------------------------------------------------------ */
/*  Floating toolbar. Lives at the bottom of the viewport and edits the */
/*  same CSS variables the site (and the toolbar itself) is styled with.*/
/* ------------------------------------------------------------------ */

type Panel = null | FontSlot | "colors" | "menu";

const SLOT_META: Record<FontSlot, { label: string; sample: string }> = {
  display: { label: "Display", sample: "Ag" },
  body: { label: "Body", sample: "Ag" },
  code: { label: "Code", sample: "{;}" },
};

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
function DiceIcon() {
  const pip = (cx: number, cy: number) => (
    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" fill="currentColor" stroke="none" />
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      {pip(8.2, 8.2)}{pip(15.8, 8.2)}{pip(12, 12)}{pip(8.2, 15.8)}{pip(15.8, 15.8)}
    </svg>
  );
}

/* ------------------------- lazy font preview row ------------------------ */

function useVisible<T extends HTMLElement>(rootMargin = "200px", once = true) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once]);
  return { ref, visible };
}

function BunnyRow({ font, active, onPick }: { font: BunnyFont; active: boolean; onPick: () => void }) {
  const theme = useTheme();
  const { ref, visible } = useVisible<HTMLButtonElement>();
  useEffect(() => {
    if (visible) theme.ensureBunnyFont(font.family);
  }, [visible, font.family, theme]);
  // Preview against both the display name and the API slug — the served
  // @font-face uses one of them.
  const previewStack =
    font.slug && font.slug.toLowerCase() !== font.family.toLowerCase()
      ? `"${font.family}", ${font.slug}, sans-serif`
      : `"${font.family}", sans-serif`;
  return (
    <button ref={ref} onClick={onPick}
      className="w-full flex items-center gap-3.5 px-4 py-2.5 text-left hover-tint"
      style={active ? { background: "var(--surface-2)" } : undefined}>
      <span className="w-9 h-9 grid place-content-center t-chip text-lg flex-none"
        style={visible ? { fontFamily: previewStack } : undefined}>
        Ag
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold truncate"
          style={visible ? { fontFamily: previewStack } : undefined}>
          {font.family}
        </span>
        <span className="block text-[11px] t-muted capitalize">{font.category}</span>
      </span>
      {active && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)"
          strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}

/* Local rows load their real font data when scrolled into view (with
   overscan, so the style is already there as you scroll) and report
   visibility so the LRU cache never evicts what's on screen. */
function LocalFontRow({ family, styles, active, onPick }: {
  family: string; styles: string[]; active: boolean; onPick: () => void;
}) {
  const theme = useTheme();
  const { ref, visible } = useVisible<HTMLButtonElement>("400px", false);
  useEffect(() => {
    theme.noteLocalVisible(family, visible);
    if (visible) void theme.ensureLocalFont(family);
    return () => theme.noteLocalVisible(family, false);
  }, [visible, family, theme]);
  return (
    <button ref={ref} onClick={onPick}
      className="w-full flex items-center gap-3.5 px-4 py-2.5 text-left hover-tint"
      style={active ? { background: "var(--surface-2)" } : undefined}>
      <span className="text-lg w-9 text-center flex-none"
        style={visible ? { fontFamily: `"${family}"` } : undefined}>Ag</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold truncate"
          style={visible ? { fontFamily: `"${family}"` } : undefined}>{family}</span>
        <span className="block text-[11px] t-muted">{styles.length} style{styles.length === 1 ? "" : "s"}</span>
      </span>
      {active && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)"
          strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}

/* -------------------------------- font panel ---------------------------- */

type FontTab = "bunny" | "installed" | "upload";

function FontPanel({ slot, onDone }: { slot: FontSlot; onDone: () => void }) {
  const theme = useTheme();
  const [tab, setTab] = useState<FontTab>("bunny");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FontCategory | "all">("all");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const bunnyResults = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return theme.catalog
      .filter((f) => (cat === "all" ? true : f.category === cat))
      .filter((f) =>
        needle
          ? f.family.toLowerCase().includes(needle) || (f.slug ?? "").includes(needle)
          : true,
      )
      .slice(0, 90);
  }, [theme.catalog, q, cat]);

  const localResults = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return theme.localFonts
      .filter((f) => (needle ? f.family.toLowerCase().includes(needle) : true))
      .slice(0, 90);
  }, [theme.localFonts, q]);

  const pick = (family: string, source: "bunny" | "local" | "custom") => {
    theme.setFont(slot, { source, family });
  };

  /* Installed fonts fail silently when the browser can't activate them for
     web rendering — load the real data first, verify, and say so instead
     of doing nothing. */
  const [blockedFont, setBlockedFont] = useState<string | null>(null);
  const [loadingFamily, setLoadingFamily] = useState<string | null>(null);
  const verifyId = useRef(0);
  useEffect(() => {
    setBlockedFont(null);
    setLoadingFamily(null);
    verifyId.current++;
  }, [slot]);
  const pickLocal = (family: string) => {
    pick(family, "local");
    setBlockedFont(null);
    setLoadingFamily(family);
    const id = ++verifyId.current;
    void theme.ensureLocalFont(family).then(async (loaded) => {
      const ok = loaded && (await verifyLocalFont(family));
      if (id !== verifyId.current) return;
      setLoadingFamily(null);
      if (!ok) setBlockedFont(family);
    });
  };

  const onFile = async (file: File | undefined) => {
    setUploadError("");
    if (!file) return;
    if (!/\.(woff2?|ttf|otf)$/i.test(file.name)) {
      setUploadError("That file type is not supported. Use .woff, .woff2, .ttf, or .otf.");
      return;
    }
    try {
      const family = await theme.addCustomFont(file);
      pick(family, "custom");
      onDone();
    } catch {
      setUploadError("Could not load that font file. It may be corrupt.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-5 pt-5 pb-3.5">
        <div>
          <div className="font-display font-semibold leading-tight">{SLOT_META[slot].label} font</div>
          <div className="text-xs t-muted">
            Current — <span style={{ fontFamily: theme.stackFor(slot) }}>{theme.fonts[slot].family}</span>
            {loadingFamily && <span> · loading…</span>}
          </div>
        </div>
        <div className="flex t-surface-2 p-0.5 text-xs font-semibold"
          role="tablist" aria-label="Font source"
          style={{ borderRadius: "calc(var(--radius) * 0.5)" }}>
          {(["bunny", "installed", "upload"] as FontTab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className="px-2.5 py-1.5 capitalize"
              style={{
                borderRadius: "calc(var(--radius) * 0.4)",
                background: tab === t ? "var(--surface)" : "transparent",
                boxShadow: tab === t ? "0 1px 2px rgb(0 0 0 / .12)" : "none",
              }}>
              {t === "bunny" ? "Bunny" : t}
            </button>
          ))}
        </div>
      </div>

      {/* fixed-height tab body: all three sources share one size, so
          switching never resizes the popup (shorter tabs get breathing room) */}
      <div className="h-[340px]">
      {tab === "bunny" && (
        <div className="h-full flex flex-col">
          <div className="px-5 pb-3 flex gap-2">
            <div className="t-input flex items-center gap-2 px-3 py-1.5 flex-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2} strokeLinecap="round" className="t-muted">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" />
              </svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fonts…"
                aria-label="Search Bunny fonts" className="bg-transparent outline-none text-sm w-full" />
              {q && (
                <button onClick={() => setQ("")} className="t-muted text-sm leading-none" aria-label="Clear search">×</button>
              )}
            </div>
          </div>
          <div className="px-5 pb-3 flex flex-wrap gap-1.5">
            {FONT_CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className="text-xs font-semibold px-2.5 py-1"
                style={{
                  borderRadius: "calc(var(--radius) * 0.5)",
                  background: cat === c.id ? "var(--primary)" : "var(--surface-2)",
                  color: cat === c.id ? "var(--primary-ink)" : "var(--text)",
                }}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="t-scroll overflow-y-auto flex-1 min-h-0 border-t t-border py-1" role="listbox" aria-label="Bunny fonts">
            {bunnyResults.map((f) => (
              <BunnyRow key={f.family} font={f}
                active={theme.fonts[slot].source === "bunny" && theme.fonts[slot].family === f.family}
                onPick={() => { pick(f.family, "bunny"); }} />
            ))}
            {bunnyResults.length === 0 && (
              <p className="text-sm t-muted text-center py-8">No fonts match “{q}”.</p>
            )}
          </div>
          <p className="px-5 py-2 text-[11px] t-muted border-t t-border">
            {theme.catalogLoading ? "Loading full catalog…" : `${theme.catalog.length} families`} · served by fonts.bunny.net
          </p>
        </div>
      )}

      {tab === "installed" && (
        <div className="px-5 pb-4 h-full flex flex-col">
          {theme.localStatus === "idle" && (
            <div className="t-surface-2 p-4 text-sm my-auto" style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
              <p className="font-semibold mb-1">Use fonts installed on this device</p>
              <p className="t-muted text-[13px] leading-relaxed">
                Scan your system library and apply any of them to the site.
                Your browser asks for permission once — nothing leaves your device.
                {theme.fonts[slot].source === "local" && (
                  <span className="block mt-1.5 font-semibold t-text">
                    “{theme.fonts[slot].family}” is still selected from last time — scan again to reload it.
                  </span>
                )}
              </p>
              {!theme.localSupported && (
                <p className="text-[13px] mt-2" style={{ color: "var(--warning)" }}>
                  This browser does not expose installed fonts. Try Chrome or Edge on desktop.
                </p>
              )}
              <button onClick={() => void theme.scanLocalFonts()} disabled={!theme.localSupported}
                className="t-btn t-btn-primary px-4 py-2 text-sm mt-3 disabled:opacity-50">
                Scan installed fonts
              </button>
            </div>
          )}
          {theme.localStatus === "scanning" && (
            <div className="flex-1 flex items-center gap-3 justify-center text-sm t-muted">
              <svg className="pp-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.2-8.56" />
              </svg>
              Reading your font library…
            </div>
          )}
          {theme.localStatus === "denied" && (
            <div className="p-4 text-sm my-auto" style={{ borderRadius: "calc(var(--radius) * 0.66)", background: "color-mix(in srgb, var(--danger) 10%, transparent)" }}>
              <p className="font-semibold">Permission was not granted</p>
              <p className="t-muted text-[13px] mt-0.5">The browser blocked access to installed fonts. You can try again — nothing is stored.</p>
              <button onClick={() => void theme.scanLocalFonts()} className="t-btn t-btn-outline px-4 py-2 text-sm mt-3">
                Try again
              </button>
            </div>
          )}
          {theme.localStatus === "unsupported" && (
            <p className="text-sm t-muted m-auto text-center">Installed-font access is not available in this browser.</p>
          )}
          {theme.localStatus === "ready" && (
            <>
              {blockedFont && (
                <div className="mb-2 p-3 text-[13px] leading-relaxed"
                  style={{ borderRadius: "calc(var(--radius) * 0.66)", background: "color-mix(in srgb, var(--danger) 10%, transparent)" }}>
                  <span className="font-semibold">“{blockedFont}” isn't rendering. </span>
                  <span className="t-muted">This system font lists fine but your browser won't activate it for web pages — nothing was transferred, it just can't be used. Try another, or pick the same style from Bunny.</span>
                </div>
              )}
              <div className="t-input flex items-center gap-2 px-3 py-1.5 mb-2">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter installed fonts…"
                  aria-label="Filter installed fonts" className="bg-transparent outline-none text-sm w-full" />
                {q && <button onClick={() => setQ("")} className="t-muted text-sm leading-none" aria-label="Clear filter">×</button>}
              </div>
              <div className="t-scroll overflow-y-auto flex-1 min-h-0 border t-border py-1"
                style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
                {localResults.map((f) => (
                  <LocalFontRow key={f.family} family={f.family} styles={f.styles}
                    active={theme.fonts[slot].source === "local" && theme.fonts[slot].family === f.family}
                    onPick={() => pickLocal(f.family)} />
                ))}
                {localResults.length === 0 && (
                  <p className="text-sm t-muted text-center py-8">No installed fonts match.</p>
                )}
              </div>
              <button onClick={() => void theme.scanLocalFonts()} className="text-xs t-muted hover:underline mt-2">
                Re-scan library ({theme.localFonts.length} found)
              </button>
            </>
          )}
        </div>
      )}

      {tab === "upload" && (
        <div className="px-5 pb-4 h-full flex flex-col">
          <button onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed t-border p-5 text-sm t-muted hover-primary mt-1"
            style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
            <span className="block font-semibold t-text">Drop a font file, or click to browse</span>
            <span className="block text-xs mt-1">.woff · .woff2 · .ttf · .otf — kept in this tab only</span>
          </button>
          <input ref={fileRef} type="file" accept=".woff,.woff2,.ttf,.otf" className="hidden"
            onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
          {uploadError && <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>{uploadError}</p>}
          {theme.customFonts.length > 0 && (
            <div className="mt-3 flex-1 min-h-0 overflow-y-auto t-scroll">
              <div className="text-xs font-semibold t-muted uppercase tracking-wide mb-1.5">Uploaded</div>
              {theme.customFonts.map((f) => {
                const active = theme.fonts[slot].source === "custom" && theme.fonts[slot].family === f;
                return (
                  <button key={f} onClick={() => pick(f, "custom")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left t-surface-2 mb-1.5"
                    style={{ borderRadius: "calc(var(--radius) * 0.5)", outline: active ? "2px solid var(--primary)" : "none" }}>
                    <span className="text-lg" style={{ fontFamily: `"${f}"` }}>Ag</span>
                    <span className="text-sm font-semibold truncate" style={{ fontFamily: `"${f}"` }}>{f}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

/* ------------------------------- color panel ------------------------------ */

function Slider({ label, value, min, max, onChange, hue }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; hue?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs mb-1">
        <span className="t-muted font-semibold">{label}</span>
        <span className="font-code">{value}</span>
      </span>
      <input type="range" min={min} max={max} value={value} aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`t-range w-full ${hue ? "t-hue" : ""}`}
        style={hue ? undefined : { ["--fill" as string]: `${((value - min) / (max - min)) * 100}%` }} />
    </label>
  );
}

function TokenEditor({ tokenId, onBack }: { tokenId: keyof PaletteTokens; onBack: () => void }) {
  const theme = useTheme();
  const meta = TOKEN_LABELS.find((t) => t.id === tokenId)!;
  const hex = theme.tokens[tokenId];
  const [draft, setDraft] = useState(hex);
  const [hexError, setHexError] = useState("");

  useEffect(() => setDraft(theme.tokens[tokenId]), [theme.tokens, tokenId]);

  const commit = (h: string) => {
    const n = normalizeHex(h);
    if (!n) { setHexError("Use a 3 or 6 digit hex, e.g. #4f46e5."); return; }
    setHexError("");
    theme.setToken(tokenId, n);
  };

  const hsl = hexToHsl(normalizeHex(draft) ?? hex);
  const setHsl = (patch: Partial<{ h: number; s: number; l: number }>) => {
    const next = hslToHex(patch.h ?? hsl.h, patch.s ?? hsl.s, patch.l ?? hsl.l);
    setDraft(next);
    theme.setToken(tokenId, next);
  };

  const compareWith = tokenId === "bg" ? theme.tokens.text : theme.tokens.bg;
  const ratio = contrastRatio(normalizeHex(draft) ?? hex, compareWith);

  const scale = [12, 24, 36, 50, 64, 78, 88].map((l) => hslToHex(hsl.h, Math.max(hsl.s, 35), l));
  const eyeSupported = typeof window !== "undefined" && "EyeDropper" in window;

  const pickScreen = async () => {
    try {
      const eye = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
      const res = await eye.open();
      setDraft(res.sRGBHex);
      commit(res.sRGBHex);
    } catch { /* user cancelled */ }
  };

  return (
    <div className="px-5 pb-5">
      <button onClick={onBack} className="text-xs font-semibold t-muted hover:underline mb-2">← All colors</button>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-12 h-12 border t-border flex-none"
          style={{ background: normalizeHex(draft) ?? hex, borderRadius: "calc(var(--radius) * 0.5)" }} />
        <div className="min-w-0">
          <div className="font-semibold text-sm">{meta.label}</div>
          <div className="text-xs t-muted">{meta.hint}</div>
          <div className="font-code text-xs mt-0.5">{normalizeHex(draft) ?? hex} · {contrastLabel(ratio)} {ratio.toFixed(1)}:1 vs {tokenId === "bg" ? "text" : "background"}</div>
        </div>
        {eyeSupported && (
          <button onClick={() => void pickScreen()} title="Pick from screen"
            className="t-btn t-btn-outline ml-auto w-9 h-9 grid place-content-center flex-none" aria-label="Pick color from screen">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 22 1-4 9.5-9.5 3 3L6 21l-4 1Z" /><path d="M14.5 5.5 18 2l4 4-3.5 3.5" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex gap-2 mb-4">
        {scale.map((s) => (
          <button key={s} onClick={() => { setDraft(s); theme.setToken(tokenId, s); }}
            aria-label={`Use ${s}`} title={s}
            className="flex-1 h-8 border t-border first:rounded-l-lg last:rounded-r-lg"
            style={{ background: s }} />
        ))}
      </div>
      <div className="space-y-4">
        <Slider label="Hue" value={hsl.h} min={0} max={360} hue onChange={(h) => setHsl({ h })} />
        <Slider label="Saturation" value={hsl.s} min={0} max={100} onChange={(s) => setHsl({ s })} />
        <Slider label="Lightness" value={hsl.l} min={0} max={100} onChange={(l) => setHsl({ l })} />
        <label className="block">
          <span className="block text-xs t-muted font-semibold mb-1">Hex</span>
          <span className="t-input flex items-center gap-2 px-3">
            <span className="w-5 h-5 rounded border t-border flex-none"
              style={{ background: normalizeHex(draft) ?? "transparent" }} />
            <input value={draft} onChange={(e) => { setDraft(e.target.value); if (normalizeHex(e.target.value)) setHexError(""); }}
              onBlur={() => commit(draft)}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              spellCheck={false} placeholder="#4f46e5"
              aria-label={`${meta.label} hex value`}
              className="font-code text-sm bg-transparent outline-none w-full py-2 uppercase" />
          </span>
          {hexError && <span className="text-xs" style={{ color: "var(--danger)" }}>{hexError}</span>}
        </label>
      </div>
    </div>
  );
}

function ColorsPanel() {
  const theme = useTheme();
  const [editing, setEditing] = useState<keyof PaletteTokens | null>(null);

  if (editing) {
    return <TokenEditor tokenId={editing} onBack={() => setEditing(null)} />;
  }

  return (
    <div className="px-5 pb-5">
      <div className="pt-5 pb-3 font-display font-semibold">Color palette</div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {PRESET_PALETTES.map((p) => {
          const t = theme.mode === "light" ? p.light : p.dark;
          const active = theme.preset === p.name;
          return (
            <button key={p.name} onClick={() => theme.applyPreset(p.name)}
              className="text-left p-3 border t-border hover:border-current"
              style={{
                borderRadius: "calc(var(--radius) * 0.5)",
                outline: active ? "2px solid var(--primary)" : "none",
                outlineOffset: 1,
              }}>
              <span className="flex gap-1 mb-1.5">
                {[t.bg, t.primary, t.accent, t.text].map((c, i) => (
                  <span key={`${c}-${i}`} className="w-5 h-5 rounded-full border t-border" style={{ background: c }} />
                ))}
              </span>
              <span className="block text-xs font-semibold leading-none">{p.name}</span>
              <span className="block text-[10px] t-muted mt-0.5">{active ? "Active" : `${theme.mode} tones`}</span>
            </button>
          );
        })}
      </div>
      <div className="text-xs font-semibold t-muted uppercase tracking-wide mb-1.5">
        Fine-tune · {theme.mode} mode
      </div>
      <ul className="border t-border divide-y" style={{ borderRadius: "calc(var(--radius) * 0.66)", overflow: "hidden" }}>
        {TOKEN_LABELS.map((t) => (
          <li key={t.id}>
            <button onClick={() => setEditing(t.id)}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 text-left hover-tint">
              <span className="w-7 h-7 rounded-full border t-border flex-none"
                style={{ background: theme.tokens[t.id] }} />
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold leading-tight">{t.label}</span>
                <span className="block text-[11px] t-muted leading-tight">{t.hint}</span>
              </span>
              <span className="font-code text-[11px] t-muted uppercase">{theme.tokens[t.id]}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="t-muted">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <label className="block mt-5">
        <span className="flex justify-between text-xs mb-1">
          <span className="t-muted font-semibold">Corner radius</span>
          <span className="font-code">{theme.radius}px</span>
        </span>
        <input type="range" min={0} max={20} value={theme.radius} aria-label="Corner radius"
          onChange={(e) => theme.setRadius(Number(e.target.value))}
          className="t-range w-full" style={{ ["--fill" as string]: `${(theme.radius / 20) * 100}%` }} />
      </label>
    </div>
  );
}

/* -------------------------------- menu panel ------------------------------ */

function MenuPanel({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const [exportOpen, setExportOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copiedTimer = useRef<number | null>(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };
  const markCopied = (id: string) => {
    setCopiedId(id);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopiedId(null), 1600);
  };
  const doCopy = (id: string, text: string) => {
    void copyText(text).then(() => markCopied(id));
  };
  const downloadCss = () => {
    const blob = new Blob([theme.exportCss()], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pixelpalette-theme.css";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    markCopied("download");
  };

  const exports: { id: string; title: string; hint: string; run: () => void }[] = [
    { id: "light", title: "Light theme CSS", hint: ":root variables, light tokens", run: () => doCopy("light", theme.exportLightCss()) },
    { id: "dark", title: "Dark theme CSS", hint: ":root variables, dark tokens", run: () => doCopy("dark", theme.exportDarkCss()) },
    { id: "full", title: "Full theme CSS", hint: "light + dark-mode override", run: () => doCopy("full", theme.exportCss()) },
    { id: "tailwind", title: "Tailwind v4 @theme", hint: "paste into your CSS", run: () => doCopy("tailwind", theme.exportTailwindCss()) },
    { id: "json", title: "Design tokens JSON", hint: "light, dark, fonts, radius", run: () => doCopy("json", theme.exportJson()) },
    { id: "download", title: "Download .css file", hint: "pixelpalette-theme.css", run: downloadCss },
  ];

  const rowStyle = { borderRadius: "calc(var(--radius) * 0.5)" };
  return (
    <div className="p-3">
      <button onClick={() => setExportOpen((o) => !o)} aria-expanded={exportOpen}
        className="w-full flex items-center gap-3 px-3 py-3 text-left hover-tint" style={rowStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5m-5 5V3" />
        </svg>
        <span className="flex-1">
          <span className="block text-sm font-semibold">Export theme</span>
          <span className="block text-xs t-muted">CSS, Tailwind, JSON, file</span>
        </span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="t-muted"
          style={{ transform: exportOpen ? "rotate(180deg)" : "none" }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {exportOpen && (
        <ul className="ml-4 pl-3 border-l my-1 space-y-0.5" style={{ borderColor: "var(--border)" }}>
          {exports.map((e) => (
            <li key={e.id}>
              <button onClick={e.run}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover-tint" style={rowStyle}>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight">
                    {copiedId === e.id ? (e.id === "download" ? "Saved" : "Copied to clipboard") : e.title}
                  </span>
                  <span className="block text-[11px] t-muted leading-tight">{e.hint}</span>
                </span>
                {copiedId === e.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)"
                    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => { theme.toggleMode(); }}
        className="w-full flex items-center gap-3 px-3 py-3 text-left hover-tint"
        style={{ borderRadius: "calc(var(--radius) * 0.5)" }}>
        {theme.mode === "light" ? <MoonIcon /> : <SunIcon />}
        <span>
          <span className="block text-sm font-semibold">Switch to {theme.mode === "light" ? "dark" : "light"}</span>
          <span className="block text-xs t-muted">Each mode keeps its own palette</span>
        </span>
      </button>
      <div className="border-t t-border my-1" />
      <button onClick={() => { theme.reset(); onClose(); }}
        className="w-full flex items-center gap-3 px-3 py-3 text-left hover-tint"
        style={{ borderRadius: "calc(var(--radius) * 0.5)", color: "var(--danger)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
        </svg>
        <span>
          <span className="block text-sm font-semibold">Reset everything</span>
          <span className="block text-xs opacity-70">Back to the default style</span>
        </span>
      </button>
    </div>
  );
}

/* ------------------------- animated popup height ------------------------ */
/* Measures the panel body and tweens `height` so switching tabs/sections
   (which have different natural heights) resizes smoothly instead of
   jumping. The observer persists across tab switches, so every content
   swap animates from the previous height. */
function AnimatedHeight({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      const cap = Math.floor(window.innerHeight * 0.62);
      setHeight(Math.min(el.offsetHeight, cap));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="t-scroll" style={{
      height: height ?? "auto",
      maxHeight: "62vh",
      overflowY: "auto",
      overflowX: "hidden",
      transition: height == null ? "none" : "height 0.25s var(--ease-out)",
    }}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

/* --------------------------------- toolbar -------------------------------- */

export default function Toolbar() {
  const theme = useTheme();
  const [panel, setPanel] = useState<Panel>(null);
  const [diceTurns, setDiceTurns] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p));

  const dockBtn =
    "flex flex-col items-start py-2 min-w-0 text-left hover-tint transition-colors";

  return (
    <>
      {panel && <div className="fixed inset-0 z-40" onClick={() => setPanel(null)} />}
      <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-fit">
          {panel && (
            <div className="pp-panel pp-origin-bottom t-dock mb-3 w-[min(94vw,444px)] mx-auto max-h-[62vh] overflow-hidden flex flex-col"
              role="dialog" aria-label="Style editor"
              style={{ borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
              <AnimatedHeight>
                {panel !== null && panel !== "colors" && panel !== "menu" && (
                  <FontPanel slot={panel} onDone={() => setPanel(null)} />
                )}
                {panel === "colors" && <ColorsPanel />}
                {panel === "menu" && <MenuPanel onClose={() => setPanel(null)} />}
              </AnimatedHeight>
            </div>
          )}
          <div className="t-dock mx-auto flex flex-wrap sm:flex-nowrap items-stretch max-w-full overflow-x-auto t-scroll"
            role="toolbar" aria-label="Style toolbar"
            style={{ borderRadius: "calc(var(--radius) + 6px)", boxShadow: "var(--shadow)" }}>
            {(["display", "body", "code"] as FontSlot[]).map((slot) => (
              <button key={slot} onClick={() => toggle(slot)} aria-expanded={panel === slot}
                className={`${dockBtn} flex-1 min-w-0 px-3 sm:px-4 sm:w-36 sm:flex-none`}
                style={panel === slot ? { background: "var(--surface-2)" } : undefined}>
                <span className="text-[10px] font-bold uppercase tracking-widest t-muted leading-none mt-1">
                  {SLOT_META[slot].label}
                </span>
                <span className="text-sm font-semibold truncate w-full leading-tight mt-0.5"
                  style={{ fontFamily: theme.stackFor(slot) }}>
                  {theme.fonts[slot].family}
                </span>
              </button>
            ))}
            {/* line break: fonts on row one, controls on row two (mobile only) */}
            <div className="basis-full h-0 sm:hidden" aria-hidden="true" />
            <div className="w-px t-border my-3 mx-2 flex-none hidden sm:block" style={{ background: "var(--border)" }} />
            <button onClick={() => toggle("colors")} aria-expanded={panel === "colors"}
              className={`${dockBtn} items-center flex-1 min-w-0 px-3 sm:px-4 sm:flex-none`}
              style={panel === "colors" ? { background: "var(--surface-2)" } : undefined}>
              <span className="text-[10px] font-bold uppercase tracking-widest t-muted leading-none mt-1">Palette</span>
              <span className="flex items-center gap-1.5 mt-1">
                <span className="flex -space-x-1">
                  {[theme.tokens.primary, theme.tokens.accent, theme.tokens.bg].map((c) => (
                    <span key={c} className="w-4 h-4 rounded-full border t-border" style={{ background: c }} />
                  ))}
                </span>
                <span className="text-sm font-semibold leading-none block w-[4.5rem] truncate">{theme.preset}</span>
              </span>
            </button>
            <div className="w-px my-3 mx-2 flex-none hidden sm:block" style={{ background: "var(--border)" }} />
            <button onClick={() => { theme.randomize(); setDiceTurns((t) => t + 1); }}
              title="Surprise me — randomize fonts, palette and corners"
              aria-label="Randomize style"
              className="px-4 grid place-content-center hover-tint flex-none">
              <span style={{
                display: "inline-flex",
                transform: `rotate(${diceTurns * 180}deg)`,
                transition: "transform 0.45s var(--ease-out)",
              }}>
                <DiceIcon />
              </span>
            </button>
            <button onClick={() => theme.toggleMode()} title={`Switch to ${theme.mode === "light" ? "dark" : "light"} mode`}
              aria-label={`Switch to ${theme.mode === "light" ? "dark" : "light"} mode`}
              className="px-4 grid place-content-center hover-tint flex-none">
              {theme.mode === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={() => toggle("menu")} aria-expanded={panel === "menu"} aria-label="More actions"
              className="px-4 grid place-content-center hover-tint flex-none"
              style={panel === "menu" ? { background: "var(--surface-2)" } : undefined}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
