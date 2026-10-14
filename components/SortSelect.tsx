"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "./Icons";

const OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

/** Sort dropdown — writes `?sort=` to the URL, preserving other params (e.g. `sub`). */
export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="sort">
      <span className="micro">Sort by</span>
      <span className="sort__wrap">
        <select
          value={value}
          onChange={(e) => {
            const next = new URLSearchParams(params.toString());
            if (e.target.value === "featured") next.delete("sort");
            else next.set("sort", e.target.value);
            const qs = next.toString();
            router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
          }}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={16} />
      </span>
    </label>
  );
}

