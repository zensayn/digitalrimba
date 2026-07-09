"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type QRCodeStyling from "qr-code-styling";
import type { DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import { Download, GalleryAdd, TrashBinMinimalistic } from "@solar-icons/react";
import { cn } from "@/lib/utils";

const PASS_DATA = "https://rimba.app/pass/PASS-9981-AD";
// Solid canvas color so the ticket punch-notches can match it exactly.
const CANVAS = "#f6f4ef";

type PassTheme = "emerald" | "minimal" | "warm" | "midnight";

const THEMES: Record<PassTheme, {
  name: string;
  cardBg: string;
  border: string;
  divider: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
}> = {
  emerald: {
    name: "Emerald Classic",
    cardBg: "bg-white",
    border: "border-[#346739]/15",
    divider: "border-neutral-300",
    textPrimary: "text-[#212121]",
    textSecondary: "text-[#75758a]",
    accent: "bg-[#346739]",
    accentHex: "#346739",
    badgeBg: "bg-[#edfce9]",
    badgeText: "text-[#346739]",
  },
  minimal: {
    name: "Stark Editorial",
    cardBg: "bg-white",
    border: "border-neutral-200",
    divider: "border-neutral-300",
    textPrimary: "text-[#212121]",
    textSecondary: "text-[#75758a]",
    accent: "bg-[#212121]",
    accentHex: "#212121",
    badgeBg: "bg-neutral-100",
    badgeText: "text-neutral-800",
  },
  warm: {
    name: "Warm Ochre",
    cardBg: "bg-white",
    border: "border-[#e8b94a]/30",
    divider: "border-neutral-300",
    textPrimary: "text-[#212121]",
    textSecondary: "text-[#75758a]",
    accent: "bg-[#e8b94a]",
    accentHex: "#b38600",
    badgeBg: "bg-[#faf5e8]",
    badgeText: "text-[#b38600]",
  },
  midnight: {
    name: "Midnight Velvet",
    cardBg: "bg-[#071829]",
    border: "border-neutral-800",
    divider: "border-neutral-700",
    textPrimary: "text-white",
    textSecondary: "text-[#93939f]",
    accent: "bg-[#4c6ee6]",
    accentHex: "#4c6ee6",
    badgeBg: "bg-[#4c6ee6]/10",
    badgeText: "text-[#4c6ee6]",
  },
};

const QR_COLORS = ["#212121", "#346739", "#003c33", "#071829", "#1863dc", "#ff7759"];

const DOT_STYLES: { type: DotType; label: string; dot: string }[] = [
  { type: "square", label: "Square", dot: "rounded-none" },
  { type: "rounded", label: "Rounded", dot: "rounded-[2px]" },
  { type: "extra-rounded", label: "Extra round", dot: "rounded-[4px]" },
  { type: "dots", label: "Dots", dot: "rounded-full" },
  { type: "classy", label: "Classy", dot: "rounded-tl-full rounded-br-full" },
  { type: "classy-rounded", label: "Classy round", dot: "rounded-tl-full rounded-br-full rounded-tr-[2px] rounded-bl-[2px]" },
];

const MARKER_BORDERS: { type: CornerSquareType; label: string; ring: string }[] = [
  { type: "square", label: "Square", ring: "rounded-none" },
  { type: "extra-rounded", label: "Rounded", ring: "rounded-[7px]" },
  { type: "dot", label: "Circle", ring: "rounded-full" },
];

const MARKER_CENTERS: { type: CornerDotType; label: string; core: string }[] = [
  { type: "square", label: "Square", core: "rounded-none" },
  { type: "dot", label: "Circle", core: "rounded-full" },
];

// ponytail: design persists per-device in localStorage; swap for a backend
// endpoint when pass designs need to follow the account.
const DESIGN_STORAGE_KEY = "rimba-qr-pass-design";

export default function QrPassesPage() {
  const [activeTab, setActiveTab] = useState<"qr" | "pass">("qr");
  const [selectedTheme, setSelectedTheme] = useState<PassTheme>("emerald");
  const [dotType, setDotType] = useState<DotType>("rounded");
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>("extra-rounded");
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>("dot");
  const [qrColor, setQrColor] = useState("#212121");
  const [logo, setLogo] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(true);
  const [showSeat, setShowSeat] = useState(true);
  const [includeVenue, setIncludeVenue] = useState(true);
  const [saved, setSaved] = useState(false);

  const theme = THEMES[selectedTheme];

  // Restore the last saved design (post-mount to avoid a hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Record<string, unknown>;
      if (typeof d.selectedTheme === "string" && d.selectedTheme in THEMES) {
        setSelectedTheme(d.selectedTheme as PassTheme);
      }
      if (typeof d.dotType === "string") setDotType(d.dotType as DotType);
      if (typeof d.cornerSquareType === "string") setCornerSquareType(d.cornerSquareType as CornerSquareType);
      if (typeof d.cornerDotType === "string") setCornerDotType(d.cornerDotType as CornerDotType);
      if (typeof d.qrColor === "string") setQrColor(d.qrColor);
      if (typeof d.logo === "string") setLogo(d.logo);
      if (typeof d.showTable === "boolean") setShowTable(d.showTable);
      if (typeof d.showSeat === "boolean") setShowSeat(d.showSeat);
      if (typeof d.includeVenue === "boolean") setIncludeVenue(d.includeVenue);
    } catch {
      // Corrupt saved design — fall back to defaults.
    }
  }, []);

  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  const qrOptions = useMemo(
    () => ({
      width: 480,
      height: 480,
      type: "svg" as const,
      data: PASS_DATA,
      margin: 8,
      qrOptions: { errorCorrectionLevel: "H" as const },
      image: logo ?? undefined,
      imageOptions: { margin: 8, imageSize: 0.35, hideBackgroundDots: true },
      dotsOptions: { type: dotType, color: qrColor },
      cornersSquareOptions: { type: cornerSquareType, color: qrColor },
      cornersDotOptions: { type: cornerDotType, color: qrColor },
      backgroundOptions: { color: "#ffffff" },
    }),
    [dotType, cornerSquareType, cornerDotType, qrColor, logo]
  );

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.update(qrOptions);
      return;
    }
    let alive = true;
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (!alive || qrRef.current || !qrContainerRef.current) return;
      const qr = new QRCodeStyling(qrOptions);
      qrRef.current = qr;
      qrContainerRef.current.replaceChildren();
      qr.append(qrContainerRef.current);
    }).catch(() => {
      console.error("Failed to load QR renderer");
      toast.error("Couldn't load the QR renderer. Please refresh and try again.");
    });
    return () => {
      alive = false;
    };
  }, [qrOptions]);

  const MAX_LOGO_BYTES = 300 * 1024; // 300KB — this becomes an inline base64 QR option

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Logo image is too large. Please use one under 300KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDownload(extension: "png" | "svg") {
    if (!qrRef.current) {
      toast.error("The QR code is still loading. Please try again in a moment.");
      return;
    }
    qrRef.current.download({ name: "rimba-pass-qr", extension });
  }

  function handleSave() {
    try {
      localStorage.setItem(
        DESIGN_STORAGE_KEY,
        JSON.stringify({
          selectedTheme,
          dotType,
          cornerSquareType,
          cornerDotType,
          qrColor,
          logo,
          showTable,
          showSeat,
          includeVenue,
        })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Couldn't save the design on this device.");
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-10 pb-24">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-[#212121]">
          QR & Passes
        </h1>
        <p className="mt-1.5 text-sm text-[#93939f]">
          Design the QR code and guest pass your guests will scan at check-in.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div
            className="rounded-[32px] border border-[#e5e7eb] px-6 py-8 md:px-8"
            style={{ backgroundColor: CANVAS }}
          >
            {/* Ticket */}
            <div
              className={cn(
                "relative mx-auto w-full max-w-[330px] rounded-[22px] border overflow-hidden transition-colors duration-200",
                theme.cardBg,
                theme.border
              )}
            >
              {/* Header */}
              <div className="px-7 pt-7 pb-6">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-medium uppercase", theme.textSecondary)}>
                    Rimba · Event Access
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase", theme.badgeBg, theme.badgeText)}>
                    VIP
                  </span>
                </div>
                <h4 className={cn("text-[26px] leading-tight font-bold mt-3", theme.textPrimary)}>
                  Ahmad & Dewi
                </h4>
                <p className={cn("text-xs mt-1.5 leading-relaxed", theme.textSecondary)}>
                  Sunday, 20 Dec 2026 · 17:00
                  {includeVenue && (
                    <>
                      <br />
                      Plataran Candi Borobudur
                    </>
                  )}
                </p>
              </div>

              {/* Perforation with punch notches */}
              <div className="relative h-6">
                <div className={cn("absolute left-6 right-6 top-1/2 border-t border-dashed", theme.divider)} />
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ backgroundColor: CANVAS }} />
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ backgroundColor: CANVAS }} />
              </div>

              {/* Stub: QR + guest details */}
              <div className="px-7 pt-4 pb-7">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white rounded-2xl">
                    <div
                      ref={qrContainerRef}
                      className="w-44 h-44 [&_svg]:w-full [&_svg]:h-full [&_canvas]:w-full [&_canvas]:h-full"
                    />
                  </div>
                  <span className={cn("text-[10px] mt-1 font-mono", theme.textSecondary)}>
                    PASS-9981-AD
                  </span>
                </div>

                <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] gap-3 mt-6">
                  <div>
                    <span className={cn("text-[9px] uppercase", theme.textSecondary)}>Guest</span>
                    <p className={cn("text-[13px] font-semibold leading-snug", theme.textPrimary)}>
                      Aditya Pratama
                    </p>
                  </div>
                  <div className="text-center">
                    {showTable && (
                      <>
                        <span className={cn("text-[9px] uppercase", theme.textSecondary)}>Table</span>
                        <p className={cn("text-[13px] font-semibold", theme.textPrimary)}>12</p>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    {showSeat && (
                      <>
                        <span className={cn("text-[9px] uppercase", theme.textSecondary)}>Seat</span>
                        <p className={cn("text-[13px] font-semibold", theme.textPrimary)}>A-04</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Download row */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-[11px] text-[#93939f]">
                Sample pass — each guest gets a unique code.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("png")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d9d9dd] bg-white px-3.5 py-2 text-xs font-medium text-[#212121] transition-[transform,background-color] duration-150 ease-out hover:bg-[#eeece7] active:scale-[0.97]"
                >
                  <Download size={13} />
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("svg")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d9d9dd] bg-white px-3.5 py-2 text-xs font-medium text-[#212121] transition-[transform,background-color] duration-150 ease-out hover:bg-[#eeece7] active:scale-[0.97]"
                >
                  <Download size={13} />
                  SVG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tabbed Controls */}
        <div className="lg:col-span-7">
          <section className="rounded-[32px] border border-[#e5e7eb] bg-white p-6 md:p-8">
            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-full bg-neutral-100 w-fit mb-8">
              {([
                { key: "qr", label: "QR Code" },
                { key: "pass", label: "Pass Card" },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition-colors duration-150",
                    activeTab === tab.key
                      ? "bg-white text-[#212121] shadow-sm"
                      : "text-[#75758a] hover:text-[#212121]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "qr" ? (
              <div className="space-y-8">
                {/* Color */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-[#93939f]">Color</label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {QR_COLORS.map((color) => {
                      const isActive = qrColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setQrColor(color)}
                          aria-label={`QR color ${color}`}
                          aria-pressed={isActive}
                          className={cn(
                            "w-9 h-9 rounded-full transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.94]",
                            isActive
                              ? "ring-2 ring-offset-2 ring-[#346739]"
                              : "ring-1 ring-[#e5e7eb] hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                    <label className="relative w-9 h-9 rounded-full ring-1 ring-[#e5e7eb] cursor-pointer overflow-hidden bg-[conic-gradient(from_180deg,#ff7759,#e8b94a,#346739,#1863dc,#9b60aa,#ff7759)]">
                      <input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        aria-label="Custom QR color"
                      />
                    </label>
                    <span className="text-xs font-mono text-[#616161] ml-1 uppercase">{qrColor}</span>
                  </div>
                </div>

                {/* Dots */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#93939f]">Dots</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {DOT_STYLES.map((style) => {
                      const isActive = dotType === style.type;
                      return (
                        <button
                          key={style.type}
                          type="button"
                          onClick={() => setDotType(style.type)}
                          title={style.label}
                          aria-pressed={isActive}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors duration-150 ease-out active:scale-[0.97]",
                            isActive
                              ? "border-[#346739] bg-[#edfce9]/40"
                              : "border-[#e5e7eb] hover:border-neutral-300 bg-white"
                          )}
                        >
                          <span className="grid grid-cols-2 gap-[3px]">
                            {[0, 1, 2, 3].map((i) => (
                              <span key={i} className={cn("w-2 h-2 bg-[#212121]", style.dot)} />
                            ))}
                          </span>
                          <span className="text-[10px] text-[#616161]">{style.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Markers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#93939f]">Marker border</label>
                    <div className="grid grid-cols-3 gap-2">
                      {MARKER_BORDERS.map((style) => {
                        const isActive = cornerSquareType === style.type;
                        return (
                          <button
                            key={style.type}
                            type="button"
                            onClick={() => setCornerSquareType(style.type)}
                            title={style.label}
                            aria-pressed={isActive}
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors duration-150 ease-out active:scale-[0.97]",
                              isActive
                                ? "border-[#346739] bg-[#edfce9]/40"
                                : "border-[#e5e7eb] hover:border-neutral-300 bg-white"
                            )}
                          >
                            <span className={cn("w-6 h-6 border-[3px] border-[#212121]", style.ring)} />
                            <span className="text-[10px] text-[#616161]">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#93939f]">Marker center</label>
                    <div className="grid grid-cols-3 gap-2">
                      {MARKER_CENTERS.map((style) => {
                        const isActive = cornerDotType === style.type;
                        return (
                          <button
                            key={style.type}
                            type="button"
                            onClick={() => setCornerDotType(style.type)}
                            title={style.label}
                            aria-pressed={isActive}
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors duration-150 ease-out active:scale-[0.97]",
                              isActive
                                ? "border-[#346739] bg-[#edfce9]/40"
                                : "border-[#e5e7eb] hover:border-neutral-300 bg-white"
                            )}
                          >
                            <span className={cn("w-6 h-6 bg-[#212121]", style.core)} />
                            <span className="text-[10px] text-[#616161]">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-[#93939f]">Center Logo</label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 rounded-full border border-[#d9d9dd] bg-white px-5 py-2.5 text-sm font-medium text-[#212121] cursor-pointer transition-[transform,background-color] duration-150 ease-out hover:bg-[#eeece7] active:scale-[0.97]">
                      <GalleryAdd size={16} />
                      {logo ? "Replace image" : "Upload image"}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {logo && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logo} alt="QR center logo" className="w-10 h-10 rounded-lg border border-[#e5e7eb] object-contain bg-white" />
                        <button
                          type="button"
                          onClick={() => setLogo(null)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#b30000] font-medium transition-transform duration-150 ease-out active:scale-[0.97]"
                        >
                          <TrashBinMinimalistic size={14} />
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#93939f]">
                    A monogram or crest works best. The QR stays scannable — error correction is set to high.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Theme */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-[#93939f]">Theme</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(Object.keys(THEMES) as PassTheme[]).map((themeKey) => {
                      const t = THEMES[themeKey];
                      const isActive = selectedTheme === themeKey;
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => setSelectedTheme(themeKey)}
                          aria-pressed={isActive}
                          className={cn(
                            "text-left p-3 rounded-2xl border transition-colors duration-150 ease-out active:scale-[0.98]",
                            isActive
                              ? "border-[#346739] bg-[#edfce9]/20"
                              : "border-[#e5e7eb] hover:border-neutral-300 bg-white"
                          )}
                        >
                          <div className={cn("h-10 w-full rounded-lg border mb-2 relative overflow-hidden", t.cardBg, t.border)}>
                            <span className={cn("absolute top-0 left-0 right-0 h-1", t.accent)} />
                            <span
                              className="absolute bottom-1.5 left-2 right-8 h-1 rounded-full opacity-30"
                              style={{ backgroundColor: t.accentHex }}
                            />
                          </div>
                          <span className={cn("text-xs truncate block", isActive ? "font-semibold text-[#212121]" : "font-medium text-neutral-500")}>
                            {t.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content toggles */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-[#93939f] block">Content</label>
                  {[
                    {
                      checked: showTable,
                      set: setShowTable,
                      title: "Show Table Assignment",
                      desc: "Display guest table assignments dynamically on the pass.",
                    },
                    {
                      checked: showSeat,
                      set: setShowSeat,
                      title: "Show Seat Code",
                      desc: "Include the seat number or row identifier next to table info.",
                    },
                    {
                      checked: includeVenue,
                      set: setIncludeVenue,
                      title: "Include Venue Details",
                      desc: "Show the venue address and time on the digital ticket.",
                    },
                  ].map((item) => (
                    <label
                      key={item.title}
                      className="flex items-center gap-3 p-4 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 cursor-pointer transition-colors duration-150"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.set(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 accent-[#346739]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#212121]">{item.title}</p>
                        <p className="text-xs text-[#93939f]">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 mt-8 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#346739] px-6 py-3 text-sm font-medium text-white transition-[transform,background-color] duration-150 ease-out hover:bg-[#2b5730] active:scale-[0.97]"
              >
                {saved ? "✓ Design Saved" : "Save Design"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
