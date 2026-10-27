import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin";
import { getInsforgeAdmin } from "@/lib/insforge";

export async function GET(req: NextRequest) {
  const { error, status } = await verifyAdmin(req);
  if (error) {
    return NextResponse.json({ error }, { status: status || 401 });
  }

  const admin = getInsforgeAdmin();
  const { data: products, error: dbErr } = await admin.database
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ products: products || [] });
}

export async function POST(req: NextRequest) {
  const { error, status } = await verifyAdmin(req);
  if (error) {
    return NextResponse.json({ error }, { status: status || 401 });
  }

  try {
    const body = await req.json();
    const {
      id: customId,
      name,
      category,
      subcategory,
      price,
      compare_at_price,
      description,
      sizes,
      images,
      featured,
      is_new,
      trending,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Product title/name is required." }, { status: 400 });
    }

    if (!category || (category !== "women" && category !== "men")) {
      return NextResponse.json({ error: "Category must be either 'women' or 'men'." }, { status: 400 });
    }

    if (!subcategory || typeof subcategory !== "string" || !subcategory.trim()) {
      return NextResponse.json({ error: "Subcategory is required." }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ error: "Price must be a positive number greater than 0." }, { status: 400 });
    }

    let numCompare: number | null = null;
    if (compare_at_price !== undefined && compare_at_price !== null && compare_at_price !== "") {
      const parsed = Number(compare_at_price);
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json({ error: "Compare at price must be a valid non-negative number." }, { status: 400 });
      }
      numCompare = parsed;
    }

    if (!Array.isArray(images) || images.length === 0 || !images[0]) {
      return NextResponse.json({ error: "At least one product image URL is required." }, { status: 400 });
    }

    const productSizes = Array.isArray(sizes) && sizes.length > 0
      ? sizes
      : ["XS", "S", "M", "L", "XL"];

    const slug = (customId && String(customId).trim())
      ? String(customId).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);

    const admin = getInsforgeAdmin();
    const { data: created, error: insertErr } = await admin.database
      .from("products")
      .insert([
        {
          id: slug,
          name: name.trim(),
          category,
          subcategory: subcategory.trim().toLowerCase(),
          price: numPrice,
          compare_at_price: numCompare,
          description: String(description || "").trim(),
          sizes: productSizes,
          images: images.filter(Boolean),
          featured: Boolean(featured),
          is_new: Boolean(is_new),
          trending: Boolean(trending),
        },
      ])
      .select("*")
      .single();

    if (insertErr || !created) {
      return NextResponse.json({ error: insertErr?.message || "Failed to create product" }, { status: 500 });
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/women");
      revalidatePath("/men");
      revalidatePath("/search");
    } catch {}

    return NextResponse.json({ product: created });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || "Internal server error" }, { status: 500 });
  }
}

