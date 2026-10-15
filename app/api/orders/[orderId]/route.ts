import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { getInsforgeAdmin } from "@/lib/insforge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const admin = getInsforgeAdmin();
    const { data: order, error: orderErr } = await admin.database
      .from("orders")
      .select("id, user_id, items, subtotal, shipping, total, status, payment_status, payment_method, contact, shipping_address, created_at")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order has an assigned user_id, verify that the requester is the owner
    if (order.user_id) {
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();

      if (!token) {
        return NextResponse.json(
          { error: "This order is attached to an account. Please sign in to view." },
          { status: 401 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
      const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";
      const userClient = createClient({
        baseUrl,
        anonKey,
        accessToken: token,
      });

      const { data: userData, error: userErr } = await userClient.auth.getCurrentUser();
      if (userErr || !userData?.user || userData.user.id !== order.user_id) {
        return NextResponse.json(
          { error: "Unauthorized: You do not own this order" },
          { status: 403 }
        );
      }
    }

    // For guest orders (order.user_id is null) or verified owners, return sanitized order data
    return NextResponse.json({
      id: order.id,
      user_id: order.user_id,
      items: order.items,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      status: order.status,
      payment_status: order.payment_status || "unpaid",
      payment_method: order.payment_method || "stripe",
      contact: order.contact,
      shipping_address: order.shipping_address,
      created_at: order.created_at,
      isGuest: !order.user_id,
    });
  } catch (err: unknown) {
    console.error("Fetch order error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

