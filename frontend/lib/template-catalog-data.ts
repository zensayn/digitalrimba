// ─── Template catalog data ────────────────────────────────────────────────────
// Single source of truth for template metadata used by the homepage section,
// the /products listing page, and the slug page's recommendation grid.
// Lives outside any "use client" boundary so Server Components can import it
// without dragging the whole catalog UI across the RSC payload.

export const TEMPLATE_CATEGORY_IDS = [
  "all",
  "hindu",
  "christian",
  "sikh",
  "muslim",
  "southIndian",
  "saveDate",
] as const;

export type TemplateCategoryId = (typeof TEMPLATE_CATEGORY_IDS)[number];

export interface TemplateMeta {
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
  { id: "minimalist", name: "Minimalist", categories: ["saveDate"], popular: true },
] as const;

// Real categories used to render group headings — excludes the synthetic "all" id.
export const REAL_CATEGORY_IDS = TEMPLATE_CATEGORY_IDS.filter(
  (id) => id !== "all"
) as Exclude<TemplateCategoryId, "all">[];
