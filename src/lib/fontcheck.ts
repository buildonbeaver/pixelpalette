/* Detect whether a locally-installed font family actually renders in this
   browser. Some families returned by queryLocalFonts() (dot-prefixed macOS
   internals, font collections, etc.) enumerate fine but can never be
   activated by a web page — and the failure is silent (fallback renders). */

export function isUnusableFamily(family: string): boolean {
  const t = family.trim();
  return t.length === 0 || t.startsWith(".") || /^lastresort$/i.test(t);
}

function measuredWidth(font: string): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.font = font;
  return ctx.measureText("AaBbGgQqRr0123@&").width;
}

/** Canvas test: renders iff it differs from at least one generic fallback. */
export function isFontRendering(family: string): boolean {
  const safe = family.replace(/"/g, "");
  const fallbacks = ["monospace", "sans-serif", "serif"];
  return fallbacks.some((fb) => {
    const withFont = measuredWidth(`72px "${safe}", ${fb}`);
    const base = measuredWidth(`72px ${fb}`);
    return Math.abs(withFont - base) > 0.5;
  });
}

/**
 * Verify a local family resolves. Never throws; on any measurement error we
 * assume success so we never block a working font.
 */
export async function verifyLocalFont(family: string): Promise<boolean> {
  try {
    if ("fonts" in document) {
      await document.fonts
        .load(`40px "${family.replace(/"/g, "")}"`, "Ag")
        .catch(() => []);
      if (document.fonts.check(`40px "${family.replace(/"/g, "")}"`)) return true;
    }
  } catch {
    /* fall through to canvas test */
  }
  try {
    return isFontRendering(family);
  } catch {
    return true;
  }
}
