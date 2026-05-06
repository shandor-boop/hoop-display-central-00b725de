import { useEffect, useMemo, useState } from "react";
import { ensureDarkBackground, hexToRgbaCss } from "../utils/colors";

type BackgroundMode = "color" | "image";

type BackgroundCustomization = {
  mode: BackgroundMode;
  // Color mode background (kept dark for readability)
  backgroundColor: string; // hex

  // Image mode
  imageDataUrl: string | null;
  overlayColor: string; // hex (kept dark for readability)
  overlayOpacity: number; // 0..0.9
};

const STORAGE_KEY = "hdc.backgroundCustomization.v1";
const DEFAULT_BG = "#141414";

const DEFAULTS: BackgroundCustomization = {
  mode: "color",
  backgroundColor: DEFAULT_BG,
  imageDataUrl: null,
  overlayColor: DEFAULT_BG,
  overlayOpacity: 0.62,
};

function safeParse(raw: string | null): BackgroundCustomization | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BackgroundCustomization> & {
      // legacy fields
      color?: string; // previously used as background / overlay color
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

export function useBackgroundCustomization() {
  const [customization, setCustomization] = useState<BackgroundCustomization>(() => {
    const fromStorage = safeParse(localStorage.getItem(STORAGE_KEY));
    return fromStorage ?? DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
  }, [customization]);

  // Sync changes across tabs/windows (e.g. split view display window)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = safeParse(e.newValue);
      if (!next) return;
      setCustomization(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const outerStyle = useMemo<React.CSSProperties>(() => {
    if (customization.mode === "image" && customization.imageDataUrl) {
      const overlayColor = ensureDarkBackground(customization.overlayColor);
      const overlay = Math.min(0.9, Math.max(0, customization.overlayOpacity));
      const overlayCss = hexToRgbaCss(overlayColor, overlay);
      return {
        // Image remains fully opaque; overlay is tinted with selected base color.
        backgroundImage: `linear-gradient(${overlayCss}, ${overlayCss}), url(${customization.imageDataUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: DEFAULT_BG,
      };
    }
    // Color mode (or image mode without image chosen yet)
    return { backgroundColor: ensureDarkBackground(customization.backgroundColor) };
  }, [
    customization.mode,
    customization.imageDataUrl,
    customization.overlayColor,
    customization.overlayOpacity,
    customization.backgroundColor,
  ]);

  const innerStyle = useMemo<React.CSSProperties>(() => {
    // Inner panel should remain consistent and readable regardless of image/overlay.
    if (customization.mode === "image" && customization.imageDataUrl) {
      // In image mode, let the image + overlay show everywhere.
      // Readability is controlled by the overlay itself.
      return { backgroundColor: "transparent" };
    }
    return { backgroundColor: ensureDarkBackground(customization.backgroundColor) };
  }, [customization.mode, customization.imageDataUrl, customization.backgroundColor]);

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
  };
}

