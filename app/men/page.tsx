import type { Metadata } from "next";
import CategoryListing from "@/components/CategoryListing";

export const metadata: Metadata = { title: "Men" };

export default async function MenPage({ searchParams }: { searchParams: Promise<{ sub?: string; sort?: string }> }) {
  const { sub, sort } = await searchParams;
  return <CategoryListing category="men" sub={sub} sort={sort} />;
}

