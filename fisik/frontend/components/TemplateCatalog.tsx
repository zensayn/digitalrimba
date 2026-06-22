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

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  IconChevronRight,
  IconChevronLeft,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconX,
} from "@tabler/icons-react";

import { Link, useRouter } from "@/i18n/routing";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import EmptyState from "./catalog/EmptyState";
import SortDropdown from "./catalog/SortDropdown";
import FilterPanel from "./catalog/FilterPanel";
import type { SortOrder } from "./catalog/types";
import type { CatalogProduct, CatalogCollection } from "@/lib/catalog";

// Strong ease-out per Emil's design principles
const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

export type TemplateCatalogMode = "home" | "page";

interface TemplateCatalogProps {
  mode?: TemplateCatalogMode;
  showHeading?: boolean;
  products: CatalogProduct[];
  collections: CatalogCollection[];
}

export default function TemplateCatalog({
  mode = "home",
  showHeading = true,
  products,
  collections,
}: TemplateCatalogProps) {
  // Home carousel teases a handful per category; the full list lives at /products.
  const HOME_LIMIT = 5;
  const t = useTranslations("Templates");
  const router = useRouter();

  const carouselRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [popularOnly, setPopularOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState<boolean>(true);
  const [popularSectionExpanded, setPopularSectionExpanded] = useState<boolean>(true);

  // Scroll so the target card's left edge lands under the heading (start align).
  const scrollToIndex = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>(".carousel-card");
    const card = cards[index];
    if (!card) return;
    const padLeft = parseFloat(getComputedStyle(container).paddingLeft) || 0;
    container.scrollTo({ left: card.offsetLeft - padLeft, behavior: "smooth" });
  };

  // ─── Mouse drag-to-scroll ───────────────────────────────────────────────
  // Touch + trackpad already scroll the carousel natively; this adds click-and-drag
  // for desktop mouse users. We only engage for `mouse` pointers so touch stays native.
  const dragState = useRef({ isDragging: false, startX: 0, startScrollLeft: 0, moved: false });

  const onCarouselPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const container = carouselRef.current;
    if (!container) return;
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false,
    };
    // Disable snap + smooth so the drag tracks the cursor 1:1.
    container.style.scrollSnapType = "none";
    container.style.scrollBehavior = "auto";
  };

  const onCarouselPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    const container = carouselRef.current;
    if (!state.isDragging || !container) return;
    const delta = e.clientX - state.startX;
    if (Math.abs(delta) > 5) state.moved = true;
    container.scrollLeft = state.startScrollLeft - delta;
  };

  const endCarouselDrag = () => {
    const container = carouselRef.current;
    if (!container || !dragState.current.isDragging) return;
    dragState.current.isDragging = false;
    // Restore snap + smooth so the nearest card settles back under the heading.
    container.style.scrollSnapType = "";
    container.style.scrollBehavior = "";
  };

  // Suppress card-link navigation if the pointer was actually dragged.
  const onCarouselClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

  // Push state to browser history when mobile filter opens so that the back button closes it
  useEffect(() => {
    if (mobileFilterOpen) {
      window.history.pushState({ mobileFilterOpen: true }, "");

      const handlePopState = () => {
        setMobileFilterOpen(false);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [mobileFilterOpen]);

  const closeMobileFilterManually = () => {
    if (mobileFilterOpen) {
      if (window.history.state?.mobileFilterOpen) {
        window.history.back();
      }
      setMobileFilterOpen(false);
    }
  };

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
      if (e.key === "Escape") closeMobileFilterManually();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileFilterOpen]);

  const categories = [
    { id: "all", label: t("categories.all") },
    ...collections.map((c) => ({ id: c.code, label: c.name })),
  ];

  // ─── Filter + sort pipeline ───────────────────────────────────────────────
  const filteredTemplates = useMemo(() => {
    const list = products.filter((p) => {
      if (activeCategory !== "all" && p.collection_code !== activeCategory) return false;
      if (popularOnly && !p.popular) return false;
      if (searchQuery.trim()) {
        return p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
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
      // top sellers first, then other sellers (popular), original order otherwise
      const rank = (p: CatalogProduct) => (p.top_seller ? 2 : p.popular ? 1 : 0);
      sorted.sort((a, b) => rank(b) - rank(a));
    }
    return sorted;
  }, [products, activeCategory, searchQuery, popularOnly, sortOrder]);

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
  const renderCard = (product: CatalogProduct, index: number) => (
    <motion.div
      layout
      key={product.slug}
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 20 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.24), ease: EASE_OUT_STRONG }}
      className="w-[285px] sm:w-auto shrink-0 snap-align-start snap-always"
    >
      <Link href={`/products/${product.slug}`} className="group block text-left">
        {/* Image-only card — only the preview gets the border + shadow + radius */}
        <div className="relative w-full aspect-[4/5] bg-[#fdfdfd] rounded-[18px] overflow-hidden border border-[#f2f2f2] shadow-card-lift transition-[box-shadow,border-color] duration-300 ease-out group-hover:shadow-card-lift-hover group-hover:border-[#d9d9dd]">
          {/* Seller badge (top-left) — top sellers get a filled green chip,
              other best-sellers keep the pale "popular" chip. */}
          {(product.top_seller || product.popular) && (
            <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
              <span
                className={`inline-flex items-center text-[10px] px-2.5 py-1 rounded-full font-poppins font-medium select-none ${
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
            className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          />
        </div>

        {/* Metadata — sits OUTSIDE the card, plain text on the page background */}
        <div className="mt-3 flex justify-between items-baseline gap-3">
          <h3 className="font-poppins text-[15px] sm:text-[16px] font-medium text-[#212121] truncate">
            {product.name}
          </h3>
          <span className="shrink-0 font-poppins text-[13px] font-medium text-[#212121]">
            {t("priceTag")}
          </span>
        </div>

        <p className="mt-1 font-poppins text-[12.5px] text-[#616161] leading-snug">
          {product.collection_name}
        </p>

        <p className="mt-1 font-poppins text-[12.5px] text-[#93939f] leading-snug line-clamp-2">
          {t("editDescription", { category: product.collection_name })}
        </p>
      </Link>
    </motion.div>
  );

  // ─── HOME MODE: Custom Swipable Carousel & Rounded Band ─────────────────
  const renderHomeCard = (product: CatalogProduct, index: number) => (
    <motion.div
      layout
      key={product.slug}
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 20 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.24), ease: EASE_OUT_STRONG }}
      className="carousel-card w-[260px] sm:w-[300px] lg:w-[340px] shrink-0 snap-start snap-always"
    >
      <Link href={`/products/${product.slug}`} className="group block text-left">
        {/* The full-size template preview card */}
        <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden border border-white/10 shadow-xl transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-2xl">
          {/* Seller badge inside the card — top seller filled, popular pale */}
          {(product.top_seller || product.popular) && (
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <span
                className={`inline-flex items-center text-[10px] px-2.5 py-1 rounded-full font-poppins font-medium select-none ${
                  product.top_seller ? "bg-[#346739] text-white" : "bg-[#edfce9] text-[#346739]"
                }`}
              >
                {product.top_seller ? t("topSellerLabel") : t("popularLabel")}
              </span>
            </div>
          )}



          <TemplatePreviewCard src={product.cover_url} alt={product.name} className="w-full h-full" />
        </div>

        {/* Bottom Details outside the card */}
        <div className="mt-4 flex flex-col px-1">
          <div className="flex justify-between items-baseline gap-3">
            <h3 className="font-poppins text-[16px] sm:text-[18px] font-medium text-white truncate">
              {product.name}
            </h3>
            <span className="shrink-0 font-poppins text-[13px] font-medium text-white/90">
              {t("priceTag")}
            </span>
          </div>
          <p className="mt-1.5 font-poppins text-[12px] text-white/60 leading-snug uppercase">
            {product.collection_name}
          </p>
        </div>
      </Link>
    </motion.div>
  );

  // Reset the carousel to the first card (aligned under the heading) on filter change
  useEffect(() => {
    if (mode === "home") {
      scrollToIndex(0);
    }
  }, [activeCategory]);

  // Settle on the first card on initial mount (once cards have laid out)
  useEffect(() => {
    if (mode === "home") {
      const timer = setTimeout(() => {
        scrollToIndex(0);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  if (mode === "home") {
    return (
      <section className="w-full bg-[#003c33] py-20 flex flex-col items-center overflow-hidden rounded-[32px] md:rounded-[48px] my-12 relative shadow-xl">
        {/* Header and filters: left-aligned inside max-w-1200px; the heading's left
            edge is the same offset the carousel's first card snaps to below. */}
        <div className="w-full max-w-[1200px] px-6 flex flex-col items-start relative z-10">
          {showHeading && (
            <header className="text-left max-w-3xl flex flex-col items-start mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: EASE_OUT_STRONG }}
                className="text-3xl sm:text-4xl md:text-5xl font-poppins font-normal tracking-[-0.02em] leading-[1.15] text-white mb-4"
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
                className="text-white/70 font-poppins text-sm sm:text-base md:text-lg max-w-2xl font-light"
              >
                {t("subtitle")}
              </motion.p>
            </header>
          )}

          <div className="w-full flex flex-col items-start mb-10">
            <span className="text-[10px] uppercase text-white/50 mb-3 font-poppins font-medium">
              {t("selectCategory")}
            </span>
            <div className="flex flex-wrap justify-start gap-2 max-w-4xl">
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
                    <button
                      onClick={() => setActiveCategory(cat.id)}
                      className={`rounded-full px-4 py-2 text-[13px] sm:text-xs font-poppins font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
                        isActive 
                          ? "bg-[#edfce9] text-[#003c33] shadow-sm" 
                          : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                      aria-pressed={isActive}
                    >
                      {cat.label}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Carousel: Full width of the section, left-aligned to screen edges */}
        <div className="relative w-full z-10">
          {/* Scroll snap Track */}
          <div
            ref={carouselRef}
            onPointerDown={onCarouselPointerDown}
            onPointerMove={onCarouselPointerMove}
            onPointerUp={endCarouselDrag}
            onPointerLeave={endCarouselDrag}
            onClickCapture={onCarouselClickCapture}
            onDragStart={(e) => e.preventDefault()}
            className="w-full overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory flex gap-6 px-[max(1.5rem,calc((100%_-_1200px)_/_2_+_1.5rem))] scroll-pl-[max(1.5rem,calc((100%_-_1200px)_/_2_+_1.5rem))] cursor-grab active:cursor-grabbing select-none"
          >
            <AnimatePresence mode="popLayout">
              {visibleTemplates.map((tpl, i) => renderHomeCard(tpl, i))}
            </AnimatePresence>
          </div>
        </div>

        {/* Catalog CTA: always present, centered (reference keeps a standing "Read more") */}
        <div className="w-full max-w-[1200px] px-6 md:px-8 flex flex-col items-center relative z-10 mt-14">
            <button
              className="rounded-full px-6 py-3 bg-white text-[#003c33] font-poppins font-medium text-xs uppercase flex items-center gap-2 hover:bg-[#edfce9] transition-all duration-200 active:scale-95 shadow-md cursor-pointer group animate-none"
              onClick={() => router.push("/products")}
            >
              <span>{t("loadMore")}</span>
              <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
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
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-11 pl-11 pr-10 rounded-full border border-[#e5e7eb] bg-white text-sm text-[#212121] placeholder:text-[#93939f] font-poppins outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#346739] focus:shadow-[0_0_0_3px_rgba(52,103,57,0.15)]"
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
              onClick={closeMobileFilterManually}
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
              transition={{ duration: 0.35, ease: EASE_OUT_STRONG }}
              className="fixed inset-0 z-[101] w-full h-full bg-white flex flex-col lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#f2f2f2] shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeMobileFilterManually}
                    aria-label="Back"
                    className="w-9 h-9 rounded-full hover:bg-[#f2f2f2] flex items-center justify-center text-[#212121] active:scale-[0.95] transition-[background-color,transform] duration-150 ease-out"
                  >
                    <IconChevronLeft size={20} />
                  </button>
                  <h3 className="font-poppins text-base font-medium text-[#212121]">
                    {t("filterTitle")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeMobileFilterManually}
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
                  onClick={closeMobileFilterManually}
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

