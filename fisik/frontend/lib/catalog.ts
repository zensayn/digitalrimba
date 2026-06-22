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
