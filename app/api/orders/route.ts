import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { shippingFor } from "@/lib/format";
import { getInsforgeAdmin } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    let userEmail: string | null = null;

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (token) {
      const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
      const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";

      try {
        const userClient = createClient({
          baseUrl,
          anonKey,
          accessToken: token,
        });
        const { data: userData } = await userClient.auth.getCurrentUser();
        if (userData?.user) {
          userId = userData.user.id;
          userEmail = userData.user.email || null;
        }
      } catch {
        // Fall back to guest checkout if token validation encounters issues
      }
    }

    const body = await req.json();
    const { items, contact, shipping_address } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Validate required contact and shipping details
    const name = String(contact?.name || "").trim();
    const email = String(contact?.email || userEmail || "").trim();
    const phone = String(contact?.phone || "").trim();
    const address = String(shipping_address?.address || "").trim();
    const city = String(shipping_address?.city || "").trim();
    const zip = String(shipping_address?.zip || "").trim();
    const country = String(shipping_address?.country || "").trim();

    if (!name || !email || !phone || !address || !city || !zip || !country) {
      return NextResponse.json(
        { error: "All contact and shipping fields are required to place an order." },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // 1. Fetch real prices from database to ensure trusted totals
    const productIds = Array.from(new Set(items.map((i: { id: string }) => i.id)));
    const admin = getInsforgeAdmin();
    const { data: dbProducts, error: prodErr } = await admin.database
      .from("products")
      .select("id, name, price")
      .in("id", productIds);

    if (prodErr || !dbProducts) {
      return NextResponse.json(
        { error: prodErr?.message || "Failed to load product pricing" },
        { status: 500 }
      );
    }

    const productMap = new Map<string, { id: string; name: string; price: number }>();
    for (const p of dbProducts) {
      productMap.set(p.id, { id: p.id, name: p.name, price: Number(p.price) });
    }

    // 2. Validate and build verified item snapshots
    const verifiedItems = [];
    for (const item of items) {
      const dbProduct = productMap.get(item.id);
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product "${item.id}" not found in catalog` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
      verifiedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        size: String(item.size || "M"),
        qty,
        price: dbProduct.price,
      });
    }

    const subtotal = verifiedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shipping = shippingFor(subtotal);
    const total = subtotal + shipping;

    // 3. Create order with pending status, unpaid payment_status, stripe payment_method
    // user_id will be the authenticated user id or null for guest checkout
    const orderPayload = {
      user_id: userId,
      items: verifiedItems,
      subtotal,
      shipping,
      total,
      status: "pending",
      payment_status: "unpaid",
      payment_method: "stripe",
      contact: {
        name,
        email,
        phone,
      },
      shipping_address: {
        address,
        city,
        zip,
        country,
      },
    };

    const { data: createdOrder, error: orderErr } = await admin.database
      .from("orders")
      .insert([orderPayload])
      .select("id, status, payment_status, total")
      .single();

    if (orderErr || !createdOrder) {
      return NextResponse.json(
        { error: orderErr?.message || "Failed to save order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: createdOrder.id,
      status: createdOrder.status,
      payment_status: createdOrder.payment_status,
      total: createdOrder.total,
      isGuest: !userId,
    });
  } catch (err: unknown) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
