# PixelPalette

A template website for experimenting with visual style. The page covers the
components you meet on most real websites — nav, hero, buttons, typography,
forms, alerts, dialogs, tabs, tables, pricing, product cards, galleries,
timelines, dashboards, newsletter, footer — and a **floating toolbar** at the
bottom restyles the whole page live: fonts, color palette, corner radius, and
light/dark mode.

Everything on the page, including the toolbar itself, is styled through CSS
variables, so every change previews instantly and exactly as it would look in
a real product.

## Stack

- [Bun](https://bun.sh) — runtime, package manager, and scripts (no npm)
- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) — layout utilities only; all theming is plain CSS variables in `src/index.css`
- Fonts served by [fonts.bunny.net](https://fonts.bunny.net) — GDPR-friendly, Google-Fonts-compatible API
- No component UI kit — every showcase component is hand-built in `src/components/showcase.tsx`

## Getting started (bun only)

```sh
bun install
bun dev          # → http://localhost:5173
bun run build    # type-check + production build into dist/
bun run preview  # preview the production build
bun run lint     # oxlint
```

## How it works

### Theming backbone — `src/index.css` + `src/lib/theme.tsx`

All visual style flows through CSS variables set on `:root` by `ThemeProvider`:

| Variable | Used for |
|---|---|
| `--bg` | Page background |
| `--surface` | Cards, panels, toolbar, dialogs |
| `--surface-2` | Inputs, chips, hovers |
| `--text` / `--muted` | Primary / secondary text |
| `--border` | Dividers, input outlines |
| `--primary` / `--primary-ink` | Buttons, links, focus rings / text on primary |
| `--accent` | Highlights, ratings, gradients, toolbar ring |
| `--success` `--warning` `--danger` `--info` | Fixed semantic tones |
| `--radius` | Corner radius unit everything derives from |
| `--font-display` / `--font-body` / `--font-code` | Title / text / mono stacks |

Helper classes (`.t-surface`, `.t-input`, `.t-btn-*`, `.t-switch`, `.t-check`,
`.t-radio`, `.t-range`, …) consume these variables, so any component built with
them re-skins automatically. `ThemeProvider` persists mode, fonts, palette,
and radius to `localStorage` (`pixelpalette-theme-v1`).

### Fonts — `src/lib/data.ts`, `src/lib/theme.tsx`, `src/lib/fontcheck.ts`

Three slots — **Display** (headings), **Body** (text), **Code** (mono) — each
fed from one of three sources, switched via tabs in the font panel:

1. **Bunny** — a curated catalog of ~50 families (`CURATED_FONTS`) across sans /
   serif / display / mono / handwriting. At runtime the app fetches the full
   catalog from `https://fonts.bunny.net/list` (≈1900 families) and merges it
   in, falling back to curated when offline. Live entries keep the API's real
   display names (`familyName`), request only weights each family actually
   ships, and match the served `@font-face` by listing both display name and
   URL slug in the stack. Selected families join a single Bunny CSS v1
   stylesheet; rows preview in their own typeface, lazily as you scroll.
2. **Installed** — system fonts via the Local Font Access API
   (`window.queryLocalFonts`), behind a styled one-time-permission flow
   (scanning / denied / unsupported states, no native chrome). Nothing is
   transferred: on every pick the app loads the family's real bytes —
   `blob()` → object URL → `FontFace` per style entry → `document.fonts.add()`
   (`ensureLocalFont`) — so it renders exactly like a webfont. Rows preload
   faces as they scroll into view (400px overscan) under an LRU cap (~30
   families; applied and on-screen fonts are never evicted). Each pick is
   verified (FontFace + canvas check) with an inline warning on failure, and
   font data is session-only — re-scan once after a reload to restore a
   persisted pick.
3. **Upload** — drop a `.woff/.woff2/.ttf/.otf` file; registered via FontFace
   for the session (not persisted).

### Colors and toolbar — `src/components/toolbar.tsx`

- Six presets (**Porcelain, Forest, Ocean, Sunset, Grape, Mono**), each with
  tuned **light + dark** token sets (`PRESET_PALETTES`).
- **Fine-tune** any of 9 tokens (background, surface, raised, text, muted,
  border, primary, on-primary, accent): tonal shade strip, H/S/L sliders, hex
  field with validation, live WCAG contrast readout, screen eyedropper where
  supported, plus a corner-radius slider. Editing a token flips the label to
  “Custom”.
- A **dice button** randomizes everything at once: fonts roll from the full
  live catalog (scanned locals join automatically), colors generate from
  random hues + harmony rules with contrast-fitted primaries, radius rolls
  0–20. Colors/radius apply instantly; fonts swap only once loaded (no flash).
- The **••• menu** holds an **Export theme** submenu — light CSS, dark CSS,
  full light+dark CSS, Tailwind v4 `@theme`, design-tokens JSON, `.css` file
  download — plus the mode switch and **Reset**. Light/dark also has a
  one-tap toggle in the dock.
- No `<select>` elements or native dialogs anywhere; the popup keeps one
  fixed size across tabs and tweens height between sections.

### Motion

Subtle, after Emil Kowalski's practical tips: buttons press to exactly
`scale(0.97)`; popovers enter fast (≤250ms) on an expressive ease-out from
`scale(0.97)` and from their trigger edge (dropdowns unfold downward from
top-center); accordion height animates; the logo strip is an edge-faded
infinite marquee that pauses on hover and respects reduced-motion.

### Showcase — `src/components/showcase.tsx`

Generic fictional content (“Pixel LLC”, no product marketing copy):

1. Sticky nav, search, cart, breadcrumbs, hero + proof row, logo marquee
2. Buttons (variants, sizes, states, icon, split), typography (h1–h4, lead,
   code, kbd, lists, blockquote, description list, code block)
3. Forms (inputs, password toggle, textarea counter, custom select, custom
   calendar, file dropzone, error state, checkboxes, radios, switches, range)
4. Alerts, status markers, dropdown menu, tooltip, star rating, modal dialog,
   toasts, progress, skeletons, spinners
5. Tabs, accordion, filterable table + pagination
6. Stat cards, 3-tier pricing, product card (quantity, wishlist, cart),
   testimonial, profile card
7. Gallery grid, video placeholder, presence list, activity timeline
8. Onboarding stepper, dashboard strip, newsletter form, full footer

Interactive demos (cart, toasts, modal, wizard) run on local state so the
template feels like a real site while you restyle it.

## Project layout

```
pixelpalette/
├── index.html                  # title, fonts.bunny.net preconnect
├── package.json                # bun scripts: dev / build / preview / lint
├── public/                     # favicon
├── src/
│   ├── main.tsx                # entry
│   ├── App.tsx                 # ThemeProvider + page + toast host
│   ├── index.css               # theme variables + themed control styles
│   ├── lib/
│   │   ├── data.ts             # curated catalog, palettes, Bunny URL builder
│   │   ├── color.ts            # hex↔hsl, WCAG contrast helpers
│   │   ├── fontcheck.ts        # local-font render verification
│   │   └── theme.tsx           # ThemeProvider: mode, fonts, tokens, persistence
│   └── components/
│       ├── showcase.tsx        # the template website
│       └── toolbar.tsx         # floating dock + font/color/menu panels
```

## Browser notes

- Bunny Fonts needs network access; offline, the curated list still renders
  in fallback stacks.
- Installed-font scanning needs a Chromium desktop browser (Chrome/Edge).
- The screen eyedropper appears only where `EyeDropper` is supported.
- Uploaded fonts live for the session; everything else persists in
  `localStorage` — ••• → Reset returns to defaults.
