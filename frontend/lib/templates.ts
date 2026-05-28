// ─── Template Registry ────────────────────────────────────────────────────────
// Single source of truth for template metadata.
// Visual styles live in TemplatePreviewCard.tsx (client component).

export interface TemplateInfo {
  id: string;
  name: string;
  slug: string;
  categories: string[];
}

export const templateList: TemplateInfo[] = [
  { id: "city3",       name: "City 3",      slug: "city3",       categories: ["hindu"] },
  { id: "city",        name: "City",         slug: "city",        categories: ["hindu"] },
  { id: "beach",       name: "Beach",        slug: "beach",       categories: ["hindu", "saveDate"] },
  { id: "grace",       name: "Grace",        slug: "grace",       categories: ["christian", "saveDate"] },
  { id: "serenity",    name: "Serenity",     slug: "serenity",    categories: ["christian"] },
  { id: "royalSikh",   name: "Royal Sikh",   slug: "royalSikh",   categories: ["sikh"] },
  { id: "noor",        name: "Noor",         slug: "noor",        categories: ["muslim"] },
  { id: "royalDeccan", name: "Royal Deccan", slug: "royalDeccan", categories: ["southIndian"] },
  { id: "minimalist",  name: "Minimalist",   slug: "minimalist",  categories: ["saveDate", "all"] },
];

export function getTemplateBySlug(slug: string): TemplateInfo | undefined {
  return templateList.find((t) => t.slug === slug);
}
