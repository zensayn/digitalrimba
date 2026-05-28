"use client";

// ─── TemplateCatalog ──────────────────────────────────────────────────────────
// Two-mode catalog component.
//
// mode="home" — section on the homepage. Shows up to 3 cards under a chip filter
//               bar and a "Lihat semua →" button to /products. No search/sort/sidebar.
//
// mode="page" — full /products listing surface. Klarna-style layout:
//               search bar, sticky filter sidebar (categories + popular toggle),
//               result count + sort dropdown, responsive grid, mobile drawer.

import { useState, useMemo, useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  IconChevronRight,
  IconChevronLeft,
  IconChevronUp,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconX,
} from "@tabler/icons-react";
import { Eye } from "@solar-icons/react";
import { Link, useRouter } from "@/i18n/routing";
import { TextureButton } from "@/components/ui/texture-button";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";

// Strong ease-out per Emil's design principles
const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

// ─── Constants (single source of truth — referenced by /products page too) ───
export const TEMPLATE_CATEGORY_IDS = [
  "all",
  "hindu",
  "christian",
  "sikh",
  "muslim",
  "southIndian",
  "saveDate",
] as const;

interface TemplateMeta {
  id: string;
  name: string;
  categories: readonly string[];
  popular?: boolean;
}

export const TEMPLATE_LIST: readonly TemplateMeta[] = [
  { id: "city3", name: "City 3", categories: ["hindu"], popular: true },
  { id: "city", name: "City", categories: ["hindu"] },
  { id: "beach", name: "Beach", categories: ["hindu", "saveDate"], popular: true },
  { id: "grace", name: "Grace", categories: ["christian", "saveDate"], popular: true },
  { id: "serenity", name: "Serenity", categories: ["christian"] },
  { id: "royalSikh", name: "Royal Sikh", categories: ["sikh"] },
  { id: "noor", name: "Noor", categories: ["muslim"] },
  { id: "royalDeccan", name: "Royal Deccan", categories: ["southIndian"] },
  { id: "minimalist", name: "Minimalist", categories: ["saveDate", "all"], popular: true },
] as const;

export type TemplateCatalogMode = "home" | "page";
type SortOrder = "popular" | "nameAsc" | "nameDesc";

interface TemplateCatalogProps {
  mode?: TemplateCatalogMode;
  showHeading?: boolean;
}

const HOME_LIMIT = 3;

export default function TemplateCatalog({
  mode = "home",
  showHeading = true,
}: TemplateCatalogProps) {
  const t = useTranslations("Templates");
  const router = useRouter();

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -309, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 309, behavior: "smooth" });
    }
  };

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [popularOnly, setPopularOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState<boolean>(true);
  const [popularSectionExpanded, setPopularSectionExpanded] = useState<boolean>(true);

  // Lock body scroll while the mobile filter drawer is open
  useEffect(() => {
    if (mode !== "page") return;
    if (mobileFilterOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileFilterOpen, mode]);

  // Close drawer on Escape (Emil: keyboard-first, no animation latency)
  useEffect(() => {
    if (!mobileFilterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFilterOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileFilterOpen]);

  const categories = TEMPLATE_CATEGORY_IDS.map((id) => ({
    id,
    label: t(`categories.${id}`),
  }));

  // ─── Filter + sort pipeline ───────────────────────────────────────────────
  const filteredTemplates = useMemo(() => {
    let list = TEMPLATE_LIST.filter((tpl) => {
      if (activeCategory !== "all" && !tpl.categories.includes(activeCategory)) return false;
      if (popularOnly && !tpl.popular) return false;
      if (searchQuery.trim()) {
        return tpl.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });

    // Apply sort. Spread to avoid mutating the source array.
    const sorted = [...list];
    if (sortOrder === "nameAsc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "nameDesc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // popular first, original order otherwise
      sorted.sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));
    }
    return sorted;
  }, [activeCategory, searchQuery, popularOnly, sortOrder]);

  const visibleTemplates =
    mode === "home" ? filteredTemplates.slice(0, HOME_LIMIT) : filteredTemplates;

  const hasActiveFilters =
    activeCategory !== "all" || popularOnly || searchQuery.trim().length > 0;

  const clearAll = () => {
    setActiveCategory("all");
    setPopularOnly(false);
    setSearchQuery("");
  };

  // ─── Shared bits ──────────────────────────────────────────────────────────
  const renderCard = (template: TemplateMeta, index: number) => (
    <motion.div
      layout
      key={template.id}
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 20 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.24), ease: EASE_OUT_STRONG }}
      className="w-[285px] sm:w-auto shrink-0 snap-align-start snap-always"
    >
      <Link href={`/products/${template.id}`} className="group block text-left">
        {/* Image-only card — only the preview gets the border + shadow + radius */}
        <div className="relative w-full aspect-[4/5] bg-[#fdfdfd] rounded-[18px] overflow-hidden border border-[#f2f2f2] shadow-card-lift transition-[box-shadow,border-color] duration-300 ease-out group-hover:shadow-card-lift-hover group-hover:border-[#d9d9dd]">
          {/* Popular badge (top-left, overlay only — category lives below the title) */}
          {template.popular && (
            <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
              <span className="inline-flex items-center bg-[#edfce9] border border-[#346739]/20 text-[#346739] text-[10px] px-2.5 py-1 rounded-full font-poppins font-semibold select-none">
                {t("popularLabel")}
              </span>
            </div>
          )}

          {/* Eye affordance (top-right) — fades in on hover */}
          <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-300 ease-out">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/85 backdrop-blur-md border border-[#d9d9dd] text-[#212121]">
              <Eye size={15} weight="Linear" />
            </div>
          </div>

          <TemplatePreviewCard
            templateId={template.id}
            className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          />
        </div>

        {/* Metadata — sits OUTSIDE the card, plain text on the page background */}
        <div className="mt-3 flex justify-between items-baseline gap-3">
          <h3 className="font-poppins text-[15px] sm:text-[16px] font-medium text-[#212121] truncate">
            {template.name}
          </h3>
          <span className="shrink-0 font-poppins text-[13px] font-medium text-[#212121]">
            {t("priceTag")}
          </span>
        </div>

        <p className="mt-1 font-poppins text-[12.5px] text-[#616161] leading-snug">
          {t(`categories.${template.categories[0]}`)}
        </p>

        <p className="mt-1 font-poppins text-[12.5px] text-[#93939f] leading-snug line-clamp-2">
          {t("editDescription", {
            category: t(`categories.${template.categories[0]}`),
          })}
        </p>
      </Link>
    </motion.div>
  );

  // ─── HOME MODE: keep the original simple section unchanged ───────────────
  if (mode === "home") {
    return (
      <section className="w-full bg-white py-24 md:py-28 px-6 md:px-10 flex flex-col items-center">
        <div className="w-full max-w-[1200px] flex flex-col items-center">
          {showHeading && (
            <header className="text-center max-w-3xl mx-auto flex flex-col items-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: EASE_OUT_STRONG }}
                className="text-3xl sm:text-4xl md:text-5xl font-poppins font-normal tracking-[-0.03em] leading-[1.15] text-[#212121] mb-4"
              >
                {t("title").split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT_STRONG }}
                className="text-[#616161] font-poppins text-sm sm:text-base md:text-lg max-w-2xl font-light"
              >
                {t("subtitle")}
              </motion.p>
            </header>
          )}

          <div className="w-full flex flex-col items-center mb-12 md:mb-14">
            <span className="text-xs uppercase text-[#616161] mb-4 font-poppins">
              {t("selectCategory")}
            </span>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl">
              {categories.map((cat, i) => {
                const isActive = activeCategory === cat.id;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: EASE_OUT_STRONG }}
                  >
                    <TextureButton
                      variant={isActive ? "primary" : "secondary"}
                      size="sm"
                      className="rounded-full px-3.5 py-1.5 sm:px-3 sm:py-1 transition-all duration-200"
                      onClick={() => setActiveCategory(cat.id)}
                      aria-pressed={isActive}
                    >
                      <span className="font-poppins text-[13px] sm:text-xs font-medium">{cat.label}</span>
                    </TextureButton>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="relative w-full">
            {/* Chevron controls - visible on mobile only */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-[40%] -translate-y-1/2 z-20 flex sm:hidden items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-[#d9d9dd] shadow-md text-[#212121] active:scale-95 transition-all"
              aria-label="Scroll templates left"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-[40%] -translate-y-1/2 z-20 flex sm:hidden items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-[#d9d9dd] shadow-md text-[#212121] active:scale-95 transition-all"
              aria-label="Scroll templates right"
            >
              <IconChevronRight size={16} />
            </button>

            <div
              ref={carouselRef}
              className="w-full overflow-x-auto sm:overflow-x-visible scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0 w-[calc(100%+48px)] sm:w-full scroll-smooth"
            >
              <motion.div layout="position" className="flex sm:grid flex-nowrap sm:flex-wrap sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 snap-x snap-mandatory scrollbar-none pb-4 sm:pb-0">
                <AnimatePresence mode="popLayout">
                  {visibleTemplates.map((tpl, i) => renderCard(tpl, i))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {filteredTemplates.length > HOME_LIMIT && (
            <motion.div layout="position" className="mt-20 sm:mt-24 text-center">
              <TextureButton
                variant="secondary"
                size="default"
                className="rounded-full flex items-center gap-2 group/btn"
                onClick={() => router.push("/products")}
              >
                <span className="uppercase text-xs font-poppins font-medium">
                  {t("loadMore")}
                </span>
                <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </TextureButton>
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // ─── PAGE MODE: filter sidebar + search + sort + grid ─────────────────────
  return (
    <section className="w-full bg-white pb-24 md:pb-28 px-6 md:px-10 flex flex-col items-center">
      <div className="w-full max-w-[1200px] flex flex-col">
        {/* ── Search + sort bar (above grid) ──────────────────────── */}
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

          {/* Mobile filter trigger */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-[#e5e7eb] bg-white text-sm text-[#212121] font-poppins transition-colors hover:border-[#212121] active:scale-[0.97]"
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

        {/* ── Layout: sidebar + grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12 items-start">
          {/* ── FILTER SIDEBAR (desktop) ────────────────────────── */}
          <aside className="hidden lg:block lg:sticky lg:top-24 self-start">
            <FilterPanel
              t={t}
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              popularOnly={popularOnly}
              setPopularOnly={setPopularOnly}
              hasActiveFilters={hasActiveFilters}
              onClearAll={clearAll}
              categoriesExpanded={categoriesExpanded}
              setCategoriesExpanded={setCategoriesExpanded}
              popularSectionExpanded={popularSectionExpanded}
              setPopularSectionExpanded={setPopularSectionExpanded}
            />
          </aside>

          {/* ── MAIN COLUMN ─────────────────────────────────────── */}
          <div className="min-w-0">
            {/* Result count */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-[#616161] font-poppins">
                {t("resultsCount", { count: filteredTemplates.length })}
              </p>
            </div>

            {/* Grid or empty state */}
            {filteredTemplates.length === 0 ? (
              <EmptyState
                title={t("noResultsTitle")}
                description={t("noResultsDesc")}
                clearLabel={t("filterClearAll")}
                onClear={clearAll}
              />
            ) : (
              <motion.div
                layout="position"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {visibleTemplates.map((tpl, i) => renderCard(tpl, i))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT_STRONG }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 z-[100] bg-[#212121]/30 backdrop-blur-sm lg:hidden"
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
              className="fixed inset-y-0 left-0 z-[101] w-[88%] max-w-[360px] bg-white shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f2f2f2]">
                <h3 className="font-poppins text-base font-medium text-[#212121]">
                  {t("filterTitle")}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
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
                  onClick={() => setMobileFilterOpen(false)}
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

// ─── Internal: filter sidebar panel ──────────────────────────────────────────
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
  );
}

// ─── Internal: collapsible section ───────────────────────────────────────────
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

// ─── Internal: themed radio + checkbox (no hidden inputs swallowing keyboard) ─
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

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
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

// ─── Internal: native-styled sort dropdown ───────────────────────────────────
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
    <label className="relative inline-flex items-center h-11 rounded-full border border-[#e5e7eb] bg-white pl-4 pr-10 cursor-pointer text-sm font-poppins text-[#212121] focus-within:border-[#346739] transition-colors duration-200">
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

// ─── Internal: empty state ───────────────────────────────────────────────────
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
    <div className="border border-dashed border-[#e5e7eb] rounded-[24px] py-16 px-6 text-center flex flex-col items-center">
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
