import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin";
import { getInsforgeAdmin } from "@/lib/insforge";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await verifyAdmin(req);
  if (error) {
    return NextResponse.json({ error }, { status: status || 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (!String(body.name).trim()) {
        return NextResponse.json({ error: "Product name cannot be empty." }, { status: 400 });
      }
      updateData.name = String(body.name).trim();
    }

    if (body.category !== undefined) {
      if (body.category !== "women" && body.category !== "men") {
        return NextResponse.json({ error: "Category must be 'women' or 'men'." }, { status: 400 });
      }
      updateData.category = body.category;
    }

    if (body.subcategory !== undefined) {
      if (!String(body.subcategory).trim()) {
        return NextResponse.json({ error: "Subcategory cannot be empty." }, { status: 400 });
      }
      updateData.subcategory = String(body.subcategory).trim().toLowerCase();
    }

    if (body.price !== undefined) {
      const p = Number(body.price);
      if (isNaN(p) || p <= 0) {
        return NextResponse.json({ error: "Price must be a positive number greater than 0." }, { status: 400 });
      }
      updateData.price = p;
    }

    if (body.compare_at_price !== undefined) {
      if (body.compare_at_price === null || body.compare_at_price === "") {
        updateData.compare_at_price = null;
      } else {
        const c = Number(body.compare_at_price);
        if (isNaN(c) || c < 0) {
          return NextResponse.json({ error: "Compare at price must be a valid number." }, { status: 400 });
        }
        updateData.compare_at_price = c;
      }
    }

    if (body.description !== undefined) {
      updateData.description = String(body.description).trim();
    }

    if (body.sizes !== undefined) {
      if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
        return NextResponse.json({ error: "At least one size is required." }, { status: 400 });
      }
      updateData.sizes = body.sizes;
    }

    if (body.images !== undefined) {
      if (!Array.isArray(body.images) || body.images.length === 0 || !body.images[0]) {
        return NextResponse.json({ error: "At least one product image is required." }, { status: 400 });
      }
      updateData.images = body.images.filter(Boolean);
    }

    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.is_new !== undefined) updateData.is_new = Boolean(body.is_new);
    if (body.trending !== undefined) updateData.trending = Boolean(body.trending);

    const admin = getInsforgeAdmin();
    const { data: updated, error: updateErr } = await admin.database
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath(`/product/${id}`, "page");
      revalidatePath("/women");
      revalidatePath("/men");
      revalidatePath("/search");
    } catch {}

    return NextResponse.json({ product: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await verifyAdmin(req);
  if (error) {
    return NextResponse.json({ error }, { status: status || 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const admin = getInsforgeAdmin();
    const { error: delErr } = await admin.database
      .from("products")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath(`/product/${id}`, "page");
      revalidatePath("/women");
      revalidatePath("/men");
      revalidatePath("/search");
    } catch {}

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || "Internal server error" }, { status: 500 });
  }
}

