// ─── Catalog data access ──────────────────────────────────────────────────────
// Server-side fetch helpers for the Rimba product catalog, served by the Go
// backend (see backend/internal/handlers/catalog.go). Image bytes load directly
// from R2 (contents.rimba.app); only this metadata comes through the API.
//
// List helpers degrade to an empty list if the backend is unreachable so the
// marketing pages never hard-crash when the catalog service is down.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Public R2 host. The DB stores only the relative object key; the public URL is
// composed here, so the CDN/bucket host lives in exactly one place.
const R2_BASE = (
  process.env.NEXT_PUBLIC_R2_BASE_URL ?? "https://contents.rimba.app"
).replace(/\/$/, "");

const r2Url = (key: string): string => `${R2_BASE}/${key}`;

// Revalidate cached catalog responses hourly (ISR).
const REVALIDATE_SECONDS = 3600;

export interface CatalogCollection {
  code: string;
  name: string;
  sort_order: number;
  product_count: number;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  code: string;
  collection_code: string;
  collection_name: string;
  cover_url: string;
  popular: boolean;
  top_seller: boolean;
  sort_order: number;
}

export interface CatalogImage {
  url: string;
  position: number;
  alt: string;
}

export interface CatalogProductDetail extends CatalogProduct {
  images: CatalogImage[];
}

// ─── Pricing ────────────────────────────────────────────────────────────────
// The Go backend exposes a versioned price book (see backend/internal/handlers/
// pricing.go). Tiers are quantity brackets; each product carries a per-tier
// amount map keyed by tier code (null = that tier is unpriced/pending).

export interface PricingTier {
  code: string;
  label: string;
  min_qty: number;
  max_qty: number | null; // null = open-ended (e.g. 500+)
  sort_order: number;
}

export interface ProductPricing {
  rimba_code: string;
  invitto_code: string;
  name: string;
  collection_code: string;
  product_slug: string | null; // null when no catalog product matches
  status: string; // 'available' | 'pending'
  prices: Record<string, number | null>; // tier_code → amount (null = unpriced)
}

export interface PricingCatalog {
  currency: string;
  tiers: PricingTier[];
  products: ProductPricing[];
}

// Per-card price summary: the entry (lowest-tier) unit price, plus whether the
// product is sellable. Drives "Mulai Rp…" tags and the gray inactive state.
export interface CardPrice {
  from: number | null;
  available: boolean;
}

// ─── Raw API shapes ─────────────────────────────────────────────────────────
// The backend returns relative R2 keys (cover_key / key). We compose the full
// public URL via r2Url() so the rest of the app keeps consuming cover_url / url.

type RawCatalogProduct = Omit<CatalogProduct, "cover_url"> & {
  cover_key: string;
};

type RawCatalogImage = Omit<CatalogImage, "url"> & { key: string };

type RawCatalogProductDetail = RawCatalogProduct & {
  images: RawCatalogImage[];
};

function toCatalogProduct(p: RawCatalogProduct): CatalogProduct {
  const { cover_key, ...rest } = p;
  return { ...rest, cover_url: r2Url(cover_key) };
}

function toCatalogProductDetail(
  p: RawCatalogProductDetail
): CatalogProductDetail {
  return {
    ...toCatalogProduct(p),
    images: p.images.map(({ key, ...img }) => ({ ...img, url: r2Url(key) })),
  };
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`catalog fetch failed (${res.status}): ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchCollections(): Promise<CatalogCollection[]> {
  try {
    return await getJSON<CatalogCollection[]>("/api/catalog/collections");
  } catch (err) {
    console.error("[catalog] fetchCollections failed:", err);
    return [];
  }
}

export async function fetchProducts(collection?: string): Promise<CatalogProduct[]> {
  const query = collection ? `?collection=${encodeURIComponent(collection)}` : "";
  try {
    const products = await getJSON<RawCatalogProduct[]>(
      `/api/catalog/products${query}`
    );
    return products.map(toCatalogProduct);
  } catch (err) {
    console.error("[catalog] fetchProducts failed:", err);
    return [];
  }
}

export async function fetchProductBySlug(
  slug: string
): Promise<CatalogProductDetail | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/catalog/products/${encodeURIComponent(slug)}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`catalog fetch failed (${res.status}): product ${slug}`);
    }
    const raw = (await res.json()) as RawCatalogProductDetail;
    return toCatalogProductDetail(raw);
  } catch (err) {
    // Backend unreachable (e.g. ECONNREFUSED) or a bad response: degrade to
    // "not found" so the page renders notFound() instead of hard-crashing,
    // matching fetchProducts/fetchCollections above.
    console.error(`[catalog] fetchProductBySlug failed (${slug}):`, err);
    return null;
  }
}

// Full active price book (tiers + every priced product). Degrades to null if the
// pricing service is down, so price-aware pages fall back to a no-price state.
export async function fetchPricingCatalog(): Promise<PricingCatalog | null> {
  try {
    return await getJSON<PricingCatalog>("/api/catalog/pricing");
  } catch (err) {
    console.error("[catalog] fetchPricingCatalog failed:", err);
    return null;
  }
}

// ─── Pricing helpers ──────────────────────────────────────────────────────────

/** Format a whole-Rupiah amount, e.g. 17700 → "Rp17.700". */
export const formatIDR = (n: number): string => `Rp${n.toLocaleString("id-ID")}`;

/**
 * Entry (headline) unit price for a product: the amount of the lowest-quantity
 * tier that actually has a price. Returns null when no tier is priced.
 */
export function entryPrice(
  pricing: ProductPricing,
  tiers: PricingTier[]
): number | null {
  const ordered = [...tiers].sort((a, b) => a.sort_order - b.sort_order);
  for (const tier of ordered) {
    const amount = pricing.prices[tier.code];
    if (amount != null) return amount;
  }
  return null;
}

/**
 * Map catalog slug → card price summary, for product listing cards. Only
 * products that link to a catalog product (product_slug != null) are included.
 */
export function pricingBySlug(
  catalog: PricingCatalog | null
): Record<string, CardPrice> {
  const map: Record<string, CardPrice> = {};
  if (!catalog) return map;
  for (const p of catalog.products) {
    if (!p.product_slug) continue;
    const from = entryPrice(p, catalog.tiers);
    map[p.product_slug] = {
      from,
      available: p.status === "available" && from != null,
    };
  }
  return map;
}
