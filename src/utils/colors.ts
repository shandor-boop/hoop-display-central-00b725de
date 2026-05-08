export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace(/^#/, "");
  if (![3, 6].includes(raw.length)) return null;
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const int = Number.parseInt(full, 16);
  if (!Number.isFinite(int)) return null;
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function hexToRgbaCss(hex: string, alpha: number) {
  const rgb = hexToRgb(hex);
  const a = clamp01(alpha);
  if (!rgb) return `rgba(20,20,20,${a})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

/** Normalize user-entered hex; invalid input returns `fallback`. */
export function normalizeHexColor(input: string, fallback: string) {
  const raw = input?.trim();
  if (!raw) return fallback;
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  if (hexToRgb(withHash)) return withHash.toLowerCase();
  return fallback;
}

// Relative luminance per WCAG (sRGB)
function srgbToLinear(c: number) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function darkenHex(hex: string, amount01: number) {
  const rgb = hexToRgb(hex);
  const amt = clamp01(amount01);
  if (!rgb) return "#141414";
  const r = Math.round(rgb.r * (1 - amt));
  const g = Math.round(rgb.g * (1 - amt));
  const b = Math.round(rgb.b * (1 - amt));
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

// Keep backgrounds in a "safe" dark range so white/yellow text stays readable.
export function ensureDarkBackground(hex: string) {
  let candidate = hex?.trim() ? hex : "#141414";
  if (!candidate.startsWith("#")) candidate = `#${candidate}`;

  // If too bright, darken progressively.
  // Target luminance roughly <= 0.10 (dark theme-ish).
  let lum = relativeLuminance(candidate);
  let i = 0;
  while (lum > 0.1 && i < 8) {
    candidate = darkenHex(candidate, 0.15);
    lum = relativeLuminance(candidate);
    i += 1;
  }
  return candidate;
}

