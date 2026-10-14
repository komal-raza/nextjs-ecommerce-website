import Link from "next/link";
import { Suspense } from "react";
import { getProducts, type SortKey } from "@/lib/api";
import { CATEGORIES, subcategoriesFor, type CategoryId } from "@/lib/data";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import SortSelect from "./SortSelect";

const VALID_SORTS: SortKey[] = ["featured", "price-asc", "price-desc", "newest"];

/** Shared listing page body for /women and /men. Filter + sort state lives in the URL. */
export default async function CategoryListing({
  category,
  sub,
  sort,
}: {
  category: CategoryId;
  sub?: string;
  sort?: string;
}) {
  const sortKey = VALID_SORTS.includes(sort as SortKey) ? (sort as SortKey) : "featured";
  const subs = subcategoriesFor(category);
  const activeSub = subs.find((s) => s.toLowerCase() === sub?.toLowerCase());
  const products = await getProducts({ category, subcategory: activeSub, sort: sortKey });
  const label = CATEGORIES.find((c) => c.id === category)!.label;

  const href = (s?: string) => {
    const p = new URLSearchParams();
    if (s) p.set("sub", s);
    if (sortKey !== "featured") p.set("sort", sortKey);
    const qs = p.toString();
    return qs ? `/${category}?${qs}` : `/${category}`;
  };

  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="micro">Collection</p>
          <h1 className="h1">{label}</h1>
        </div>
      </header>

      <div className="container toolbar">
        <div className="pills" role="list">
          <Link role="listitem" href={href()} className={`pill ${!activeSub ? "is-active" : ""}`}>All</Link>
          {subs.map((s) => (
            <Link key={s} role="listitem" href={href(s)} className={`pill ${activeSub === s ? "is-active" : ""}`}>{s}</Link>
          ))}
        </div>
        <Suspense fallback={null}>
          <SortSelect value={sortKey} />
        </Suspense>
      </div>

      <section className="container listing">
        <p className="micro count">{products.length} {products.length === 1 ? "piece" : "pieces"}</p>
        {products.length === 0 ? (
          <p className="empty">Nothing here yet — check back soon.</p>
        ) : (
          <div className="grid">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 70}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

