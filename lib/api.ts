/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  THE BACKEND-SWAP SEAM                                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 * Every page and component reads catalogue data through these async
 * functions ONLY — nothing imports PRODUCTS directly. Today they resolve
 * from the in-memory arrays in `lib/data.ts`. To go live, replace each body
 * with a `fetch()` to your API and keep the signatures + return types:
 *
 *   export async function getProductById(id: string) {
 *     const res = await fetch(`${API}/products/${id}`, { next: { revalidate: 60 } });
 *     return res.ok ? ((await res.json()) as Product) : undefined;
 *   }
 *
 * No page-level changes are required.
 */
import { PRODUCTS, type CategoryId, type Product } from "./data";

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export interface ProductQuery {
  category?: CategoryId;
  subcategory?: string;
  sort?: SortKey;
  /** Free-text search over name, description, category and subcategory. */
  query?: string;
  limit?: number;
}

export async function getProducts(opts: ProductQuery = {}): Promise<Product[]> {
  const { category, subcategory, sort = "featured", query, limit } = opts;
  let list = PRODUCTS.map((p, index) => ({ p, index }));

  if (category) list = list.filter(({ p }) => p.category === category);
  if (subcategory) {
    const s = subcategory.toLowerCase();
    list = list.filter(({ p }) => p.subcategory.toLowerCase() === s);
  }
  if (query?.trim()) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter(({ p }) => {
      const hay = `${p.name} ${p.description} ${p.category} ${p.subcategory}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.p.price - b.p.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.p.price - a.p.price);
      break;
    case "newest":
      // New flag first, then most recently added (later in array) first.
      list.sort((a, b) => Number(!!b.p.isNew) - Number(!!a.p.isNew) || b.index - a.index);
      break;
    default:
      // Featured first, original order otherwise.
      list.sort((a, b) => Number(!!b.p.featured) - Number(!!a.p.featured) || a.index - b.index);
  }

  const out = list.map(({ p }) => p);
  return limit ? out.slice(0, limit) : out;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.id === id);
}

export async function getFeatured(limit = 8): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.featured).slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.isNew).slice(0, limit);
}

export async function getTrending(limit = 8): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.trending).slice(0, limit);
}

/** Same subcategory first, then same category; excludes the product itself. */
export async function getRelated(id: string, limit = 4): Promise<Product[]> {
  const base = PRODUCTS.find((p) => p.id === id);
  if (!base) return [];
  const others = PRODUCTS.filter((p) => p.id !== id && p.category === base.category);
  others.sort(
    (a, b) =>
      Number(b.subcategory === base.subcategory) - Number(a.subcategory === base.subcategory),
  );
  return others.slice(0, limit);
}

/** Used by generateStaticParams — also part of the seam. */
export async function getAllProductIds(): Promise<string[]> {
  return PRODUCTS.map((p) => p.id);
}

