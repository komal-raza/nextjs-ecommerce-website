/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  THE BACKEND SEAM: INSFORGE DATABASE INTEGRATION                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 * Every page and component reads catalogue data through these async
 * functions ONLY — nothing imports PRODUCTS directly. Queries run
 * against the InsForge `products` table.
 */
import { insforge } from "./insforge";
import type { CategoryId, Product } from "./data";

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export interface ProductQuery {
  category?: CategoryId;
  subcategory?: string;
  sort?: SortKey;
  /** Free-text search over name, description, category and subcategory. */
  query?: string;
  limit?: number;
}

interface ProductDbRow {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number | string;
  compare_at_price: number | string | null;
  description: string;
  sizes: string[];
  images: string[];
  featured: boolean;
  is_new: boolean;
  trending: boolean;
  created_at?: string;
}

function rowToProduct(row: ProductDbRow): Product {
  const images = (Array.isArray(row.images) ? row.images : []) as string[];
  return {
    id: row.id,
    name: row.name,
    category: row.category as CategoryId,
    subcategory: row.subcategory,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    description: row.description,
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    images: [images[0] || "", images[1] || images[0] || ""],
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    trending: Boolean(row.trending),
  };
}

export async function getProducts(opts: ProductQuery = {}): Promise<Product[]> {
  const { category, subcategory, sort = "featured", query, limit } = opts;

  let queryBuilder = insforge.database.from("products").select("*");
  if (category) {
    queryBuilder = queryBuilder.eq("category", category);
  }

  const { data, error } = await queryBuilder;
  if (error || !data) {
    console.error("Error fetching products from InsForge:", error);
    return [];
  }

  let list = (data as unknown as ProductDbRow[]).map((row, index) => ({
    p: rowToProduct(row),
    index,
  }));

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
      list.sort((a, b) => Number(!!b.p.isNew) - Number(!!a.p.isNew) || b.index - a.index);
      break;
    default:
      list.sort((a, b) => Number(!!b.p.featured) - Number(!!a.p.featured) || a.index - b.index);
  }

  const out = list.map(({ p }) => p);
  return limit ? out.slice(0, limit) : out;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await insforge.database
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error && error.message !== "JSON object requested, multiple (or no) rows returned") {
      console.error(`Error fetching product ${id}:`, error);
    }
    return undefined;
  }
  return rowToProduct(data as unknown as ProductDbRow);
}

export async function getFeatured(limit = 8): Promise<Product[]> {
  const { data, error } = await insforge.database
    .from("products")
    .select("*")
    .eq("featured", true)
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching featured products:", error);
    return [];
  }
  return (data as unknown as ProductDbRow[]).map(rowToProduct);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const { data, error } = await insforge.database
    .from("products")
    .select("*")
    .eq("is_new", true)
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
  return (data as unknown as ProductDbRow[]).map(rowToProduct);
}

export async function getTrending(limit = 8): Promise<Product[]> {
  const { data, error } = await insforge.database
    .from("products")
    .select("*")
    .eq("trending", true)
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching trending products:", error);
    return [];
  }
  return (data as unknown as ProductDbRow[]).map(rowToProduct);
}

/** Same subcategory first, then same category; excludes the product itself. */
export async function getRelated(id: string, limit = 4): Promise<Product[]> {
  const base = await getProductById(id);
  if (!base) return [];

  const { data, error } = await insforge.database
    .from("products")
    .select("*")
    .eq("category", base.category)
    .neq("id", id);

  if (error || !data) return [];
  const others = (data as unknown as ProductDbRow[]).map(rowToProduct);
  others.sort(
    (a, b) =>
      Number(b.subcategory === base.subcategory) - Number(a.subcategory === base.subcategory),
  );
  return others.slice(0, limit);
}

/** Used by generateStaticParams — also part of the seam. */
export async function getAllProductIds(): Promise<string[]> {
  const { data, error } = await insforge.database
    .from("products")
    .select("id");

  if (error || !data) return [];
  return (data as unknown as Array<{ id: string }>).map((r) => r.id);
}
