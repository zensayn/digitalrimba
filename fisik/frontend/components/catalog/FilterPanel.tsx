"use client";

import { useTranslations } from "next-intl";
import { Radio, Checkbox } from "./Controls";
import FilterSection from "./FilterSection";
import { TextureButton } from "@/components/ui/texture-button";

interface FilterPanelProps {
  t: ReturnType<typeof useTranslations>;
  categories: { id: string; label: string }[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
  popularOnly: boolean;
  setPopularOnly: (v: boolean) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  hideHeader?: boolean;
  categoriesExpanded: boolean;
  setCategoriesExpanded: (v: boolean) => void;
  popularSectionExpanded: boolean;
  setPopularSectionExpanded: (v: boolean) => void;
}

export default function FilterPanel({
  t,
  categories,
  activeCategory,
  setActiveCategory,
  popularOnly,
  setPopularOnly,
  hasActiveFilters,
  onClearAll,
  hideHeader = false,
  categoriesExpanded,
  setCategoriesExpanded,
  popularSectionExpanded,
  setPopularSectionExpanded,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {!hideHeader && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-poppins text-2xl font-medium text-[#212121]">
              {t("filterTitle")}
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-[#1863dc] hover:underline font-poppins"
              >
                {t("filterClearAll")}
              </button>
            )}
          </div>
        )}

        {/* ── Categories accordion ─────────────────────────────── */}
        <FilterSection
          title={t("selectCategory")}
          expanded={categoriesExpanded}
          onToggle={() => setCategoriesExpanded(!categoriesExpanded)}
        >
          <ul className="flex flex-col">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <li key={cat.id}>
                  <label className="flex items-center gap-3 py-2 cursor-pointer group">
                    <Radio
                      name="template-category"
                      checked={isActive}
                      onChange={() => setActiveCategory(cat.id)}
                    />
                    <span
                      className={`text-sm font-poppins transition-colors ${
                        isActive ? "text-[#212121] font-medium" : "text-[#616161] group-hover:text-[#212121]"
                      }`}
                    >
                      {cat.label}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </FilterSection>

        {/* ── Popular accordion ──────────────────────────────────── */}
        <FilterSection
          title={t("popularLabel")}
          expanded={popularSectionExpanded}
          onToggle={() => setPopularSectionExpanded(!popularSectionExpanded)}
        >
          <label className="flex items-center gap-3 py-2 cursor-pointer">
            <Checkbox checked={popularOnly} onChange={() => setPopularOnly(!popularOnly)} />
            <span
              className={`text-sm font-poppins transition-colors ${
                popularOnly ? "text-[#212121] font-medium" : "text-[#616161]"
              }`}
            >
              {t("popularOnly")}
            </span>
          </label>
        </FilterSection>
      </div>

      {/* ── PDF Catalog Outlined Card ── */}
      <div className="mt-2 p-3.5 rounded-2xl border border-dashed border-[#d9d9dd] bg-neutral-50/50 hover:bg-[#edfce9]/10 transition-all duration-300 flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="m9 15 3 3 3-3" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-medium text-[#346739] uppercase mb-0.5">
              Booklet
            </span>
            <h4 className="text-[12px] font-semibold text-neutral-800">
              Katalog Produk PDF
            </h4>
            <p className="text-[10px] text-[#616161] leading-relaxed mt-1">
              Unduh brosur produk cetak & digital Rimba selengkapnya.
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full mt-1">
          <TextureButton
            variant="outline"
            size="sm"
            className="flex-1 rounded-full text-[10px] font-bold"
            onClick={() => window.open("https://drive.google.com/file/d/1810T7RIKDhbgqDU8pDECk48XUEOKo5V2/view", "_blank", "noopener,noreferrer")}
          >
            Lihat PDF
          </TextureButton>
          <TextureButton
            variant="primary"
            size="sm"
            className="flex-1 rounded-full text-[10px] font-bold"
            onClick={() => window.open("https://drive.google.com/uc?export=download&id=1810T7RIKDhbgqDU8pDECk48XUEOKo5V2", "_blank", "noopener,noreferrer")}
          >
            Unduh PDF
          </TextureButton>
        </div>
      </div>
    </div>
  );
}
