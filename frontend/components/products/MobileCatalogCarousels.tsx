"use client";

// ─── MobileCatalogCarousels ──────────────────────────────────────────────────
// Mobile/tablet listing layout for /products. Replaces the desktop grid below
// `lg`. Renders one Airbnb-style horizontal carousel per category.
//
// Filter UX matches the original `TemplateCatalog` page mode: search input,
// Filter button → slide-in drawer with category radios + popular toggle + clear,
// and a sort dropdown. Selecting a category collapses to a single rail.

import { useEffect, useMemo, useRef, useState, useCallback, useId } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconX,
} from "@tabler/icons-react";
import { Eye } from "@solar-icons/react";
import { Link } from "@/i18n/routing";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import {
  TEMPLATE_CATEGORY_IDS,
  TEMPLATE_LIST,
  REAL_CATEGORY_IDS,
  type TemplateMeta,
} from "@/lib/template-catalog-data";

// Strong ease-out per Emil's design principles
const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

type SortOrder = "popular" | "nameAsc" | "nameDesc";

export default function MobileCatalogCarousels() {
  const t = useTranslations("Templates");

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [popularOnly, setPopularOnly] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState<boolean>(true);
  const [popularSectionExpanded, setPopularSectionExpanded] = useState<boolean>(true);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (filterOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [filterOpen]);

  // Close drawer on Escape (Emil: keyboard-first)
  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterOpen]);

  const categories = TEMPLATE_CATEGORY_IDS.map((id) => ({
    id,
    label: t(`categories.${id}`),
  }));

  const hasActiveFilters =
    activeCategory !== "all" || popularOnly || searchQuery.trim().length > 0;

  const clearAll = () => {
    setActiveCategory("all");
    setPopularOnly(false);
    setSearchQuery("");
  };

  // ─── Apply search + sort + popularOnly to the whole list ──────────────────
  const filteredList = useMemo(() => {
    const list = TEMPLATE_LIST.filter((tpl) => {
      if (popularOnly && !tpl.popular) return false;
      if (searchQuery.trim()) {
        return tpl.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });

    const sorted = [...list];
    if (sortOrder === "nameAsc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "nameDesc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      sorted.sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));
    }
    return sorted;
  }, [searchQuery, sortOrder, popularOnly]);

  // ─── Group into per-category rails (or single rail if a category is chosen)
  const groups = useMemo(() => {
    const sourceCategories =
      activeCategory === "all"
        ? REAL_CATEGORY_IDS
        : ([activeCategory] as string[]);

    return sourceCategories
      .map((id) => ({
        id,
        label: t(`categories.${id}`),
        items: filteredList.filter((tpl) => tpl.categories.includes(id)),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeCategory, filteredList, t]);

  const totalCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups]
  );

  return (
    <section className="w-full bg-white pb-20 px-6 flex flex-col">
      {/* ── Search + filter + sort bar (same layout as desktop page mode) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <IconSearch
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93939f] pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-11 pl-11 pr-10 rounded-full border border-[#e5e7eb] bg-white text-sm text-[#212121] placeholder:text-[#93939f] font-poppins outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#346739] focus:shadow-[0_0_0_3px_rgba(76,110,230,0.15)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-[#93939f] hover:bg-[#f2f2f2] transition-colors flex items-center justify-center active:scale-[0.95]"
            >
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* Filter button — opens drawer */}
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-[#e5e7eb] bg-white text-sm text-[#212121] font-poppins transition-colors hover:border-[#212121] active:scale-[0.97]"
        >
          <IconAdjustmentsHorizontal size={16} />
          {t("filterTitle")}
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]" aria-hidden="true" />
          )}
        </button>

        {/* Sort dropdown */}
        <SortDropdown
          value={sortOrder}
          onChange={setSortOrder}
          label={t("sortLabel")}
          options={{
            popular: t("sortPopular"),
            nameAsc: t("sortNameAsc"),
            nameDesc: t("sortNameDesc"),
          }}
        />
      </div>

      {/* ── Result count ─────────────────────────────────────────── */}
      <p className="text-sm text-[#616161] font-poppins mb-6">
        {t("resultsCount", { count: totalCount })}
      </p>

      {/* ── Per-category carousels (or empty state) ──────────────── */}
      {groups.length === 0 ? (
        <EmptyState
          title={t("noResultsTitle")}
          description={t("noResultsDesc")}
          clearLabel={t("filterClearAll")}
          onClear={clearAll}
        />
      ) : (
        <div className="-mx-6 flex flex-col gap-10">
          {groups.map((group, i) => (
            <CategoryRail
              key={group.id}
              groupIndex={i}
              label={group.label}
              items={group.items}
              t={t}
            />
          ))}
        </div>
      )}

      {/* ── Filter drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT_STRONG }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 z-[100] bg-[#212121]/30 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              key="filter-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t("filterTitle")}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: EASE_OUT_STRONG }}
              className="fixed inset-y-0 left-0 z-[101] w-[88%] max-w-[360px] bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f2f2f2]">
                <h3 className="font-poppins text-base font-medium text-[#212121]">
                  {t("filterTitle")}
                </h3>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  aria-label="Close filters"
                  className="w-9 h-9 rounded-full hover:bg-[#f2f2f2] flex items-center justify-center text-[#212121] active:scale-[0.95] transition-[background-color,transform] duration-150 ease-out"
                >
                  <IconX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <FilterPanel
                  t={t}
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  popularOnly={popularOnly}
                  setPopularOnly={setPopularOnly}
                  hasActiveFilters={hasActiveFilters}
                  onClearAll={clearAll}
                  hideHeader
                  categoriesExpanded={categoriesExpanded}
                  setCategoriesExpanded={setCategoriesExpanded}
                  popularSectionExpanded={popularSectionExpanded}
                  setPopularSectionExpanded={setPopularSectionExpanded}
                />
              </div>

              {/* Drawer footer with apply button */}
              <div className="px-6 py-4 border-t border-[#f2f2f2] flex gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="flex-1 h-11 rounded-full border border-[#e5e7eb] text-sm text-[#212121] font-poppins hover:border-[#212121] active:scale-[0.97] transition-[border-color,transform] duration-150 ease-out"
                  >
                    {t("filterClearAll")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="flex-1 h-11 rounded-full bg-[#212121] text-white text-sm font-poppins active:scale-[0.97] hover:bg-[#0f0f0f] transition-[background-color,transform] duration-150 ease-out"
                >
                  {t("filterApply")}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── CategoryRail ────────────────────────────────────────────────────────────
function CategoryRail({
  groupIndex,
  label,
  items,
  t,
}: {
  groupIndex: number;
  label: string;
  items: TemplateMeta[];
  t: ReturnType<typeof useTranslations>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, items.length]);

  const scrollByCard = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-rail-card]");
    const cardWidth = card?.offsetWidth ?? 240;
    const gap = 12;
    el.scrollBy({
      left: (cardWidth + gap) * (direction === "left" ? -1.5 : 1.5),
      behavior: "smooth",
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: groupIndex * 0.04, ease: EASE_OUT_STRONG }}
      className="w-full"
    >
      <header className="px-6 mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-poppins text-lg font-medium text-[#212121] tracking-tight">
            {label}
          </h3>
          <span className="text-xs text-[#93939f] font-poppins">
            {t("resultsCount", { count: items.length })}
          </span>
        </div>
      </header>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          aria-label="Scroll left"
          disabled={!canScrollLeft}
          className="absolute left-2 top-[42%] -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#d9d9dd] shadow-card-lift text-[#212121] active:scale-[0.95] transition-[opacity,transform] duration-200 ease-out disabled:opacity-0 disabled:pointer-events-none"
        >
          <IconChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("right")}
          aria-label="Scroll right"
          disabled={!canScrollRight}
          className="absolute right-2 top-[42%] -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#d9d9dd] shadow-card-lift text-[#212121] active:scale-[0.95] transition-[opacity,transform] duration-200 ease-out disabled:opacity-0 disabled:pointer-events-none"
        >
          <IconChevronRight size={16} />
        </button>

        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 transition-opacity duration-200"
          style={{ opacity: canScrollLeft ? 1 : 0 }}
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 transition-opacity duration-200"
          style={{ opacity: canScrollRight ? 1 : 0 }}
        />

        <div
          ref={trackRef}
          className="overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="inline-flex gap-3 px-6 py-1">
            {items.map((tpl) => (
              <RailCard key={tpl.id} template={tpl} t={t} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ─── RailCard ────────────────────────────────────────────────────────────────
function RailCard({
  template,
  t,
}: {
  template: TemplateMeta;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div data-rail-card className="snap-start shrink-0 w-[240px]">
      <Link
        href={`/products/${template.id}`}
        className="group block text-left"
      >
        <div className="relative w-full aspect-[4/5] bg-[#fdfdfd] rounded-[18px] overflow-hidden border border-[#f2f2f2] shadow-card-lift transition-[box-shadow,border-color] duration-300 ease-out group-hover:shadow-card-lift-hover group-hover:border-[#d9d9dd]">
          {template.popular && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span className="inline-flex items-center bg-[#edfce9] border border-[#346739]/20 text-[#346739] text-[9px] px-2 py-0.5 rounded-full font-poppins font-semibold select-none">
                {t("popularLabel")}
              </span>
            </div>
          )}

          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-300 ease-out">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/85 backdrop-blur-md border border-[#d9d9dd] text-[#212121]">
              <Eye size={13} weight="Linear" />
            </div>
          </div>

          <TemplatePreviewCard
            templateId={template.id}
            className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          />
        </div>

        <div className="mt-2.5 flex justify-between items-baseline gap-2">
          <h4 className="font-poppins text-[14px] font-medium text-[#212121] truncate">
            {template.name}
          </h4>
          <span className="shrink-0 font-poppins text-[12px] font-medium text-[#212121]">
            {t("priceTag")}
          </span>
        </div>

        <p className="mt-0.5 font-poppins text-[12px] text-[#616161] leading-snug">
          {t(`categories.${template.categories[0]}`)}
        </p>
      </Link>
    </div>
  );
}

// ─── FilterPanel (mirrors TemplateCatalog page mode) ─────────────────────────
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

function FilterPanel({
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
                      isActive
                        ? "text-[#212121] font-medium"
                        : "text-[#616161] group-hover:text-[#212121]"
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

      <FilterSection
        title={t("popularLabel")}
        expanded={popularSectionExpanded}
        onToggle={() => setPopularSectionExpanded(!popularSectionExpanded)}
      >
        <label className="flex items-center gap-3 py-2 cursor-pointer">
          <Checkbox
            checked={popularOnly}
            onChange={() => setPopularOnly(!popularOnly)}
          />
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
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const headerId = useId();
  const panelId = useId();

  return (
    <div className="border-b border-[#f2f2f2] py-4 last:border-b-0">
      <button
        type="button"
        id={headerId}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-sm font-poppins font-medium text-[#212121]">{title}</span>
        <IconChevronUp
          size={16}
          className="text-[#93939f] transition-transform duration-200 ease-out"
          style={{ transform: expanded ? "rotate(0deg)" : "rotate(180deg)" }}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_STRONG }}
            style={{ overflow: "hidden" }}
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Radio({
  name,
  checked,
  onChange,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <span className="relative inline-flex items-center justify-center w-4 h-4 shrink-0">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <span
        aria-hidden="true"
        className="w-4 h-4 rounded-full border transition-colors duration-150 ease-out"
        style={{
          borderColor: checked ? "#346739" : "#d9d9dd",
          background: checked ? "#346739" : "white",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute w-1.5 h-1.5 rounded-full bg-white transition-[opacity,transform] duration-150 ease-out"
        style={{
          opacity: checked ? 1 : 0,
          transform: checked ? "scale(1)" : "scale(0.5)",
        }}
      />
    </span>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <span className="relative inline-flex items-center justify-center w-4 h-4 shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <span
        aria-hidden="true"
        className="w-4 h-4 rounded border transition-colors duration-150 ease-out"
        style={{
          borderColor: checked ? "#346739" : "#d9d9dd",
          background: checked ? "#346739" : "white",
        }}
      />
      {checked && (
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className="absolute"
        >
          <path
            d="M2 5l2 2 4-4"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function SortDropdown({
  value,
  onChange,
  label,
  options,
}: {
  value: SortOrder;
  onChange: (v: SortOrder) => void;
  label: string;
  options: Record<SortOrder, string>;
}) {
  return (
    <label className="relative inline-flex items-center h-11 rounded-full border border-[#e5e7eb] bg-white pl-4 pr-10 cursor-pointer text-sm font-poppins text-[#212121] focus-within:border-[#346739] transition-colors duration-200 self-start sm:self-auto">
      <span className="text-[#93939f] mr-2 hidden sm:inline">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOrder)}
        aria-label={label}
        className="appearance-none bg-transparent outline-none cursor-pointer pr-1"
      >
        <option value="popular">{options.popular}</option>
        <option value="nameAsc">{options.nameAsc}</option>
        <option value="nameDesc">{options.nameDesc}</option>
      </select>
      <IconChevronUp
        size={14}
        aria-hidden="true"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#93939f] pointer-events-none rotate-180"
      />
    </label>
  );
}

function EmptyState({
  title,
  description,
  clearLabel,
  onClear,
}: {
  title: string;
  description: string;
  clearLabel: string;
  onClear: () => void;
}) {
  return (
    <div className="border border-dashed border-[#e5e7eb] rounded-[24px] py-12 px-6 text-center flex flex-col items-center">
      <span className="w-12 h-12 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#93939f] mb-4">
        <IconSearch size={20} />
      </span>
      <h4 className="font-poppins text-base font-medium text-[#212121] mb-1">{title}</h4>
      <p className="text-sm text-[#616161] max-w-sm font-poppins font-light mb-5">{description}</p>
      <button
        type="button"
        onClick={onClear}
        className="text-sm text-[#346739] hover:underline font-poppins font-medium"
      >
        {clearLabel}
      </button>
    </div>
  );
}
