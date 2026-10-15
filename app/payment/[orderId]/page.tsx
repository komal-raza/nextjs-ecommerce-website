"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { money } from "@/lib/format";
import { getClientAuthToken } from "@/lib/insforge";

interface OrderData {
  id: string;
  user_id: string | null;
  items: Array<{ name: string; size: string; qty: number; price: number }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_status?: string;
  payment_method?: string;
  isGuest?: boolean;
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const token = getClientAuthToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`/api/orders/${orderId}`, { headers });
        const data = await res.json();

        if (!isMounted) return;

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.replace(`/login?redirect=/payment/${orderId}`);
            return;
          }
          setError(data.error || "Order not found or access denied.");
          setLoading(false);
          return;
        }

        setOrder(data);
        setLoading(false);
      } catch (err: unknown) {
        if (isMounted) {
          setError((err as Error).message || "Failed to load order.");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [orderId, router]);

  const handlePay = async () => {
    if (!order) return;
    setProcessing(true);
    setError(null);

    try {
      const token = getClientAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers,
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize Stripe checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Invalid session URL received from server");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Checkout failed. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="container page-head" style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        <p className="micro">Loading payment details…</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="container empty-state" style={{ minHeight: "50vh" }}>
        <h1 className="h1">Payment Notice</h1>
        <p style={{ color: "#b91c1c" }}>{error || "Order not found."}</p>
        <div className="empty-state__cta" style={{ marginTop: "1.5rem" }}>
          <Link href="/cart" className="btn btn--dark">Return to Cart</Link>
          <Link href="/" className="btn btn--outline">Back to Home</Link>
        </div>
      </main>
    );
  }

  const isPaid = order.payment_status === "paid";

  if (isPaid) {
    return (
      <main className="container empty-state confirm" style={{ minHeight: "50vh" }}>
        <p className="micro">Payment Completed</p>
        <h1 className="h1">This order is already paid</h1>
        <p>Order ID: <strong style={{ fontFamily: "monospace" }}>{order.id}</strong></p>
        <p>Total: <strong>{money(Number(order.total))}</strong></p>
        <div className="empty-state__cta" style={{ marginTop: "2rem" }}>
          {order.user_id ? (
            <Link href="/profile" className="btn btn--dark">View in Account</Link>
          ) : (
            <Link href="/" className="btn btn--dark">Back to Store</Link>
          )}
          <Link href="/" className="btn btn--outline">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingBlock: "clamp(2rem, 5vw, 3.5rem)", maxWidth: "680px", marginInline: "auto" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <p className="micro" style={{ letterSpacing: "0.15em" }}>SECURE CHECKOUT</p>
        <h1 className="h1" style={{ marginBlock: "0.25rem 0.5rem" }}>Complete Payment</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: "14px" }}>
          Order <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{order.id}</span>
          {order.isGuest && <span style={{ marginLeft: "0.5rem", color: "var(--stone)" }}>· Guest Checkout</span>}
        </p>
      </header>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--line)",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          display: "grid",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "1.2rem",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div>
            <span className="micro" style={{ color: "var(--stone)" }}>Payment Status</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#f59e0b",
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600, textTransform: "capitalize" }}>
                {order.payment_status || "Unpaid"}
              </span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span className="micro" style={{ color: "var(--stone)" }}>Total Amount</span>
            <p style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
              {money(Number(order.total))}
            </p>
          </div>
        </div>

        <div>
          <span className="micro" style={{ color: "var(--stone)", display: "block", marginBottom: "0.75rem" }}>
            Order Items
          </span>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
            {(order.items || []).map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  paddingBlock: "0.3rem",
                  borderBottom: "1px dashed var(--line)",
                }}
              >
                <span>
                  {item.name} · Size {item.size} × {item.qty}
                </span>
                <span>{money(Number(item.price) * item.qty)}</span>
              </li>
            ))}
            {Number(order.shipping) > 0 && (
              <li
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  paddingBlock: "0.3rem",
                  color: "var(--ink-soft)",
                }}
              >
                <span>Standard Shipping</span>
                <span>{money(Number(order.shipping))}</span>
              </li>
            )}
          </ul>
        </div>

        <div
          style={{
            background: "var(--bg-alt)",
            padding: "1rem 1.25rem",
            border: "1px solid var(--line)",
            fontSize: "13px",
            lineHeight: 1.5,
            color: "var(--ink-soft)",
          }}
        >
          You will be redirected to Stripe to enter your payment details securely. Once completed, your order will be confirmed immediately.
        </div>

        <button
          onClick={handlePay}
          disabled={processing}
          className="btn btn--dark btn--block"
          style={{ padding: "0.9rem" }}
        >
          {processing ? "Connecting to Stripe…" : `Pay ${money(Number(order.total))} with Stripe`}
        </button>

        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          {order.user_id ? (
            <Link href="/profile" className="link-underline" style={{ fontSize: "12px", color: "var(--ink-soft)" }}>
              Return to my account
            </Link>
          ) : (
            <Link href="/" className="link-underline" style={{ fontSize: "12px", color: "var(--ink-soft)" }}>
              Return to store
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
