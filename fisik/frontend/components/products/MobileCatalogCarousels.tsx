"use client";

// ─── MobileCatalogCarousels ──────────────────────────────────────────────────
// Mobile/tablet listing layout for /products. Replaces the desktop grid below
// `lg`. Renders one Airbnb-style horizontal carousel per category.
//
// Filter UX matches the original `TemplateCatalog` page mode: search input,
// Filter button → slide-in drawer with category radios + popular toggle + clear,
// and a sort dropdown. Selecting a category collapses to a single rail.

import { useEffect, useMemo, useRef, useState, useId } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  IconChevronLeft,
  IconChevronUp,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconX,
} from "@tabler/icons-react";

import { Link } from "@/i18n/routing";
import { TextureButton } from "@/components/ui/texture-button";
import { Input } from "@/components/ui/input";
import SortDropdown from "@/components/catalog/SortDropdown";
import type { SortOrder } from "@/components/catalog/types";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import CardPriceTag from "@/components/products/CardPriceTag";
import type {
  CatalogProduct,
  CatalogCollection,
  CardPrice,
} from "@/lib/catalog";

// Strong ease-out per Emil's design principles
const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

interface MobileCatalogCarouselsProps {
  products: CatalogProduct[];
  collections: CatalogCollection[];
  /** slug → entry price + availability. Absent ⇒ cards render without a price. */
  priceBySlug?: Record<string, CardPrice>;
}

export default function MobileCatalogCarousels({
  products,
  collections,
  priceBySlug,
}: MobileCatalogCarouselsProps) {
  const t = useTranslations("Templates");

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [popularOnly, setPopularOnly] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState<boolean>(true);
  const [popularSectionExpanded, setPopularSectionExpanded] = useState<boolean>(true);

  // Push state to browser history when mobile filter opens so that the back button closes it
  useEffect(() => {
    if (filterOpen) {
      window.history.pushState({ filterOpen: true }, "");

      const handlePopState = () => {
        setFilterOpen(false);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [filterOpen]);

  const closeFilterManually = () => {
    if (filterOpen) {
      if (window.history.state?.filterOpen) {
        window.history.back();
      }
      setFilterOpen(false);
    }
  };

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
      if (e.key === "Escape") closeFilterManually();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterOpen]);

  const categories = [
    { id: "all", label: t("categories.all") },
    ...collections.map((c) => ({ id: c.code, label: c.name })),
  ];

  const hasActiveFilters =
    activeCategory !== "all" || popularOnly || searchQuery.trim().length > 0;

  const clearAll = () => {
    setActiveCategory("all");
    setPopularOnly(false);
    setSearchQuery("");
  };

  // ─── Apply search + popularOnly to the whole list (popular-first order) ───
  const filteredList = useMemo(() => {
    const list = products.filter((p) => {
      if (popularOnly && !p.popular) return false;
      if (searchQuery.trim()) {
        return p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });

    const sorted = [...list];
    if (sortOrder === "nameAsc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "nameDesc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      const rank = (p: (typeof list)[number]) => (p.top_seller ? 2 : p.popular ? 1 : 0);
      sorted.sort((a, b) => rank(b) - rank(a));
    }
    return sorted;
  }, [products, searchQuery, popularOnly, sortOrder]);

  // ─── Group into per-collection rails (or single rail if a collection is chosen)
  const groups = useMemo(() => {
    const sourceCollections =
      activeCategory === "all"
        ? collections
        : collections.filter((c) => c.code === activeCategory);

    return sourceCollections
      .map((c) => ({
        id: c.code,
        label: c.name,
        items: filteredList.filter((p) => p.collection_code === c.code),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeCategory, filteredList, collections]);

  const totalCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups]
  );

  return (
    <section className="w-full bg-white pb-20 px-6 flex flex-col">
      {/* ── Search + filter + sort bar ── */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Search */}
        <div className="relative w-full">
          <IconSearch
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93939f] pointer-events-none"
          />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 pl-11 pr-10 rounded-full text-sm"
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

        {/* Filter + sort row */}
        <div className="flex items-center gap-3">
          {/* Filter button — opens drawer */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 h-11 px-5 rounded-full border border-[#e5e7eb] bg-white text-sm text-[#212121] font-poppins transition-colors hover:border-[#212121] active:scale-[0.97]"
          >
            <IconAdjustmentsHorizontal size={16} />
            {t("filterTitle")}
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#346739]" aria-hidden="true" />
            )}
          </button>

          {/* Sort dropdown (Radix dropdown-menu) */}
          <SortDropdown
            value={sortOrder}
            onChange={setSortOrder}
            label={t("sortLabel")}
            options={{
              popular: t("sortPopular"),
              nameAsc: t("sortNameAsc"),
              nameDesc: t("sortNameDesc"),
            }}
            className="flex-1 justify-center"
          />
        </div>
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
              priceBySlug={priceBySlug}
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
              onClick={closeFilterManually}
              className="fixed inset-0 z-[10000] bg-[#212121]/30 backdrop-blur-sm"
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
              transition={{ duration: 0.35, ease: EASE_OUT_STRONG }}
              className="fixed inset-0 z-[10001] w-full h-full bg-white flex flex-col"
            >
              {/* Drawer header — breadcrumb back route at top-left */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#f2f2f2] shrink-0">
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-poppins">
                  <button
                    type="button"
                    onClick={closeFilterManually}
                    className="group inline-flex items-center gap-1 text-[#616161] hover:text-[#212121] active:scale-[0.98] transition-[color,transform] duration-150 ease-out"
                  >
                    <IconChevronLeft
                      size={16}
                      className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
                    />
                    {t("filterBack")}
                  </button>
                  <span className="text-[#d9d9dd]" aria-hidden="true">/</span>
                  <span className="text-[#212121] font-medium" aria-current="page">
                    {t("filterTitle")}
                  </span>
                </nav>
                <button
                  type="button"
                  onClick={closeFilterManually}
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
                  onClick={closeFilterManually}
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
  priceBySlug,
}: {
  groupIndex: number;
  label: string;
  items: CatalogProduct[];
  t: ReturnType<typeof useTranslations>;
  priceBySlug?: Record<string, CardPrice>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

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
        <div
          ref={trackRef}
          className="overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none scroll-pl-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="inline-flex gap-3 px-6 py-1">
            {items.map((product) => (
              <RailCard
                key={product.slug}
                product={product}
                t={t}
                price={priceBySlug?.[product.slug]}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ─── RailCard ────────────────────────────────────────────────────────────────
function RailCard({
  product,
  t,
  price,
}: {
  product: CatalogProduct;
  t: ReturnType<typeof useTranslations>;
  price?: CardPrice;
}) {
  const muted = !!price && !price.available;
  return (
    <div data-rail-card className="snap-start shrink-0 w-[240px]">
      <Link
        href={`/products/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block text-left"
      >
        <div className="relative w-full aspect-[4/5] bg-[#fdfdfd] rounded-[18px] overflow-hidden border border-[#f2f2f2] shadow-card-lift transition-[box-shadow,border-color] duration-300 ease-out group-hover:shadow-card-lift-hover group-hover:border-[#d9d9dd]">
          {(product.top_seller || product.popular) && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span
                className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded-full font-poppins font-semibold select-none ${
                  product.top_seller
                    ? "bg-[#346739] text-white"
                    : "bg-[#edfce9] border border-[#346739]/20 text-[#346739]"
                }`}
              >
                {product.top_seller ? t("topSellerLabel") : t("popularLabel")}
              </span>
            </div>
          )}



          <TemplatePreviewCard
            src={product.cover_url}
            alt={product.name}
            sizes="240px"
            className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.025] ${
              muted ? "grayscale opacity-60" : ""
            }`}
          />
        </div>

        <div className="mt-2.5 flex justify-between items-baseline gap-2">
          <h4 className="font-poppins text-[14px] font-medium text-[#212121] truncate">
            {product.name}
          </h4>
          <CardPriceTag
            price={price}
            className="shrink-0 font-poppins text-[12px] font-medium"
          />
        </div>

        <p className="mt-0.5 font-poppins text-[12px] text-[#616161] leading-snug">
          {product.collection_name}
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

        {/* ── Popular accordion ──────────────────────────────────── */}
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
            <span className="text-[9px] font-bold text-[#346739] tracking-wider uppercase font-mono mb-0.5">
              Booklet
            </span>
            <h4 className="text-xs font-semibold text-neutral-800 leading-tight">
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
