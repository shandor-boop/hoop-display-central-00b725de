import { useId, useRef, useState } from "react";
import { useBackgroundCustomization } from "../hooks/useBackgroundCustomization";

type Props = {
  className?: string;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB before we downscale/compress
const MAX_DIMENSION = 1920;

async function fileToDataUrlScaled(file: File) {
  const buf = await file.arrayBuffer();
  const blobUrl = URL.createObjectURL(new Blob([buf], { type: file.type || "application/octet-stream" }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Failed to load image"));
      el.src = blobUrl;
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, tw, th);

    // Prefer JPEG for size; background photos compress well.
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export function BackgroundCustomizer({ className = "" }: Props) {
  const {
    customization,
    setMode,
    setBackgroundColor,
    setImageDataUrl,
    setOverlayColor,
    setOverlayOpacity,
    clearImage,
    reset,
  } =
    useBackgroundCustomization();
  const [open, setOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgColorId = useId();
  const overlayColorId = useId();
  const overlayId = useId();

  return (
    <div className={`fixed bottom-2 right-2 z-50 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-gray-200/80 hover:text-gray-100 text-xs sm:text-sm focus:outline-none transition-colors opacity-70 hover:opacity-100 border border-white/15 hover:border-white/30 bg-black/30 hover:bg-black/45 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm"
        title="Customize background"
      >
        Customize
      </button>

      {open && (
        <div className="mt-2 w-[260px] rounded-lg border border-white/10 bg-black/70 backdrop-blur-sm p-3 text-left shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white text-sm font-semibold">Background</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-200 text-sm focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="block text-gray-200 text-xs font-semibold mb-1">Mode</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode("color")}
                  className={`h-8 px-2 rounded border text-gray-100 text-xs transition-colors ${
                    customization.mode === "color"
                      ? "border-yellow-400 bg-white/10"
                      : "border-white/15 hover:bg-white/5"
                  }`}
                >
                  Background color
                </button>
                <button
                  type="button"
                  onClick={() => setMode("image")}
                  className={`h-8 px-2 rounded border text-gray-100 text-xs transition-colors ${
                    customization.mode === "image"
                      ? "border-yellow-400 bg-white/10"
                      : "border-white/15 hover:bg-white/5"
                  }`}
                >
                  Image + overlay
                </button>
              </div>
            </div>

            {customization.mode === "color" && (
              <div>
                <label htmlFor={bgColorId} className="block text-gray-200 text-xs font-semibold mb-1">
                  Background color (auto-kept dark)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={bgColorId}
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-8 w-10 rounded border border-white/15 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customization.backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 h-8 rounded bg-black/40 border border-white/10 text-gray-100 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {customization.mode === "image" && (
              <div>
                <div className="block text-gray-200 text-xs font-semibold mb-1">Image + overlay</div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-2 rounded border border-white/15 text-gray-100 text-xs hover:bg-white/5 transition-colors"
                  >
                    Upload…
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={!customization.imageDataUrl}
                    className="h-8 px-2 rounded border border-white/15 text-gray-100 text-xs hover:bg-white/5 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    Clear
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="h-8 px-2 rounded border border-white/15 text-gray-100 text-xs hover:bg-white/5 transition-colors"
                      title="Reload to apply everywhere"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="h-8 px-2 rounded border border-white/15 text-gray-100 text-xs hover:bg-white/5 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {uploadError && <div className="mt-2 text-[11px] text-red-300">{uploadError}</div>}

                <div className="mt-2">
                  <label htmlFor={overlayColorId} className="block text-gray-200 text-xs font-semibold mb-1">
                    Overlay color (auto-kept dark)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={overlayColorId}
                      type="color"
                      value={customization.overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      className="h-8 w-10 rounded border border-white/15 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={customization.overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      className="flex-1 h-8 rounded bg-black/40 border border-white/10 text-gray-100 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      spellCheck={false}
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label htmlFor={overlayId} className="block text-gray-200 text-xs font-semibold mb-1">
                    Overlay opacity (readability)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={overlayId}
                      type="range"
                      min={0}
                      max={90}
                      value={Math.round((customization.overlayOpacity ?? 0.62) * 100)}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                      className="flex-1"
                    />
                    <div className="w-10 text-right text-[11px] text-gray-300 tabular-nums">
                      {Math.round((customization.overlayOpacity ?? 0.62) * 100)}%
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadError(null);

                    const okType =
                      file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp";
                    if (!okType) {
                      setUploadError("Please choose a PNG, JPEG, or WebP image.");
                      e.target.value = "";
                      return;
                    }

                    // Always downscale/compress to keep localStorage stable.
                    // Large images can exceed browser storage limits if stored as a raw data URL.
                    (async () => {
                      try {
                        if (file.size > MAX_UPLOAD_BYTES) {
                          setUploadError("Large image detected — downscaling/compressing…");
                        }
                        const dataUrl = await fileToDataUrlScaled(file);
                        setImageDataUrl(dataUrl);
                        setUploadError(null);
                      } catch {
                        setUploadError("Upload failed. Try a smaller image (or PNG/JPEG/WebP).");
                      }
                    })();

                    e.target.value = "";
                  }}
                />

                <div className="mt-1 text-[11px] text-gray-400">
                  Tip: use PNG/JPEG/WebP. Very large images are auto-downscaled to keep things stable.
                </div>
              </div>
            )}

            {/* Always available */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="h-8 px-2 rounded border border-white/15 text-gray-100 text-xs hover:bg-white/5 transition-colors"
                title="Reload to apply everywhere"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={reset}
                className="h-8 px-2 rounded border border-white/15 text-gray-100 text-xs hover:bg-white/5 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

