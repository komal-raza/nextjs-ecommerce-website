"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { money } from "@/lib/format";
import { useCart } from "@/lib/store";
import { CheckIcon } from "@/components/Icons";

interface ConfirmResult {
  success: boolean;
  orderId?: string;
  total?: number;
  status?: string;
  payment_status?: string;
  isGuest?: boolean;
  error?: string;
}

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clear } = useCart();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ConfirmResult | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setResult({
        success: false,
        error: "Missing checkout session ID in return URL.",
      });
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function confirmSession() {
      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (!res.ok || !data.success) {
          setResult({
            success: false,
            orderId: data.orderId,
            error: data.error || "Payment verification failed or was not completed.",
          });
        } else {
          // Clear cart on confirmed payment
          clear();
          setResult(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setResult({
            success: false,
            error: (err as Error).message || "An unexpected error occurred verifying your payment.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    confirmSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId, clear]);

  if (loading) {
    return (
      <div className="container empty-state" style={{ minHeight: "55vh" }}>
        <p className="micro">Verifying transaction with Stripe…</p>
        <h1 className="h2" style={{ marginBlock: "0.5rem 1rem" }}>Confirming your payment</h1>
        <p style={{ color: "var(--ink-soft)" }}>Please wait while we finalize your order.</p>
      </div>
    );
  }

  if (!result?.success) {
    return (
      <div className="container empty-state" style={{ minHeight: "55vh" }}>
        <h1 className="h1" style={{ color: "#b91c1c" }}>Payment Incomplete</h1>
        <p style={{ color: "var(--ink-soft)", maxWidth: "480px", marginInline: "auto" }}>
          {result?.error || "We could not verify your payment. Your card has not been charged."}
        </p>
        <div className="empty-state__cta" style={{ marginTop: "2rem" }}>
          {result?.orderId ? (
            <Link href={`/payment/${result.orderId}`} className="btn btn--dark">
              Retry Payment
            </Link>
          ) : (
            <Link href="/cart" className="btn btn--dark">
              Return to Cart
            </Link>
          )}
          <Link href="/profile" className="btn btn--outline">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container empty-state confirm" style={{ minHeight: "60vh" }}>
      <span className="confirm__tick">
        <CheckIcon size={28} />
      </span>
      <p className="micro" style={{ letterSpacing: "0.15em", color: "#16a34a", fontWeight: 600 }}>
        PAYMENT CONFIRMED · STRIPE
      </p>
      <h1 className="h1" style={{ marginBlock: "0.4rem 0.6rem" }}>
        Thank you for your order
      </h1>
      <p style={{ fontSize: "15px" }}>
        Your order ID is <strong style={{ fontFamily: "monospace" }}>{result.orderId}</strong>.
      </p>
      <p style={{ color: "var(--ink-soft)", fontSize: "14px" }}>
        Total charged: <strong>{money(result.total ?? 0)}</strong> · Payment status: <strong style={{ color: "#16a34a" }}>Paid</strong>
      </p>
      <div className="empty-state__cta" style={{ marginTop: "2.5rem" }}>
        {result.isGuest ? (
          <>
            <Link href="/" className="btn btn--dark">
              Continue Shopping
            </Link>
            <Link href="/login" className="btn btn--outline">
              Create Account
            </Link>
          </>
        ) : (
          <>
            <Link href="/profile" className="btn btn--dark">
              View in Account
            </Link>
            <Link href="/" className="btn btn--outline">
              Continue Shopping
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <main style={{ paddingBlock: "clamp(2rem, 5vw, 4rem)" }}>
      <Suspense
        fallback={
          <div className="container empty-state" style={{ minHeight: "55vh" }}>
            <p className="micro">Loading payment status…</p>
          </div>
        }
      >
        <PaymentReturnContent />
      </Suspense>
    </main>
  );
}

