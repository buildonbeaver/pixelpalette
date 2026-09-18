import { useState } from "react";
import { useTheme } from "../lib/theme";

/* ------------------------------------------------------------------ */
/*  Template showcase. Generic fictional content ("Pixel LLC") that covers   */
/*  the components found on most websites. Everything is styled through */
/*  the theme CSS variables, so the toolbar re-skins it live.           */
/* ------------------------------------------------------------------ */

/* ------------------------------- icons ------------------------------ */

function I({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const Icon = {
  search: (s?: number) => <I size={s} d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" />,
  cart: (s?: number) => <I size={s} d="M6 6h15l-1.5 9h-12L5 3H2m4 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
  star: (s?: number) => (
    <svg width={s ?? 16} height={s ?? 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
    </svg>
  ),
  check: (s?: number) => <I size={s} d="M20 6 9 17l-5-5" />,
  x: (s?: number) => <I size={s} d="M18 6 6 18M6 6l12 12" />,
  chevD: (s?: number) => <I size={s} d="m6 9 6 6 6-6" />,
  chevR: (s?: number) => <I size={s} d="m9 18 6-6-6-6" />,
  arrow: (s?: number) => <I size={s} d="M5 12h14m-6-6 6 6-6 6" />,
  play: (s?: number) => (
    <svg width={s ?? 16} height={s ?? 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  ),
  info: (s?: number) => <I size={s} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-6v-5m0-4h.01" />,
  warn: (s?: number) => <I size={s} d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />,
  upload: (s?: number) => <I size={s} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5m5-5v12" />,
  user: (s?: number) => <I size={s} d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2m12-10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />,
  heart: (s?: number) => <I size={s} d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 17.5 4c-1.8 0-3.4 1-4.5 2.5C11.9 5 10.3 4 8.5 4A4.5 4.5 0 0 0 4 8.5c0 2.2 1.5 4 3 5.5l5 5 7-5Z" />,
  plus: (s?: number) => <I size={s} d="M12 5v14M5 12h14" />,
  minus: (s?: number) => <I size={s} d="M5 12h14" />,
  bell: (s?: number) => <I size={s} d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a2 2 0 0 0 3.4 0" />,
  eye: (s?: number) => <I size={s} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  calendar: (s?: number) => <I size={s} d="M8 2v4m8-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />,
};

/* --------------------------- section heading ------------------------ */

function SectionHead({ index, title, blurb }: { index: string; title: string; blurb: string }) {
  return (
    <div className="mb-6">
      <div className="font-code text-xs t-muted mb-1">{index}</div>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold">{title}</h2>
      <p className="t-muted mt-1 max-w-xl">{blurb}</p>
    </div>
  );
}

/* --------------------------------- nav ------------------------------ */

function SiteNav({ cartCount }: { cartCount: number }) {
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-30 t-surface/90 backdrop-blur border-b t-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <a href="#top" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="t-primary w-8 h-8 grid place-content-center font-bold"
            style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>P</span>
          Pixel LLC
        </a>
        <nav className="hidden md:flex items-center gap-5 text-sm ml-4">
          {["Product", "Pricing", "Docs", "Blog"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="t-muted hover-primary hover:underline underline-offset-4">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2 t-input px-3 py-1.5 w-48">
          <span className="t-muted">{Icon.search(14)}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search docs…" className="bg-transparent outline-none text-sm w-full" />
          <kbd className="font-code text-[10px] t-chip px-1.5 py-0.5">⌘K</kbd>
        </div>
        <button className="relative p-2 t-btn-ghost t-btn" aria-label="Cart">
          {Icon.cart(18)}
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 t-primary text-[10px] font-bold w-5 h-5 grid place-content-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
        <button className="hidden sm:block text-sm font-semibold px-3 py-2 t-btn t-btn-ghost">Sign in</button>
        <button className="text-sm px-4 py-2 t-btn t-btn-primary">Get started</button>
      </div>
    </header>
  );
}

/* --------------------------------- hero ----------------------------- */

function Hero({ onAdd }: { onAdd: () => void }) {
  const { tokens } = useTheme();
  return (
    <section className="max-w-6xl mx-auto px-4 pt-10 pb-4 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <nav className="flex items-center gap-1.5 text-xs t-muted mb-4" aria-label="Breadcrumb">
          <a href="#top" className="hover:underline">Home</a>
          <span>{Icon.chevR(12)}</span>
          <a href="#product" className="hover:underline">Product</a>
          <span>{Icon.chevR(12)}</span>
          <span className="t-text">Overview</span>
        </nav>
        <p className="font-code text-xs t-accent-text mb-3">V2.4 — NEW ANALYTICS DASHBOARD</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05]">
          Ship projects your customers will love
        </h1>
        <p className="t-muted mt-4 text-lg leading-relaxed">
          Pixel gives every team one place to plan, build, and measure.
          Start free, upgrade when your team grows — cancel anytime.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={onAdd} className="t-btn t-btn-primary px-5 py-2.5 inline-flex items-center gap-2">
            Start free trial {Icon.arrow()}
          </button>
          <button className="t-btn t-btn-outline px-5 py-2.5 inline-flex items-center gap-2">
            {Icon.play(14)} Watch demo
          </button>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <div className="flex -space-x-2">
            {["AK", "JM", "RS", "+"].map((t, i) => (
              <span key={t} className="w-8 h-8 rounded-full grid place-content-center text-[10px] font-bold border-2"
                style={{
                  background: i % 2 ? tokens.accent : tokens.primary,
                  color: "#fff", borderColor: tokens.bg,
                }}>{t}</span>
            ))}
          </div>
          <div className="text-sm">
            <span className="inline-flex gap-0.5" style={{ color: tokens.accent }}>
              {Array.from({ length: 5 }).map((_, i) => <span key={i}>{Icon.star(14)}</span>)}
            </span>
            <span className="t-muted ml-2">4.9 · Loved by 12,000 teams</span>
          </div>
        </div>
      </div>
      <div className="t-card p-5" style={{ boxShadow: "var(--shadow)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Weekly revenue</div>
            <div className="text-xs t-muted">Updated 2 min ago</div>
          </div>
          <span className="t-chip text-xs font-semibold px-2 py-1 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} />
            Live
          </span>
        </div>
        <div className="flex items-end gap-2 h-36">
          {[42, 68, 55, 80, 64, 92, 74, 88, 60, 96, 70, 84].map((h, i) => (
            <div key={i} className="flex-1 rounded-t"
              style={{
                height: `${h}%`,
                background: i === 9 ? tokens.primary : tokens.border,
                opacity: i === 9 ? 1 : 0.9,
              }} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          {[["$48.2k", "Revenue"], ["3,184", "Customers"], ["98.2%", "Uptime"]].map(([v, l]) => (
            <div key={l} className="t-surface-2 rounded-lg py-2.5" style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
              <div className="font-display font-semibold">{v}</div>
              <div className="text-xs t-muted">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ logo cloud -------------------------- */

function LogoCloud() {
  const logos = ["Vertex", "Northwind", "KAPITAL", "hexlab", "Bluepeak", "Framework", "Quantia", "Loom & Co"];
  // Two identical halves; the track animates 0 → -50% so the second half
  // lands exactly where the first was — a seamless, never-empty loop.
  // Spacing uses per-item margins (not container gap) so each half, margins
  // included, is exactly 50% of the track width.
  const loop = [...logos, ...logos];
  return (
    <section className="max-w-6xl mx-auto px-4 mt-8 py-8 border-y t-border" aria-label="Customer logos">
      <p className="text-center text-xs t-muted uppercase tracking-widest mb-5">Powering teams at</p>
      <div className="overflow-hidden pp-fade-x">
        <div className="pp-marquee flex w-max items-center t-muted">
          {loop.map((l, i) => (
            <span key={`${l}-${i}`} aria-hidden={i >= logos.length}
              className={`whitespace-nowrap flex-none mx-7 ${i % 2 ? "font-display font-semibold text-xl" : "font-body font-bold text-xl"}`}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- buttons --------------------------- */

function Buttons() {
  const [loading, setLoading] = useState(false);
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <SectionHead index="01 — Actions" title="Buttons" blurb="Variants, sizes, and states used across marketing pages, dashboards, and dialogs." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="t-card p-5">
          <div className="text-sm font-semibold mb-3">Variants</div>
          <div className="flex flex-wrap gap-2.5">
            <button className="t-btn t-btn-primary px-4 py-2 text-sm">Primary</button>
            <button className="t-btn t-btn-accent px-4 py-2 text-sm">Accent</button>
            <button className="t-btn t-btn-outline px-4 py-2 text-sm">Outline</button>
            <button className="t-btn t-btn-ghost px-4 py-2 text-sm">Ghost</button>
            <button className="t-btn t-btn-danger px-4 py-2 text-sm">Danger</button>
            <button className="t-btn t-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
              {Icon.cart(15)} With icon
            </button>
          </div>
          <div className="text-sm font-semibold mt-5 mb-3">States</div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              className="t-btn t-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2 min-w-28 justify-center"
              onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1400); }}>
              {loading && (
                <svg className="pp-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.2-8.56" />
                </svg>
              )}
              {loading ? "Saving…" : "Click to load"}
            </button>
            <button className="t-btn t-btn-primary px-4 py-2 text-sm" disabled>Disabled</button>
            <button className="t-btn t-btn-outline px-4 py-2 text-sm" disabled>Disabled</button>
          </div>
        </div>
        <div className="t-card p-5">
          <div className="text-sm font-semibold mb-3">Sizes</div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button className="t-btn t-btn-primary px-2.5 py-1 text-xs">Small</button>
            <button className="t-btn t-btn-primary px-4 py-2 text-sm">Medium</button>
            <button className="t-btn t-btn-primary px-6 py-3">Large</button>
          </div>
          <div className="text-sm font-semibold mt-5 mb-3">Icon buttons</div>
          <div className="flex gap-2.5">
            {[Icon.search, Icon.bell, Icon.heart, Icon.user].map((Fn, i) => (
              <button key={i} aria-label="Icon action"
                className="t-btn t-btn-outline w-10 h-10 grid place-content-center">
                {Fn(17)}
              </button>
            ))}
            <button aria-label="Close" className="t-btn t-btn-ghost w-10 h-10 grid place-content-center">
              {Icon.x(17)}
            </button>
          </div>
          <div className="text-sm font-semibold mt-5 mb-3">Split / group</div>
          <div className="inline-flex rounded-lg overflow-hidden border t-border text-sm"
            style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
            <button className="t-primary px-4 py-2 font-semibold">Export</button>
            <button className="t-primary px-3 py-2 border-l" style={{ borderColor: "rgb(255 255 255 / .3)" }} aria-label="More export options">
              {Icon.chevD(15)}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ typography -------------------------- */

function Typography() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <SectionHead index="02 — Type" title="Typography" blurb="Headings use the display font, everything else the body font, code snippets the mono font." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="t-card p-6 space-y-3">
          <h1 className="font-display text-4xl font-semibold">Heading 1 — display</h1>
          <h2 className="font-display text-3xl font-semibold">Heading 2 — display</h2>
          <h3 className="font-display text-2xl font-semibold">Heading 3 — display</h3>
          <h4 className="text-xl font-semibold">Heading 4 — body semibold</h4>
          <p className="text-lg t-muted">Lead paragraph — larger muted intro copy for articles and hero sections.</p>
          <p>Body paragraph with an <a href="#typography" className="t-primary-text underline underline-offset-2">inline link</a>,
            some <strong>strong emphasis</strong>, and a <code className="font-code text-[13px] t-chip px-1.5 py-0.5">code span</code> plus
            a <kbd className="font-code text-xs t-chip px-1.5 py-0.5 border">⌘K</kbd> hint.</p>
          <p className="text-sm t-muted">Small muted text for captions, hints, and secondary information.</p>
          <hr className="t-border" />
          <blockquote className="border-l-2 pl-4 italic t-muted" style={{ borderColor: "var(--primary)" }}>
            “Good typography is invisible until you try a different font — then everything changes.”
          </blockquote>
        </div>
        <div className="t-card p-6">
          <div className="text-sm font-semibold mb-3">Lists</div>
          <div className="grid sm:grid-cols-2 gap-4 text-[15px]">
            <ul className="space-y-2">
              {["Unlimited projects", "Role-based access", "SSO & audit logs"].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="t-primary-text mt-0.5">{Icon.check(15)}</span>{t}
                </li>
              ))}
            </ul>
            <ol className="space-y-2 list-decimal list-inside t-muted">
              {["Create a workspace", "Invite your team", "Ship your first release"].map((t) => (
                <li key={t}><span className="t-text">{t}</span></li>
              ))}
            </ol>
          </div>
          <div className="text-sm font-semibold mt-5 mb-2">Code block</div>
          <pre className="font-code text-[13px] leading-relaxed t-surface-2 p-4 overflow-x-auto"
            style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
{`$ bun install
$ bun dev

# → http://localhost:5173`}
          </pre>
          <div className="text-sm font-semibold mt-5 mb-2">Description list</div>
          <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="t-muted">Founded</dt><dd>2019</dd>
            <dt className="t-muted">Team</dt><dd>120 people, remote-first</dd>
            <dt className="t-muted">Uptime</dt><dd>99.99% trailing year</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- forms ---------------------------- */

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="t-input w-full px-3 py-2 text-sm flex items-center justify-between" aria-haspopup="listbox" aria-expanded={open}>
        <span>{value}</span>
        <span className="t-muted">{Icon.chevD(15)}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul role="listbox" className="pp-dropdown absolute left-0 top-full z-20 mt-1 w-full t-surface border t-border py-1 max-h-52 overflow-auto t-scroll"
            style={{ borderRadius: "calc(var(--radius) * 0.66)", boxShadow: "var(--shadow)" }}>
            {options.map((o) => (
              <li key={o}>
                <button role="option" aria-selected={o === value}
                  onClick={() => { onChange(o); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover-tint"
                  style={{ background: o === value ? "var(--surface-2)" : undefined }}>
                  {o}
                  {o === value && <span className="t-primary-text">{Icon.check(14)}</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function CustomDate({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const [y, m, d] = value.split("-").map(Number);
  const [view, setView] = useState({ y, m: m - 1 });
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday-first
  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
  const iso = (day: number) =>
    `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const step = (dir: number) =>
    setView((v) => ({ y: v.m + dir > 11 ? v.y + 1 : v.m + dir < 0 ? v.y - 1 : v.y, m: (v.m + dir + 12) % 12 }));
  return (
    <div className="relative">
      <button type="button" id="f-date" aria-labelledby="f-date-label" aria-haspopup="dialog" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="t-input w-full px-3 py-2 text-sm flex items-center justify-between gap-2">
        <span>{MONTHS[m - 1].slice(0, 3)} {d}, {y}</span>
        <span className="t-muted">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4m8-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div role="dialog" aria-label="Choose a date"
            className="pp-dropdown absolute left-0 top-full z-20 mt-1 t-surface border t-border p-3 w-64"
            style={{ borderRadius: "calc(var(--radius) * 0.66)", boxShadow: "var(--shadow)" }}>
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => step(-1)} aria-label="Previous month" className="t-btn t-btn-ghost w-8 h-8 grid place-content-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <span className="text-sm font-semibold">{MONTHS[view.m]} {view.y}</span>
              <button onClick={() => step(1)} aria-label="Next month" className="t-btn t-btn-ghost w-8 h-8 grid place-content-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-[11px] t-muted font-semibold mb-1">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => <span key={w} className="py-1">{w}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[13px]">
              {Array.from({ length: lead }).map((_, i) => <span key={`b${i}`} />)}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const selected = value === iso(day);
                return (
                  <button key={day} onClick={() => { onChange(iso(day)); setOpen(false); }}
                    aria-pressed={selected}
                    aria-label={`${MONTHS[view.m]} ${day}, ${view.y}`}
                    className={`w-8 h-8 grid place-content-center mx-auto ${selected ? "t-primary font-bold" : "hover-tint"}`}
                    style={{
                      borderRadius: "50%",
                      ...(selected ? {} : isToday(day) ? { outline: "1.5px solid var(--primary)", outlineOffset: -1.5 } : {}),
                    }}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Forms() {
  const [plan, setPlan] = useState("Team — $24/mo");
  const [bio, setBio] = useState("Design engineer based in Lisbon.");
  const [showPw, setShowPw] = useState(false);
  const [volume, setVolume] = useState(62);
  const [notify, setNotify] = useState(true);
  const [weekly, setWeekly] = useState(false);
  const [contact, setContact] = useState("email");
  const [fileName, setFileName] = useState("");
  const [startDate, setStartDate] = useState("2026-10-01");
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <SectionHead index="03 — Input" title="Forms" blurb="Text fields, pickers, toggles, and validation states with inline hints." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="t-card p-6 space-y-4">
          <div>
            <label htmlFor="f-name" className="text-sm font-semibold block mb-1.5">Full name</label>
            <input id="f-name" className="t-input w-full px-3 py-2 text-sm" placeholder="Ada Lovelace" defaultValue="Ada Lovelace" />
            <p className="text-xs t-muted mt-1.5">Shown on invoices and your public profile.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="f-email" className="text-sm font-semibold block mb-1.5">Email</label>
              <input id="f-email" type="email" className="t-input w-full px-3 py-2 text-sm" placeholder="ada@pixel.llc" />
            </div>
            <div>
              <label htmlFor="f-pw" className="text-sm font-semibold block mb-1.5">Password</label>
              <div className="t-input flex items-center pr-2">
                <input id="f-pw" type={showPw ? "text" : "password"} defaultValue="hunter2-hunter2"
                  className="bg-transparent outline-none w-full px-3 py-2 text-sm" />
                <button onClick={() => setShowPw((s) => !s)} className="t-muted p-1" aria-label="Toggle password visibility">
                  {Icon.eye(16)}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="f-bio" className="text-sm font-semibold block mb-1.5">Bio</label>
            <textarea id="f-bio" rows={3} maxLength={140} value={bio} onChange={(e) => setBio(e.target.value)}
              className="t-input w-full px-3 py-2 text-sm resize-y" style={{ minHeight: 76, maxHeight: 200 }} />
            <p className="text-xs t-muted mt-1.5 text-right">{bio.length}/140</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Plan</label>
              <CustomSelect value={plan} onChange={setPlan}
                options={["Starter — $0", "Team — $24/mo", "Business — $79/mo", "Enterprise — Custom"]} />
            </div>
            <div>
              <span id="f-date-label" className="text-sm font-semibold block mb-1.5">Start date</span>
              <CustomDate value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <label htmlFor="f-seats" className="text-sm font-semibold block mb-1.5">Seats</label>
              <input id="f-seats" type="number" min={1} max={500} defaultValue={12} className="t-input w-full px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold block mb-1.5">Avatar upload</span>
            <label className="flex items-center justify-center gap-2 border border-dashed t-border px-3 py-6 text-sm t-muted cursor-pointer hover-primary"
              style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
              {Icon.upload(16)}
              {fileName || "Drop a PNG here, or click to browse"}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
            </label>
          </div>
          <div>
            <label htmlFor="f-err" className="text-sm font-semibold block mb-1.5">Subdomain</label>
            <input id="f-err" className="t-input w-full px-3 py-2 text-sm" defaultValue="pixel!" aria-invalid="true"
              aria-describedby="f-err-hint" />
            <p id="f-err-hint" className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>
              Only lowercase letters, numbers, and dashes.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="t-card p-6">
            <div className="text-sm font-semibold mb-3">Checkboxes & radios</div>
            <div className="space-y-2.5 text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="t-check" defaultChecked /> Email me product updates
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="t-check" /> Share anonymous usage stats
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer opacity-60">
                <input type="checkbox" className="t-check" disabled /> Beta program (invite only)
              </label>
            </div>
            <div className="text-sm font-semibold mt-5 mb-3">Preferred contact</div>
            <div className="flex gap-5 text-sm">
              {[["email", "Email"], ["phone", "Phone"], ["none", "None"]].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="contact" className="t-radio" value={v}
                    checked={contact === v} onChange={() => setContact(v)} /> {l}
                </label>
              ))}
            </div>
          </div>
          <div className="t-card p-6">
            <div className="text-sm font-semibold mb-3">Switches</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span>Desktop notifications<button className="block text-xs t-muted font-normal">Billing, mentions, deploys</button></span>
                <button role="switch" aria-checked={notify} data-on={notify} className="t-switch" onClick={() => setNotify((v) => !v)} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Weekly digest</span>
                <button role="switch" aria-checked={weekly} data-on={weekly} className="t-switch" onClick={() => setWeekly((v) => !v)} />
              </div>
            </div>
            <div className="text-sm font-semibold mt-5 mb-3">Volume — {volume}%</div>
            <input type="range" min={0} max={100} value={volume} aria-label="Volume"
              onChange={(e) => setVolume(Number(e.target.value))}
              className="t-range w-full" style={{ ["--fill" as string]: `${volume}%` }} />
            <div className="flex items-center gap-2 mt-5">
              <input type="search" placeholder="Search settings…" className="t-input px-3 py-2 text-sm flex-1" />
              <button className="t-btn t-btn-primary px-4 py-2 text-sm">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ feedback ---------------------------- */

function Status({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="t-chip text-xs font-semibold px-2 py-1 inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone }} />{label}
    </span>
  );
}

function Feedback({ notify }: { notify: (t: string, m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { tokens } = useTheme();
  const [tip, setTip] = useState(false);
  const [rating, setRating] = useState(4);
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <SectionHead index="04 — Feedback" title="Alerts, menus & dialogs" blurb="Inline notices, contextual menus, tooltips, ratings, and modal dialogs." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {[
            { c: "var(--info)", t: "Heads up", m: "Scheduled maintenance Sunday 02:00–03:00 UTC.", icon: Icon.info(16) },
            { c: "var(--success)", t: "Deployed", m: "Version 2.4.1 is live on all regions.", icon: Icon.check(16) },
            { c: "var(--warning)", t: "Usage at 80%", m: "You have used 8 of 10 seats on the Team plan.", icon: Icon.warn(16) },
            { c: "var(--danger)", t: "Payment failed", m: "Your card ending 4242 was declined. Update billing.", icon: Icon.x(16) },
          ].map((a) => (
            <div key={a.t} className="t-card p-4 flex gap-3">
              <span style={{ color: a.c }} className="mt-0.5">{a.icon}</span>
              <div className="text-sm flex-1">
                <span className="font-semibold">{a.t}. </span>
                <span className="t-muted">{a.m}</span>
              </div>
              <button className="t-muted" aria-label="Dismiss">{Icon.x(14)}</button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            <Status tone="var(--success)" label="Active" />
            <Status tone="var(--warning)" label="Pending" />
            <Status tone="var(--danger)" label="Failed" />
            <Status tone="var(--info)" label="Draft" />
            <span className="t-chip text-xs font-semibold px-2 py-1">v2.4.1</span>
            <span className="t-chip text-xs font-semibold px-2 py-1 font-code">beta</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="t-card p-5 flex flex-wrap items-center gap-4">
            <div className="relative">
              <button onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}
                className="t-btn t-btn-outline px-4 py-2 text-sm inline-flex items-center gap-2">
                Open menu {Icon.chevD(15)}
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div role="menu" className="pp-dropdown absolute left-0 top-full z-20 mt-1 w-52 t-surface border t-border py-1.5"
                    style={{ borderRadius: "calc(var(--radius) * 0.66)", boxShadow: "var(--shadow)" }}>
                    {[["Profile", Icon.user(15)], ["Notifications", Icon.bell(15)], ["Billing", Icon.cart(15)]].map(([l, ic]) => (
                      <button key={l as string} role="menuitem"
                        onClick={() => { setMenu(false); notify("Menu", `${l} selected.`); }}
                        className="w-full text-left px-3.5 py-2 text-sm flex items-center gap-2.5 hover:bg-black/5">
                        <span className="t-muted">{ic}</span>{l as string}
                      </button>
                    ))}
                    <div className="border-t t-border my-1.5" />
                    <button role="menuitem" onClick={() => { setMenu(false); notify("Signed out", "Session ended."); }}
                      className="w-full text-left px-3.5 py-2 text-sm" style={{ color: "var(--danger)" }}>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="relative inline-block" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
              <button className="t-btn t-btn-ghost px-3 py-2 text-sm underline underline-offset-4 decoration-dotted">
                Hover for tooltip
              </button>
              {tip && (
                <span role="tooltip" className="pp-panel pp-origin-bottom absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap text-xs px-2.5 py-1.5 t-primary"
                  style={{ borderRadius: "calc(var(--radius) * 0.5)" }}>
                  Tooltips explain icons and abbreviations
                </span>
              )}
            </div>
            <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rate this template">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="radio" aria-checked={n === rating} aria-label={`${n} stars`}
                  onClick={() => setRating(n)}
                  style={{ color: n <= rating ? tokens.accent : tokens.border }}>
                  {Icon.star(20)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button onClick={() => setOpen(true)} className="t-btn t-btn-primary px-4 py-2 text-sm">Open dialog</button>
              <button onClick={() => notify("Saved", "Your changes are live.")} className="t-btn t-btn-outline px-4 py-2 text-sm">Show toast</button>
            </div>
          </div>
          <div className="t-card p-5">
            <div className="text-sm font-semibold mb-3">Progress & loading</div>
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span>Storage</span><span className="t-muted">72%</span></div>
                <div className="h-2 t-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "72%", background: tokens.primary }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span>Onboarding</span><span className="t-muted">Step 3 of 5</span></div>
                <div className="h-2 t-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "60%", background: tokens.accent }} />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <svg className="pp-spin" width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.2-8.56" />
                </svg>
                <div className="flex-1 space-y-2">
                  <div className="pp-skeleton h-3 rounded w-3/4" />
                  <div className="pp-skeleton h-3 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Confirm dialog">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <div className="pp-panel relative t-surface border t-border p-6 w-full max-w-md"
            style={{ borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display text-xl font-semibold">Delete workspace?</h3>
              <button onClick={() => setOpen(false)} className="t-muted p-1" aria-label="Close dialog">{Icon.x(16)}</button>
            </div>
            <p className="text-sm t-muted">This permanently removes projects, members, and billing history. This cannot be undone.</p>
            <label className="flex items-center gap-2.5 text-sm mt-4 cursor-pointer">
              <input type="checkbox" className="t-check" /> I understand the consequences
            </label>
            <div className="flex justify-end gap-2.5 mt-5">
              <button onClick={() => setOpen(false)} className="t-btn t-btn-outline px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => { setOpen(false); notify("Deleted", "Workspace moved to trash."); }}
                className="t-btn t-btn-danger px-4 py-2 text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------- tabs + faq ------------------------- */

function TabsFaq() {
  const [tab, setTab] = useState("Overview");
  const [open, setOpen] = useState(0);
  const faqs = [
    ["How does the free trial work?", "Every workspace gets 14 days with all Team features. No card required — pick a plan only when you are ready."],
    ["Can I migrate from another tool?", "Yes. Import projects, files, and users from CSV or our API. Most teams finish migration in under a day."],
    ["Is my data encrypted?", "Traffic is encrypted in transit and data is encrypted at rest. SSO, audit logs, and regional hosting are available on Business."],
    ["How do I cancel?", "Settings → Billing → Cancel. You keep paid features until the end of the cycle and can export everything."],
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <SectionHead index="05 — Disclosure" title="Tabs & accordion" blurb="Two ways to pack dense content into a small footprint." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="t-card p-6">
          <div role="tablist" aria-label="Product info" className="flex gap-1 t-surface-2 p-1"
            style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
            {["Overview", "Specs", "Reviews"].map((t) => (
              <button key={t} role="tab" aria-selected={tab === t}
                onClick={() => setTab(t)}
                className="flex-1 px-3 py-1.5 text-sm font-semibold"
                style={{
                  borderRadius: "calc(var(--radius) * 0.5)",
                  background: tab === t ? "var(--surface)" : "transparent",
                  boxShadow: tab === t ? "0 1px 3px rgb(0 0 0 / .12)" : "none",
                }}>{t}</button>
            ))}
          </div>
          <div role="tabpanel" key={tab} className="pp-fade text-sm t-muted mt-4 leading-relaxed">
            {tab === "Overview" && "Pixel combines docs, tasks, and dashboards. Teams plan sprints on Monday, review metrics on Friday, and keep the whole history searchable in between."}
            {tab === "Specs" && "99.99% uptime SLA · SOC 2 Type II · GDPR & CCPA ready · 40+ integrations · REST + webhooks · SSO/SAML on Business plans."}
            {tab === "Reviews" && "“Switched 60 people over a weekend and never looked back.” — Engineering lead, Northwind. Rated 4.9/5 across 2,300 reviews."}
          </div>
        </div>
        <div className="t-card p-3">
          {faqs.map(([q, a], i) => (
            <div key={q} className={i > 0 ? "border-t t-border" : ""}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
                className="w-full flex items-center justify-between gap-3 text-left px-3 py-3.5 text-sm font-semibold">
                {q}
                <span className="t-muted" style={{ transform: open === i ? "rotate(180deg)" : "none" }}>
                  {Icon.chevD(16)}
                </span>
              </button>
              <div className="pp-collapse" data-open={open === i}>
                <div>
                  <p className="px-3 pb-4 text-sm t-muted leading-relaxed">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ data table -------------------------- */

const ROWS = [
  ["Pixel LLC", "Business", "$12,400", "Paid", "var(--success)"],
  ["Northwind", "Team", "$2,880", "Paid", "var(--success)"],
  ["Hexlab", "Team", "$1,920", "Overdue", "var(--danger)"],
  ["Bluepeak", "Starter", "$0", "Trial", "var(--warning)"],
  ["Vertex Ltd", "Business", "$9,600", "Pending", "var(--warning)"],
];

function DataTable() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const rows = ROWS.filter((r) => r[0].toLowerCase().includes(q.toLowerCase()));
  return (
    <section id="docs" className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <SectionHead index="06 — Data" title="Tables & pagination" blurb="Sortable-looking invoices with search, status markers, and page controls." />
      <div className="t-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b t-border">
          <div className="font-display font-semibold text-lg">Invoices</div>
          <div className="flex-1" />
          <div className="t-input flex items-center gap-2 px-3 py-1.5 w-56">
            <span className="t-muted">{Icon.search(14)}</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter customers…"
              className="bg-transparent outline-none text-sm w-full" />
          </div>
          <button className="t-btn t-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">{Icon.plus(14)} New</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left t-muted text-xs uppercase tracking-wide border-b t-border">
                {["Customer", "Plan", "Amount", "Status", ""].map((h) => (
                  <th key={h} scope="col" className="font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]} className="border-b t-border last:border-0 hover-tint">
                  <td className="px-4 py-3 font-semibold">{r[0]}</td>
                  <td className="px-4 py-3 t-muted">{r[1]}</td>
                  <td className="px-4 py-3 font-code text-[13px]">{r[2]}</td>
                  <td className="px-4 py-3"><Status tone={r[4]} label={r[3]} /></td>
                  <td className="px-4 py-3 text-right">
                    <button className="t-primary-text text-[13px] font-semibold hover:underline">View</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center t-muted">No customers match “{q}”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t t-border text-sm">
          <span className="t-muted text-[13px]">Page {page} of 8</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <button key={n} onClick={() => setPage(n)} aria-current={page === n ? "page" : undefined}
                className={`w-8 h-8 grid place-content-center text-[13px] font-semibold ${page === n ? "t-primary" : "t-btn t-btn-ghost"}`}
                style={{ borderRadius: "calc(var(--radius) * 0.5)" }}>{n}</button>
            ))}
            <span className="t-muted px-1 self-center">…</span>
            <button onClick={() => setPage(8)} className="w-8 h-8 grid place-content-center text-[13px] font-semibold t-btn t-btn-ghost"
              style={{ borderRadius: "calc(var(--radius) * 0.5)" }}>8</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- cards ---------------------------- */

function Cards({ onAdd }: { onAdd: () => void }) {
  const { tokens } = useTheme();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <SectionHead index="07 — Cards" title="Stats, pricing & products" blurb="The card layouts behind dashboards, pricing pages, and storefronts." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          ["Monthly visitors", "84,203", "+12.4%", true],
          ["Conversion", "3.8%", "+0.6pt", true],
          ["Churn", "1.2%", "-0.3pt", true],
          ["Avg. response", "1.4s", "+0.2s", false],
        ].map(([l, v, d, good]) => (
          <div key={l as string} className="t-card p-4">
            <div className="text-xs t-muted">{l}</div>
            <div className="font-display text-2xl font-semibold mt-1">{v}</div>
            <div className="text-xs font-semibold mt-1"
              style={{ color: good ? "var(--success)" : "var(--danger)" }}>{d} vs last month</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-4" id="blog">
        {[
          { n: "Starter", p: "$0", d: "For side projects and trying things out.", f: ["3 projects", "1 GB storage", "Community support"], hot: false },
          { n: "Team", p: "$24", d: "For growing teams that ship every week.", f: ["Unlimited projects", "100 GB storage", "Priority support", "SSO & audit logs"], hot: true },
          { n: "Enterprise", p: "Custom", d: "For orgs with compliance needs.", f: ["Everything in Team", "Regional hosting", "Dedicated manager"], hot: false },
        ].map((t) => (
          <div key={t.n} className="t-card p-6 flex flex-col"
            style={t.hot ? { borderColor: "var(--primary)", borderWidth: 2, boxShadow: "var(--shadow)" } : undefined}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{t.n}</div>
              {t.hot && <span className="t-primary text-[11px] font-bold px-2 py-0.5 uppercase tracking-wide"
                style={{ borderRadius: "calc(var(--radius) * 0.5)" }}>Popular</span>}
            </div>
            <div className="font-display text-4xl font-semibold mt-2">{t.p}
              {t.p !== "Custom" && <span className="text-sm font-body font-normal t-muted"> /mo</span>}
            </div>
            <p className="text-sm t-muted mt-1">{t.d}</p>
            <ul className="text-sm space-y-2 mt-4 mb-6">
              {t.f.map((f) => (
                <li key={f} className="flex gap-2"><span className="t-primary-text">{Icon.check(15)}</span>{f}</li>
              ))}
            </ul>
            <button className={`t-btn mt-auto px-4 py-2.5 text-sm ${t.hot ? "t-btn-primary" : "t-btn-outline"}`}>
              {t.p === "Custom" ? "Contact sales" : "Choose plan"}
            </button>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="t-card overflow-hidden">
          <div className="h-44 grid place-content-center font-display text-2xl font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})` }}>
            Aura Chair
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Aura Lounge Chair</div>
              <button onClick={() => setLiked((v) => !v)} aria-label="Add to wishlist" aria-pressed={liked}
                style={{ color: liked ? "var(--danger)" : "var(--muted)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"}
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 17.5 4c-1.8 0-3.4 1-4.5 2.5C11.9 5 10.3 4 8.5 4A4.5 4.5 0 0 0 4 8.5c0 2.2 1.5 4 3 5.5l5 5 7-5Z" />
                </svg>
              </button>
            </div>
            <div className="text-sm t-muted">Bouclé · Oak legs</div>
            <div className="flex items-center gap-1.5 mt-2 text-sm">
              <span className="inline-flex gap-0.5" style={{ color: tokens.accent }}>
                {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ opacity: i < 4 ? 1 : 0.35 }}>{Icon.star(13)}</span>)}
              </span>
              <span className="t-muted text-xs">4.0 (212)</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="font-display text-xl font-semibold">$349 <span className="text-sm font-body font-normal t-muted line-through">$429</span></div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border t-border" style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
                  <button className="px-2.5 py-1.5" aria-label="Decrease quantity" onClick={() => setQty((n) => Math.max(1, n - 1))}>{Icon.minus(13)}</button>
                  <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                  <button className="px-2.5 py-1.5" aria-label="Increase quantity" onClick={() => setQty((n) => n + 1)}>{Icon.plus(13)}</button>
                </div>
                <button onClick={onAdd} className="t-btn t-btn-primary px-3.5 py-2 text-sm">Add</button>
              </div>
            </div>
          </div>
        </div>
        <figure className="t-card p-6 flex flex-col">
          <span className="inline-flex gap-0.5 mb-3" style={{ color: tokens.accent }}>
            {Array.from({ length: 5 }).map((_, i) => <span key={i}>{Icon.star(14)}</span>)}
          </span>
          <blockquote className="font-display text-lg leading-relaxed flex-1">
            “We replaced four tools with Pixel. Planning finally feels calm instead of chaotic.”
          </blockquote>
          <figcaption className="flex items-center gap-3 mt-5">
            <span className="w-10 h-10 rounded-full grid place-content-center text-xs font-bold text-white"
              style={{ background: tokens.accent }}>MJ</span>
            <span>
              <span className="block text-sm font-semibold">Maya Jensen</span>
              <span className="block text-xs t-muted">Head of Product, Northwind</span>
            </span>
          </figcaption>
        </figure>
        <div className="t-card p-6 text-center flex flex-col items-center">
          <span className="w-20 h-20 rounded-full grid place-content-center font-display text-xl font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${tokens.accent}, ${tokens.primary})` }}>AR</span>
          <div className="font-display text-xl font-semibold mt-3">Amara Reyes</div>
          <div className="text-sm t-muted">Design engineer · Lisbon</div>
          <div className="flex gap-6 text-center mt-4 mb-5">
            {[["248", "Posts"], ["12k", "Followers"], ["312", "Following"]].map(([v, l]) => (
              <span key={l}><span className="block font-semibold">{v}</span><span className="block text-xs t-muted">{l}</span></span>
            ))}
          </div>
          <div className="flex gap-2.5 mt-auto">
            <button className="t-btn t-btn-primary px-5 py-2 text-sm">Follow</button>
            <button className="t-btn t-btn-outline px-5 py-2 text-sm">Message</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ media ------------------------------- */

function Media() {
  const { tokens } = useTheme();
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <SectionHead index="08 — Media" title="Gallery, video & people" blurb="Image grids, embeds, avatar stacks, and activity feeds." />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Nordic loft", "Dec 12", `linear-gradient(135deg, ${tokens.primary}, #00000055)`],
              ["Studio desk", "Dec 10", `linear-gradient(135deg, ${tokens.accent}, ${tokens.primary})`],
              ["Reading nook", "Dec 8", `linear-gradient(135deg, #888, ${tokens.text})`],
              ["Kitchen edit", "Dec 5", `linear-gradient(135deg, ${tokens.text}, ${tokens.accent})`],
              ["Hallway", "Dec 2", `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`],
              ["Archive", "Nov 28", `linear-gradient(135deg, ${tokens.muted}, ${tokens.text})`],
            ].map(([t, d, bg]) => (
              <figure key={t as string} className="t-card overflow-hidden group cursor-pointer">
                <div className="aspect-[4/3] grid place-content-center text-white/90 font-display font-semibold transition group-hover:brightness-110"
                  style={{ background: bg as string }}>{t}</div>
                <figcaption className="px-3 py-2 text-xs flex justify-between">
                  <span className="font-semibold">{t}</span><span className="t-muted">{d}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="t-card mt-4 aspect-video grid place-content-center relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${tokens.text} 0%, ${tokens.primary} 100%)`, opacity: 0.92 }} />
            <button className="relative w-16 h-16 rounded-full bg-white text-black grid place-content-center transition hover:brightness-90" aria-label="Play product film">
              {Icon.play(22)}
            </button>
            <span className="absolute bottom-3 right-3 font-code text-[11px] bg-black/60 text-white px-2 py-0.5 rounded">02:47</span>
            <span className="absolute bottom-3 left-3 text-[13px] text-white font-semibold">Product film — “Calm planning”</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="t-card p-5">
            <div className="text-sm font-semibold mb-3">Team online</div>
            <div className="space-y-3">
              {[["Ada Lovelace", "Editing homepage", "var(--success)"], ["Alan Turing", "Reviewing PR #482", "var(--success)"], ["Grace Hopper", "Away — back 2pm", "var(--warning)"]].map(([n, s, dot]) => (
                <div key={n as string} className="flex items-center gap-3 text-sm">
                  <span className="relative w-9 h-9 rounded-full grid place-content-center text-[11px] font-bold text-white"
                    style={{ background: tokens.primary }}>
                    {(n as string).split(" ").map((w) => w[0]).join("")}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: dot as string, borderColor: tokens.surface }} />
                  </span>
                  <span><span className="block font-semibold">{n}</span><span className="block text-xs t-muted">{s}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="t-card p-5">
            <div className="text-sm font-semibold mb-3">Activity</div>
            <ol className="relative border-l t-border ml-1.5 space-y-4 text-sm">
              {[
                ["Deploy v2.4.1 finished", "2 min ago"],
                ["Maya commented on Homepage", "26 min ago"],
                ["Invoice #1042 paid", "1 h ago"],
                ["Alan joined Design team", "3 h ago"],
              ].map(([t, w]) => (
                <li key={t as string} className="pl-4 relative">
                  <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full"
                    style={{ background: "var(--bg)", border: "2px solid var(--primary)" }} />
                  <span className="block">{t}</span>
                  <span className="block text-xs t-muted">{w}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- steps + dashboard ---------------------- */

function StepsDashboard() {
  const [step, setStep] = useState(1);
  const { tokens } = useTheme();
  const steps = ["Account", "Workspace", "Invite team", "Done"];
  return (
    <section id="product" className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <SectionHead index="09 — Flows" title="Steps & dashboard" blurb="Onboarding wizards and a compact analytics layout." />
      <div className="grid md:grid-cols-5 gap-4">
        <div className="t-card p-6 md:col-span-2">
          <div className="text-sm font-semibold mb-4">Create your workspace</div>
          <ol className="space-y-1 mb-5">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-sm py-1.5">
                <span className="w-7 h-7 rounded-full grid place-content-center text-xs font-bold"
                  style={i < step
                    ? { background: "var(--primary)", color: "var(--primary-ink)" }
                    : i === step
                      ? { border: "2px solid var(--primary)", color: "var(--primary)" }
                      : { background: "var(--surface-2)", color: "var(--muted)" }}>
                  {i < step ? Icon.check(13) : i + 1}
                </span>
                <span className={i <= step ? "font-semibold" : "t-muted"}>{s}</span>
              </li>
            ))}
          </ol>
          <div className="t-surface-2 text-sm p-3.5 mb-4 min-h-[88px]" style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
            {step === 0 && "Pick a name and a photo — you can change both later."}
            {step === 1 && "Workspaces hold projects, docs, and dashboards in one sidebar."}
            {step === 2 && "Teammates join with one link. Guests are free on every plan."}
            {step === 3 && "Done. Your dashboard is ready — import data to see it live."}
          </div>
          <div className="flex justify-between">
            <button disabled={step === 0} onClick={() => setStep((s) => s - 1)}
              className="t-btn t-btn-outline px-4 py-2 text-sm">Back</button>
            <button onClick={() => setStep((s) => Math.min(3, s + 1))}
              className="t-btn t-btn-primary px-4 py-2 text-sm">
              {step === 3 ? "Launch dashboard" : "Continue"}
            </button>
          </div>
        </div>
        <div className="t-card overflow-hidden md:col-span-3 flex min-h-72">
          <aside className="hidden sm:flex flex-col gap-1 w-44 t-surface-2 p-3 text-sm border-r t-border">
            {["Overview", "Projects", "Calendar", "Reports", "Settings"].map((l, i) => (
              <span key={l} className="px-3 py-2 font-semibold"
                style={{
                  borderRadius: "calc(var(--radius) * 0.5)",
                  background: i === 0 ? "var(--surface)" : "transparent",
                  boxShadow: i === 0 ? "0 1px 2px rgb(0 0 0 / .08)" : "none",
                }}>{l}</span>
            ))}
            <span className="mt-auto px-3 py-2 t-muted text-xs">v2.4.1 · All systems go</span>
          </aside>
          <div className="flex-1 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Traffic sources</div>
              <span className="t-chip text-xs px-2 py-1 font-code">last 30 days</span>
            </div>
            {[
              ["Direct", 82], ["Search", 64], ["Social", 45], ["Referral", 28],
            ].map(([l, v]) => (
              <div key={l as string} className="mb-3">
                <div className="flex justify-between text-xs mb-1"><span>{l}</span><span className="t-muted">{v}%</span></div>
                <div className="h-2.5 t-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: tokens.primary }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="t-surface-2 p-3" style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
                <span className="t-muted text-xs block">Bounce rate</span>
                <span className="font-display text-xl font-semibold">32%</span>
              </div>
              <div className="t-surface-2 p-3" style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
                <span className="t-muted text-xs block">Avg. session</span>
                <span className="font-display text-xl font-semibold">4m 12s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ newsletter -------------------------- */

function Newsletter({ notify }: { notify: (t: string, m: string) => void }) {
  const [email, setEmail] = useState("");
  const { tokens } = useTheme();
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t t-border">
      <div className="p-8 sm:p-12 text-center overflow-hidden"
        style={{
          borderRadius: "var(--radius)",
          background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
          color: "#fff",
        }}>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold">Get the monthly changelog</h2>
        <p className="mt-2 text-white/85 max-w-md mx-auto">One email a month. New features, templates, and teardown essays. No spam, ever.</p>
        <form className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@")) { notify("Invalid email", "Enter an address like ada@pixel.llc."); return; }
            notify("Subscribed", `${email} joined the list.`);
            setEmail("");
          }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com" aria-label="Email address"
            className="flex-1 px-4 py-2.5 text-sm text-black bg-white outline-none"
            style={{ borderRadius: "calc(var(--radius) * 0.66)" }} />
          <button className="px-5 py-2.5 text-sm font-bold bg-black/85 text-white hover:bg-black"
            style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>
            Subscribe
          </button>
        </form>
        <p className="text-xs text-white/70 mt-3">Join 48,000 readers · Unsubscribe anytime</p>
      </div>
    </section>
  );
}

/* -------------------------------- footer ---------------------------- */

function Footer() {
  const cols: [string, string[]][] = [
    ["Product", ["Features", "Pricing", "Changelog", "Roadmap"]],
    ["Resources", ["Documentation", "API reference", "Templates", "Status"]],
    ["Company", ["About", "Blog", "Careers", "Contact"]],
    ["Legal", ["Privacy", "Terms", "Security", "DPA"]],
  ];
  return (
    <footer className="border-t t-border t-surface">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="t-primary w-8 h-8 grid place-content-center"
              style={{ borderRadius: "calc(var(--radius) * 0.66)" }}>P</span>
            Pixel LLC
          </div>
          <p className="text-sm t-muted mt-3 max-w-xs">One workspace for docs, projects, and dashboards. Built for teams that ship.</p>
          <div className="flex gap-2 mt-4">
            {["X", "in", "gh", "yt"].map((s) => (
              <button key={s} aria-label={`${s} profile`}
                className="t-btn t-btn-outline w-9 h-9 grid place-content-center text-xs font-bold font-code">{s}</button>
            ))}
          </div>
        </div>
        <nav className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm" aria-label="Footer">
          {cols.map(([h, links]) => (
            <div key={h}>
              <div className="font-semibold mb-3">{h}</div>
              <ul className="space-y-2 t-muted">
                {links.map((l) => (
                  <li key={l}><a href="#top" className="t-muted hover-primary hover:underline">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t t-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-2 text-xs t-muted">
          <span>© 2026 Pixel LLC. All rights reserved.</span>
          <span className="sm:ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------------- page ----------------------------- */

export interface Toast {
  id: number;
  title: string;
  message: string;
}

export default function Showcase({ notify }: { notify: (t: string, m: string) => void }) {
  const [cartCount, setCartCount] = useState(0);
  const add = () => {
    setCartCount((c) => c + 1);
    notify("Added to cart", "Aura Lounge Chair × 1.");
  };
  return (
    <div id="top" className="pb-40">
      <SiteNav cartCount={cartCount} />
      <main>
        <Hero onAdd={add} />
        <LogoCloud />
        <Buttons />
        <Typography />
        <Forms />
        <Feedback notify={notify} />
        <TabsFaq />
        <DataTable />
        <Cards onAdd={add} />
        <Media />
        <StepsDashboard />
        <Newsletter notify={notify} />
      </main>
      <Footer />
    </div>
  );
}
