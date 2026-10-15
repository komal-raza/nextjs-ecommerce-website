import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getInsforgeAdmin } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Checkout session not found" }, { status: 404 });
    }

    const orderId = session.metadata?.order_id || session.client_reference_id;
    if (!orderId) {
      return NextResponse.json(
        { error: "No order reference attached to this checkout session" },
        { status: 400 }
      );
    }

    const admin = getInsforgeAdmin();
    const { data: order, error: orderErr } = await admin.database
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found in records" }, { status: 404 });
    }

    // Verify session belongs to expected order
    if (session.client_reference_id && session.client_reference_id !== order.id) {
      return NextResponse.json(
        { error: "Session does not match the referenced order" },
        { status: 400 }
      );
    }

    // Verify payment status
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          payment_status: session.payment_status,
          status: session.status,
          orderId: order.id,
          error: "Payment has not been completed.",
        },
        { status: 400 }
      );
    }

    // Verify amount and currency
    const expectedCents = Math.round(Number(order.total) * 100);
    if (session.amount_total !== expectedCents) {
      return NextResponse.json(
        { error: "Payment amount does not match stored order total." },
        { status: 400 }
      );
    }
    if (session.currency?.toLowerCase() !== "usd") {
      return NextResponse.json(
        { error: "Payment currency mismatch." },
        { status: 400 }
      );
    }

    // Idempotent order update:
    // If order is already marked paid, avoid regressing any higher-level statuses (shipped, delivered)
    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        total: Number(order.total),
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method || "stripe",
        isGuest: !order.user_id,
      });
    }

    // Update order to paid & confirmed
    const nextStatus = order.status === "pending" ? "confirmed" : order.status;
    const { data: updatedOrder, error: updateErr } = await admin.database
      .from("orders")
      .update({
        payment_status: "paid",
        status: nextStatus,
        payment_method: "stripe",
      })
      .eq("id", order.id)
      .select("id, user_id, status, payment_status, payment_method, total")
      .single();

    if (updateErr) {
      console.error("Failed to update order status:", updateErr);
      return NextResponse.json(
        { error: updateErr.message || "Failed to update order state" },
        { status: 500 }
      );
    }

    // Clear server-side cart for the user if user_id is present
    if (order.user_id) {
      await admin.database.from("carts").delete().eq("user_id", order.user_id);
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      total: Number(updatedOrder.total),
      status: updatedOrder.status,
      payment_status: updatedOrder.payment_status,
      payment_method: updatedOrder.payment_method,
      isGuest: !updatedOrder.user_id,
    });
  } catch (err: unknown) {
    console.error("Payment confirmation error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to confirm payment" },
      { status: 500 }
    );
  }
}

