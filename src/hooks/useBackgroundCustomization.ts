import { useEffect, useMemo, useState } from "react";
import { ensureDarkBackground, hexToRgbaCss } from "../utils/colors";

type BackgroundMode = "color" | "image";

export type SectionScaleKey =
  | "timerScalePercent"
  | "scoresScalePercent"
  | "shotClockScalePercent"
  | "foulsScalePercent"
  | "timeoutsScalePercent";

export type DisplayCustomization = {
  mode: BackgroundMode;
  backgroundColor: string;
  imageDataUrl: string | null;
  overlayColor: string;
  overlayOpacity: number;
  /** Overall scoreboard scale (100 = default). */
  displayScalePercent: number;
  /** Extra space from the top edge of the viewport (px). */
  topOffsetPx: number;
  /** Per-section scale (100 = default), relative to overall size. */
  timerScalePercent: number;
  scoresScalePercent: number;
  shotClockScalePercent: number;
  foulsScalePercent: number;
  timeoutsScalePercent: number;
};

/**
 * Per-section sizing. Uses `zoom` so layout height/width grow with the scale
 * (unlike `transform: scale`, which visually scales but leaves flow unchanged
 * and causes overlap with siblings — e.g. fouls on top of enlarged scores).
 */
export function sectionScaleStyle(percent: number): React.CSSProperties {
  return { zoom: percent / 100 };
}

const LEGACY_STORAGE_KEY = "hdc.backgroundCustomization.v1";
const STORAGE_KEY = "hdc.displayCustomization.v1";
const DEFAULT_BG = "#141414";

export const SCALE_MIN = 70;
export const SCALE_MAX = 130;
export const SCALE_STEP = 5;

export const OFFSET_MIN = 0;
export const OFFSET_MAX = 280;
export const OFFSET_STEP = 8;

const DEFAULTS: DisplayCustomization = {
  mode: "color",
  backgroundColor: DEFAULT_BG,
  imageDataUrl: null,
  overlayColor: DEFAULT_BG,
  overlayOpacity: 0.62,
  displayScalePercent: 100,
  topOffsetPx: 0,
  timerScalePercent: 100,
  scoresScalePercent: 100,
  shotClockScalePercent: 100,
  foulsScalePercent: 100,
  timeoutsScalePercent: 100,
};

function clampScale(n: number) {
  const stepped = Math.round(n / SCALE_STEP) * SCALE_STEP;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, stepped));
}

function clampOffset(n: number) {
  const stepped = Math.round(n / OFFSET_STEP) * OFFSET_STEP;
  return Math.min(OFFSET_MAX, Math.max(OFFSET_MIN, stepped));
}

function parseLegacyBackground(raw: string | null): Omit<
  DisplayCustomization,
  | "displayScalePercent"
  | "topOffsetPx"
  | SectionScaleKey
> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DisplayCustomization> & {
      color?: string;
      colorOverlayOpacity?: number;
      imageOverlayOpacity?: number;
    };

    const mode: BackgroundMode =
      parsed.mode === "image" || parsed.mode === "color"
        ? parsed.mode
        : parsed.imageDataUrl
          ? "image"
          : "color";

    const backgroundColorRaw =
      typeof parsed.backgroundColor === "string"
        ? parsed.backgroundColor
        : typeof parsed.color === "string"
          ? parsed.color
          : DEFAULTS.backgroundColor;

    const overlayColorRaw =
      typeof parsed.overlayColor === "string"
        ? parsed.overlayColor
        : typeof parsed.color === "string"
          ? parsed.color
          : DEFAULTS.overlayColor;

    const imageDataUrl =
      typeof parsed.imageDataUrl === "string" || parsed.imageDataUrl === null
        ? parsed.imageDataUrl ?? null
        : null;

    const overlayOpacityRaw =
      typeof parsed.overlayOpacity === "number"
        ? parsed.overlayOpacity
        : typeof parsed.colorOverlayOpacity === "number"
          ? parsed.colorOverlayOpacity
          : typeof parsed.imageOverlayOpacity === "number"
            ? parsed.imageOverlayOpacity
            : DEFAULTS.overlayOpacity;

    const overlayOpacity = Math.min(0.9, Math.max(0, overlayOpacityRaw));

    return {
      mode,
      backgroundColor: ensureDarkBackground(backgroundColorRaw),
      imageDataUrl,
      overlayColor: ensureDarkBackground(overlayColorRaw),
      overlayOpacity,
    };
  } catch {
    return null;
  }
}

function parseDisplayCustomization(raw: string | null): DisplayCustomization | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DisplayCustomization>;
    const base = parseLegacyBackground(raw);
    if (!base) return null;
    const displayScalePercent =
      typeof parsed.displayScalePercent === "number"
        ? clampScale(parsed.displayScalePercent)
        : DEFAULTS.displayScalePercent;
    const topOffsetPx =
      typeof parsed.topOffsetPx === "number" ? clampOffset(parsed.topOffsetPx) : DEFAULTS.topOffsetPx;
    const timerScalePercent =
      typeof parsed.timerScalePercent === "number"
        ? clampScale(parsed.timerScalePercent)
        : DEFAULTS.timerScalePercent;
    const scoresScalePercent =
      typeof parsed.scoresScalePercent === "number"
        ? clampScale(parsed.scoresScalePercent)
        : DEFAULTS.scoresScalePercent;
    const shotClockScalePercent =
      typeof parsed.shotClockScalePercent === "number"
        ? clampScale(parsed.shotClockScalePercent)
        : DEFAULTS.shotClockScalePercent;
    const foulsScalePercent =
      typeof parsed.foulsScalePercent === "number"
        ? clampScale(parsed.foulsScalePercent)
        : DEFAULTS.foulsScalePercent;
    const timeoutsScalePercent =
      typeof parsed.timeoutsScalePercent === "number"
        ? clampScale(parsed.timeoutsScalePercent)
        : DEFAULTS.timeoutsScalePercent;
    return {
      ...base,
      displayScalePercent,
      topOffsetPx,
      timerScalePercent,
      scoresScalePercent,
      shotClockScalePercent,
      foulsScalePercent,
      timeoutsScalePercent,
    };
  } catch {
    return null;
  }
}

function loadInitial(): DisplayCustomization {
  const merged = parseDisplayCustomization(localStorage.getItem(STORAGE_KEY));
  if (merged) return merged;
  const legacy = parseLegacyBackground(localStorage.getItem(LEGACY_STORAGE_KEY));
  if (legacy) {
    return {
      ...legacy,
      displayScalePercent: DEFAULTS.displayScalePercent,
      topOffsetPx: DEFAULTS.topOffsetPx,
      timerScalePercent: DEFAULTS.timerScalePercent,
      scoresScalePercent: DEFAULTS.scoresScalePercent,
      shotClockScalePercent: DEFAULTS.shotClockScalePercent,
      foulsScalePercent: DEFAULTS.foulsScalePercent,
      timeoutsScalePercent: DEFAULTS.timeoutsScalePercent,
    };
  }
  return DEFAULTS;
}

export function useBackgroundCustomization() {
  const [customization, setCustomization] = useState<DisplayCustomization>(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
  }, [customization]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = parseDisplayCustomization(e.newValue);
      if (!next) return;
      setCustomization(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const backgroundOuterStyle = useMemo<React.CSSProperties>(() => {
    if (customization.mode === "image" && customization.imageDataUrl) {
      const overlayColor = ensureDarkBackground(customization.overlayColor);
      const overlay = Math.min(0.9, Math.max(0, customization.overlayOpacity));
      const overlayCss = hexToRgbaCss(overlayColor, overlay);
      return {
        backgroundImage: `linear-gradient(${overlayCss}, ${overlayCss}), url(${customization.imageDataUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: DEFAULT_BG,
      };
    }
    return { backgroundColor: ensureDarkBackground(customization.backgroundColor) };
  }, [
    customization.mode,
    customization.imageDataUrl,
    customization.overlayColor,
    customization.overlayOpacity,
    customization.backgroundColor,
  ]);

  const backgroundInnerStyle = useMemo<React.CSSProperties>(() => {
    if (customization.mode === "image" && customization.imageDataUrl) {
      return { backgroundColor: "transparent" };
    }
    return { backgroundColor: ensureDarkBackground(customization.backgroundColor) };
  }, [customization.mode, customization.imageDataUrl, customization.backgroundColor]);

  const outerStyle = useMemo<React.CSSProperties>(
    () => ({
      ...backgroundOuterStyle,
      paddingTop: customization.topOffsetPx,
    }),
    [backgroundOuterStyle, customization.topOffsetPx],
  );

  const innerStyle = useMemo<React.CSSProperties>(
    () => ({
      ...backgroundInnerStyle,
      transform: `scale(${customization.displayScalePercent / 100})`,
      transformOrigin: "top center",
    }),
    [backgroundInnerStyle, customization.displayScalePercent],
  );

  return {
    customization,
    setCustomization,
    outerStyle,
    innerStyle,
    reset: () => setCustomization(DEFAULTS),
    setMode: (mode: BackgroundMode) => setCustomization((c) => ({ ...c, mode })),
    clearImage: () => setCustomization((c) => ({ ...c, imageDataUrl: null })),
    setBackgroundColor: (backgroundColor: string) =>
      setCustomization((c) => ({ ...c, backgroundColor: ensureDarkBackground(backgroundColor) })),
    setImageDataUrl: (imageDataUrl: string | null) => setCustomization((c) => ({ ...c, imageDataUrl })),
    setOverlayColor: (overlayColor: string) =>
      setCustomization((c) => ({ ...c, overlayColor: ensureDarkBackground(overlayColor) })),
    setOverlayOpacity: (overlayOpacity: number) =>
      setCustomization((c) => ({
        ...c,
        overlayOpacity: Math.min(0.9, Math.max(0, overlayOpacity)),
      })),
    setDisplayScalePercent: (displayScalePercent: number) =>
      setCustomization((c) => ({ ...c, displayScalePercent: clampScale(displayScalePercent) })),
    adjustDisplayScale: (deltaPercent: number) =>
      setCustomization((c) => ({
        ...c,
        displayScalePercent: clampScale(c.displayScalePercent + deltaPercent),
      })),
    setTopOffsetPx: (topOffsetPx: number) =>
      setCustomization((c) => ({ ...c, topOffsetPx: clampOffset(topOffsetPx) })),
    adjustTopOffset: (deltaPx: number) =>
      setCustomization((c) => ({
        ...c,
        topOffsetPx: clampOffset(c.topOffsetPx + deltaPx),
      })),
    adjustSectionScale: (key: SectionScaleKey, deltaPercent: number) =>
      setCustomization((c) => ({
        ...c,
        [key]: clampScale(c[key] + deltaPercent),
      })),
  };
}
