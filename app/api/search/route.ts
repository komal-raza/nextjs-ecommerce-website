import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 50);
    const category = searchParams.get("category") as "women" | "men" | undefined;

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const results = await getProducts({
      query: q,
      category: category && (category === "women" || category === "men") ? category : undefined,
      limit,
    });

    return NextResponse.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search error";
    return NextResponse.json({ results: [], error: message }, { status: 500 });
  }
}

