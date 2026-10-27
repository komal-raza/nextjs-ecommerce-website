import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import SearchBox from "@/components/SearchBox";
import { getProducts, getFeatured } from "@/lib/api";
import type { CategoryId } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Search | ELUARA",
  description: "Search our curated collection of timeless, luxury wardrobe essentials.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const validCategory = category === "women" || category === "men" ? (category as CategoryId) : undefined;
  
  const hasQuery = Boolean(q.trim());
  const results = hasQuery
    ? await getProducts({ query: q, category: validCategory })
    : [];

  const recommendations = results.length === 0 ? await getFeatured(8) : [];

  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="micro">Collection Catalogue</p>
          <h1 className="h1">
            {hasQuery
              ? `Results for “${q.trim()}”`
              : "Search Collection"}
          </h1>
        </div>
      </header>

      <div className="container" style={{ paddingTop: "1.5rem" }}>
        <SearchBox initialQuery={q} category={validCategory} />
      </div>

      <section className="container listing">
        {hasQuery && (
          <p className="micro count">
            {results.length} {results.length === 1 ? "result" : "results"}
            {validCategory ? ` in ${validCategory}` : ""}
          </p>
        )}

        {results.length > 0 ? (
          <div className="grid">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : hasQuery ? (
          <div className="search-empty-state">
            <p className="empty" style={{ padding: "2rem 0 1rem" }}>
              No pieces matched “{q.trim()}”{validCategory ? ` in ${validCategory}` : ""}.
            </p>
            <p className="micro" style={{ textAlign: "center", color: "var(--ink-soft)", marginBottom: "3rem" }}>
              Try searching for “coat”, “linen”, “blazer”, “cashmere”, or select another category.
            </p>

            {recommendations.length > 0 && (
              <div className="search-recommendations" style={{ borderTop: "1px solid var(--line)", paddingTop: "3rem" }}>
                <div className="section__head">
                  <div>
                    <p className="micro">Curated Selection</p>
                    <h2 className="h2">Popular Essentials</h2>
                  </div>
                </div>
                <div className="grid">
                  {recommendations.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="search-initial-state">
            {recommendations.length > 0 && (
              <div className="search-recommendations" style={{ paddingTop: "2rem" }}>
                <div className="section__head">
                  <div>
                    <p className="micro">Explore</p>
                    <h2 className="h2">Trending Pieces</h2>
                  </div>
                </div>
                <div className="grid">
                  {recommendations.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
