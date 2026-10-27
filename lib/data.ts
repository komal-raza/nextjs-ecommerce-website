/**
 * Catalogue data + types.
 *
 * Products come from the listings pipeline: edit `incoming/listings.csv`, drop photos in
 * `incoming/images/` and run `npm run import-listings` — that regenerates
 * `lib/generated-products.ts` (never hand-edit). BASE_PRODUCTS is an optional place for
 * hand-written demo products; it is currently empty.
 */
import { GENERATED_PRODUCTS } from "./generated-products";

export type CategoryId = "women" | "men";

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  sizes: string[];
  /** Image URLs: primary, hover, and any additional gallery images */
  images: string[];
  featured?: boolean;
  isNew?: boolean;
  trending?: boolean;
}

export interface Category {
  id: CategoryId;
  label: string;
  /** Curated subcategory order — used first when building filter pills. */
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "women",
    label: "Women",
    subcategories: ["Dresses", "Tops", "Knitwear", "Outerwear", "Blazers", "Trousers", "Accessories"],
  },
  {
    id: "men",
    label: "Men",
    subcategories: ["Shirts", "T-Shirts", "Knitwear", "Outerwear", "Trousers", "Accessories"],
  },
];

export const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

/** Category card images on the homepage (collection posters). */
export const CATEGORY_IMAGES: Record<CategoryId, string> = {
  women: "/images/categories/women-collection-poster.png",
  men: "/images/categories/men-collections-poster.jpg",
};

/** Optional hand-written demo products (empty — the catalogue is the imported listings). */
export const BASE_PRODUCTS: Product[] = [];

/**
 * The ACTIVE catalogue — imported listings only.
 * To merge in hand-written demo products too, change the line below to:
 *   export const PRODUCTS: Product[] = [...BASE_PRODUCTS, ...GENERATED_PRODUCTS];
 */
export const PRODUCTS: Product[] = GENERATED_PRODUCTS;

/**
 * Subcategories that actually have products in the active catalogue.
 * Curated CATEGORIES order first, then any extras (e.g. from imports) alphabetically.
 */
export function subcategoriesFor(category: CategoryId): string[] {
  const present = new Set(
    PRODUCTS.filter((p) => p.category === category).map((p) => p.subcategory),
  );
  const curated = CATEGORIES.find((c) => c.id === category)?.subcategories ?? [];
  const ordered = curated.filter((s) => present.has(s));
  const extras = [...present].filter((s) => !curated.includes(s)).sort();
  return [...ordered, ...extras];
}
