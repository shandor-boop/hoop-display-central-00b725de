import { useId, useRef, useState } from "react";
import {
  useBackgroundCustomization,
  type TextColorKey,
  OFFSET_MAX,
  OFFSET_MIN,
  OFFSET_STEP,
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
} from "../hooks/useBackgroundCustomization";

type Props = {
  className?: string;
};

type CustomizeTab = "resize" | "background" | "height" | "text";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
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

    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function SectionScaleRow({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-200 text-[11px] font-semibold leading-tight shrink min-w-0 pr-1">{label}</span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onDec}
          disabled={value <= SCALE_MIN}
          className="h-7 w-7 rounded border border-white/15 text-gray-100 text-sm leading-none hover:bg-white/5 disabled:opacity-35"
          aria-label={`Decrease ${label} size`}
        >
          −
        </button>
        <div className="min-w-[2.75rem] text-center text-xs font-semibold text-white tabular-nums">{value}%</div>
        <button
          type="button"
          onClick={onInc}
          disabled={value >= SCALE_MAX}
          className="h-7 w-7 rounded border border-white/15 text-gray-100 text-sm leading-none hover:bg-white/5 disabled:opacity-35"
          aria-label={`Increase ${label} size`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function TextColorRow({
  label,
  colorId,
  value,
  onChange,
}: {
  label: string;
  colorId: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-gray-200 text-[10px] font-semibold leading-tight shrink-0 w-[5.5rem]">{label}</span>
      <input
        id={colorId}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-8 rounded border border-white/15 bg-transparent p-0 shrink-0"
        aria-label={`${label} colour`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 h-7 rounded bg-black/40 border border-white/10 text-gray-100 px-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
        spellCheck={false}
      />
    </div>
  );
}

const TEXT_COLOR_ROWS: { key: TextColorKey; label: string }[] = [
  { key: "clockTextColor", label: "Clock" },
  { key: "homeScoreTextColor", label: "Home Score" },
  { key: "awayScoreTextColor", label: "Away Score" },
  { key: "periodTextColor", label: "Period" },
  { key: "shotClockTextColor", label: "Shot Clock" },
  { key: "homeFoulsTextColor", label: "Home Fouls" },
  { key: "awayFoulsTextColor", label: "Away Fouls" },
];

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
    adjustDisplayScale,
    adjustTopOffset,
    adjustSectionScale,
    setTextColor,
  } = useBackgroundCustomization();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<CustomizeTab>("resize");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgColorId = useId();
  const overlayColorId = useId();
  const overlayId = useId();

  const tabBtn = (id: CustomizeTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`flex-1 h-8 rounded border text-[11px] font-semibold transition-colors ${
        tab === id ? "border-yellow-400 bg-white/10 text-gray-100" : "border-white/15 text-gray-300 hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`fixed bottom-2 right-2 z-50 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-gray-200/80 hover:text-gray-100 text-xs sm:text-sm focus:outline-none transition-colors opacity-70 hover:opacity-100 border border-white/15 hover:border-white/30 bg-black/30 hover:bg-black/45 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm"
        title="Customize display"
      >
        Customize
      </button>

      {open && (
        <div className="mt-2 w-[min(100vw-1rem,320px)] max-h-[min(85vh,620px)] overflow-y-auto rounded-lg border border-white/10 bg-black/70 backdrop-blur-sm p-3 text-left shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white text-sm font-semibold">Customize</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-200 text-sm focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 mb-3">
            {tabBtn("resize", "Resize")}
            {tabBtn("background", "Background")}
            {tabBtn("height", "Height")}
            {tabBtn("text", "Colours")}
          </div>

          {tab === "resize" && (
            <div className="space-y-3">
              <p className="text-[11px] text-gray-400 leading-snug">
                Overall and section sizes ({SCALE_MIN}–{SCALE_MAX}%). Syncs to split-view via browser storage.
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-200 text-xs font-semibold">Overall</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustDisplayScale(-SCALE_STEP)}
                    disabled={customization.displayScalePercent <= SCALE_MIN}
                    className="h-8 w-8 rounded border border-white/15 text-gray-100 text-sm hover:bg-white/5 disabled:opacity-35"
                    aria-label="Decrease overall size"
                  >
                    −
                  </button>
                  <div className="min-w-[3.25rem] text-center text-sm font-semibold text-white tabular-nums">
                    {customization.displayScalePercent}%
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustDisplayScale(SCALE_STEP)}
                    disabled={customization.displayScalePercent >= SCALE_MAX}
                    className="h-8 w-8 rounded border border-white/15 text-gray-100 text-sm hover:bg-white/5 disabled:opacity-35"
                    aria-label="Increase overall size"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Sections</div>
              <SectionScaleRow
                label="Game clock"
                value={customization.timerScalePercent}
                onDec={() => adjustSectionScale("timerScalePercent", -SCALE_STEP)}
                onInc={() => adjustSectionScale("timerScalePercent", SCALE_STEP)}
              />
              <SectionScaleRow
                label="Scores"
                value={customization.scoresScalePercent}
                onDec={() => adjustSectionScale("scoresScalePercent", -SCALE_STEP)}
                onInc={() => adjustSectionScale("scoresScalePercent", SCALE_STEP)}
              />
              <SectionScaleRow
                label="Shot clock"
                value={customization.shotClockScalePercent}
                onDec={() => adjustSectionScale("shotClockScalePercent", -SCALE_STEP)}
                onInc={() => adjustSectionScale("shotClockScalePercent", SCALE_STEP)}
              />
              <SectionScaleRow
                label="Fouls"
                value={customization.foulsScalePercent}
                onDec={() => adjustSectionScale("foulsScalePercent", -SCALE_STEP)}
                onInc={() => adjustSectionScale("foulsScalePercent", SCALE_STEP)}
              />
              <SectionScaleRow
                label="Timeouts"
                value={customization.timeoutsScalePercent}
                onDec={() => adjustSectionScale("timeoutsScalePercent", -SCALE_STEP)}
                onInc={() => adjustSectionScale("timeoutsScalePercent", SCALE_STEP)}
              />
            </div>
          )}

          {tab === "height" && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 leading-snug">
                Offset from the top of the screen ({OFFSET_MIN}–{OFFSET_MAX}px). Larger pushes the board down.
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-200 text-xs font-semibold">Top offset</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustTopOffset(-OFFSET_STEP)}
                    disabled={customization.topOffsetPx <= OFFSET_MIN}
                    className="h-8 w-8 rounded border border-white/15 text-gray-100 text-sm hover:bg-white/5 disabled:opacity-35"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <div className="min-w-[3.25rem] text-center text-sm font-semibold text-white tabular-nums">
                    {customization.topOffsetPx}px
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustTopOffset(OFFSET_STEP)}
                    disabled={customization.topOffsetPx >= OFFSET_MAX}
                    className="h-8 w-8 rounded border border-white/15 text-gray-100 text-sm hover:bg-white/5 disabled:opacity-35"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "text" && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 leading-snug">
                Scoreboard number colours (defaults match the original theme). ≤10s shot clock still uses red for
                warning. Reset all restores these defaults.
              </p>
              <div className="space-y-2.5">
                {TEXT_COLOR_ROWS.map((row) => (
                  <TextColorRow
                    key={row.key}
                    label={row.label}
                    colorId={`hdc-text-${row.key}`}
                    value={customization[row.key]}
                    onChange={(hex) => setTextColor(row.key, hex)}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "background" && (
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

                  <div className="flex items-center gap-2 flex-wrap">
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
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 mt-1 border-t border-white/10">
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
              Reset all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
