"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchIcon, CloseIcon } from "./Icons";

const POPULAR_SEARCHES = [
  "Coats",
  "Wool",
  "Cashmere",
  "Blazers",
  "Linen",
  "Trousers",
  "Shirts",
  "Dresses",
];

export default function SearchBox({ initialQuery = "", category }: { initialQuery?: string; category?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(initialQuery);

  const handleSearch = (queryText: string, cat?: string) => {
    const q = queryText.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const c = cat !== undefined ? cat : (category || searchParams.get("category") || "");
    if (c && c !== "all") params.set("category", c);
    
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(term);
  };

  const handleClear = () => {
    setTerm("");
    const params = new URLSearchParams();
    const c = category || searchParams.get("category") || "";
    if (c && c !== "all") params.set("category", c);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const activeCategory = category || searchParams.get("category") || "all";

  return (
    <div className="search-box">
      <form className="search-box__form" onSubmit={onSubmit}>
        <div className="search-box__input-wrap">
          <span className="search-box__icon">
            <SearchIcon size={20} />
          </span>
          <input
            type="search"
            className="search-box__input"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by piece, fabric, style (e.g. wool coat, linen blazer, cashmere)…"
            aria-label="Search items"
          />
          {term && (
            <button
              type="button"
              className="search-box__clear"
              aria-label="Clear search"
              onClick={handleClear}
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="btn btn--primary btn--sm search-box__submit">
          Search
        </button>
      </form>

      {/* Category filter pills */}
      <div className="search-box__filters">
        <span className="search-box__filter-label">Category:</span>
        <button
          type="button"
          className={`search-box__cat-btn ${activeCategory === "all" ? "is-active" : ""}`}
          onClick={() => handleSearch(term, "all")}
        >
          All
        </button>
        <button
          type="button"
          className={`search-box__cat-btn ${activeCategory === "women" ? "is-active" : ""}`}
          onClick={() => handleSearch(term, "women")}
        >
          Women
        </button>
        <button
          type="button"
          className={`search-box__cat-btn ${activeCategory === "men" ? "is-active" : ""}`}
          onClick={() => handleSearch(term, "men")}
        >
          Men
        </button>
      </div>

      {/* Popular quick-tap tags */}
      <div className="search-box__popular">
        <span className="search-box__popular-label">Popular:</span>
        <div className="search-box__tags">
          {POPULAR_SEARCHES.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`search-box__tag ${term.toLowerCase() === tag.toLowerCase() ? "is-active" : ""}`}
              onClick={() => {
                setTerm(tag);
                handleSearch(tag);
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

