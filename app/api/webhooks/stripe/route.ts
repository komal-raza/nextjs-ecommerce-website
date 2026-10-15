import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getInsforgeAdmin } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return new NextResponse("Webhook secret unconfigured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  let rawBody: string;

  try {
    rawBody = await req.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id || session.client_reference_id;

    if (!orderId) {
      console.warn("Webhook checkout.session has no order_id metadata or client_reference_id");
      return NextResponse.json({ received: true });
    }

    try {
      const admin = getInsforgeAdmin();
      const { data: order, error: orderErr } = await admin.database
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderErr || !order) {
        console.error(`Order ${orderId} not found for webhook session ${session.id}`);
        return NextResponse.json({ received: true });
      }

      // Verify payment status, amount, currency
      if (session.payment_status === "paid") {
        const expectedCents = Math.round(Number(order.total) * 100);
        if (session.amount_total && session.amount_total !== expectedCents) {
          console.error(
            `Amount mismatch for order ${orderId}: expected ${expectedCents}, got ${session.amount_total}`
          );
          return NextResponse.json({ received: true });
        }

        // Idempotency: only transition status if still pending, otherwise preserve existing shipped/delivered state
        const nextStatus = order.status === "pending" ? "confirmed" : order.status;

        await admin.database
          .from("orders")
          .update({
            payment_status: "paid",
            status: nextStatus,
            payment_method: "stripe",
          })
          .eq("id", order.id);

        if (order.user_id) {
          await admin.database.from("carts").delete().eq("user_id", order.user_id);
        }
      }
    } catch (dbErr) {
      console.error("Failed processing order in webhook:", dbErr);
      // Return 500 so Stripe can retry if database was temporarily unreachable
      return new NextResponse("Database update failed", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

