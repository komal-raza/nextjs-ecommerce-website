import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { getStripe } from "@/lib/stripe";
import { getInsforgeAdmin } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    let authUser: { id: string; email?: string } | null = null;
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
          authUser = userData.user;
        }
      } catch {
        // Continue as unauthenticated if token check fails
      }
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Verify Stripe configuration
    let stripe;
    try {
      stripe = getStripe();
    } catch {
      const isDev = process.env.NODE_ENV === "development";
      return NextResponse.json(
        {
          error: isDev
            ? "Stripe is not configured. Missing STRIPE_SECRET_KEY."
            : "Payment processing is currently unavailable. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Fetch order and verify authorization
    const admin = getInsforgeAdmin();
    const { data: order, error: orderErr } = await admin.database
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order has an assigned account user_id, ensure the logged-in user matches
    if (order.user_id) {
      if (!authUser || authUser.id !== order.user_id) {
        return NextResponse.json(
          { error: "Unauthorized: Please sign in to the account that owns this order." },
          { status: 403 }
        );
      }
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "This order has already been paid." },
        { status: 400 }
      );
    }

    // Build App URL for redirect callbacks
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      origin ||
      "http://localhost:3000";

    // Build Stripe Line Items
    const line_items = (order.items || []).map(
      (item: { name: string; size: string; price: number; qty: number }) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.name} (${item.size})`,
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.qty,
      })
    );

    if (Number(order.shipping) > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Standard Shipping",
          },
          unit_amount: Math.round(Number(order.shipping) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      customer_email: order.contact?.email || authUser?.email || undefined,
      metadata: {
        order_id: order.id,
        user_id: order.user_id || "guest",
      },
      line_items,
      success_url: `${appUrl}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/${order.id}`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    console.error("Stripe session error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
