import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await getProducts({ query: q }) : [];
  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="micro">Search</p>
          <h1 className="h1">{q.trim() ? `Results for “${q}”` : "Search"}</h1>
        </div>
      </header>
      <section className="container listing">
        {q.trim() && <p className="micro count">{results.length} {results.length === 1 ? "result" : "results"}</p>}
        {results.length > 0 ? (
          <div className="grid">{results.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        ) : (
          <p className="empty">{q.trim() ? "No pieces matched your search. Try “coat”, “linen” or “knit”." : "Type something into the search above."}</p>
        )}
      </section>
    </>
  );
}

