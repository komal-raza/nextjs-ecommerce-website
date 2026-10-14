import type { Metadata } from "next";
import CategoryListing from "@/components/CategoryListing";

export const metadata: Metadata = { title: "Women" };

export default async function WomenPage({ searchParams }: { searchParams: Promise<{ sub?: string; sort?: string }> }) {
  const { sub, sort } = await searchParams;
  return <CategoryListing category="women" sub={sub} sort={sort} />;
}

