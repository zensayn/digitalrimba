"use client";

// ─── LocaleSwitcher ──────────────────────────────────────────────────────────
// Two surface variants:
//   - <LocaleSwitcher />          flag-only dropdown trigger (used in headers)
//   - <LocaleSwitcherList />      labelled rows (used inside the curved menu drawer)
//
// Both share the same locale-change handler. Flags are rendered via
// `react-country-flag` (SVG mode) for accurate, accessible national flags.

import { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Locale = "id" | "en";

interface LocaleConfig {
  code: Locale;
  label: string;
  // ISO 3166-1 alpha-2 country code consumed by react-country-flag
  countryCode: string;
}

const LOCALES: LocaleConfig[] = [
  { code: "id", label: "Indonesia", countryCode: "ID" },
  { code: "en", label: "English", countryCode: "GB" },
];

// ─── Shared flag renderer ────────────────────────────────────────────────────
// SVG mode keeps flags crisp at any DPR and avoids loading external sprites.
function Flag({ countryCode, label }: { countryCode: string; label: string }) {
  return (
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      title={label}
      aria-label={label}
      style={{
        width: "20px",
        height: "14px",
        borderRadius: "2px",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04)",
        objectFit: "cover",
      }}
    />
  );
}

// ─── Hook: shared locale-change handler ───────────────────────────────────────
function useLocaleChanger() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as Locale;

  const change = (next: Locale) => {
    if (next === currentLocale) return;
    // `scroll: false` keeps the user at their current scroll position instead of
    // jumping back to the top of the page on the locale-swap navigation.
    router.replace(pathname, { locale: next, scroll: false });
  };

  return { currentLocale, change };
}

// ─── Header variant: flag-only pill that opens a dropdown ────────────────────
export default function LocaleSwitcher() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { currentLocale, change } = useLocaleChanger();
  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={`Change language (current: ${current.label})`}
        className="w-9 h-9 rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center hover:border-[#212121] active:scale-[0.95] transition-[border-color,transform] duration-150 ease-out cursor-pointer outline-none"
      >
        <Flag countryCode={current.countryCode} label={current.label} />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Change language (current: ${current.label})`}
          className="w-9 h-9 rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center hover:border-[#212121] active:scale-[0.95] transition-[border-color,transform] duration-150 ease-out cursor-pointer outline-none"
        >
          <Flag countryCode={current.countryCode} label={current.label} />
        </button>
      </DropdownMenuTrigger>
      {/* z-[10000] keeps the flag dropdown above the sticky header (z-[9999]) */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[10000] min-w-[160px]"
      >
        {LOCALES.map(({ code, label, countryCode }) => {
          const isActive = code === currentLocale;
          return (
            <DropdownMenuItem
              key={code}
              onSelect={() => change(code)}
              className={`gap-2.5 ${isActive ? "bg-[#edfce9]/60" : ""}`}
            >
              <Flag countryCode={countryCode} label={label} />
              <span className="font-poppins text-[13px] text-[#212121] font-medium">
                {label}
              </span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[#346739]"
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Drawer variant: full-width row list (matches the curved menu's dark UI) ─
export function LocaleSwitcherList({
  onSelect,
}: {
  onSelect?: () => void;
}) {
  const { currentLocale, change } = useLocaleChanger();

  return (
    <div className="flex flex-col gap-1">
      {LOCALES.map(({ code, label, countryCode }) => {
        const isActive = code === currentLocale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => {
              change(code);
              onSelect?.();
            }}
            aria-pressed={isActive}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-left transition-colors duration-200 ease-out outline-none ${
              isActive
                ? "bg-zinc-800 text-white"
                : "bg-transparent text-zinc-300 hover:bg-zinc-800/60"
            }`}
          >
            <Flag countryCode={countryCode} label={label} />
            <span className="font-poppins text-sm font-medium">{label}</span>
            {isActive && (
              <span
                aria-hidden="true"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-[#346739]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
