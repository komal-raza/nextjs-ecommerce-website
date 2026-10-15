"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { money, shippingFor } from "@/lib/format";
import { insforge } from "@/lib/insforge";
import { useCart } from "@/lib/store";
import { CheckIcon } from "./Icons";
import { OrderSummary } from "./CartView";

type Errors = Record<string, string>;

const REQUIRED: Record<string, string> = {
  name: "Full name is required",
  email: "A valid email is required",
  phone: "Phone number is required",
  address: "Address is required",
  city: "City is required",
  zip: "ZIP / postcode is required",
  country: "Country is required",
};

function Field({
  name,
  label,
  errors,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  defaultValue,
}: {
  name: string;
  label: string;
  errors: Errors;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  defaultValue?: string;
}) {
  return (
    <div className={`field ${errors[name] ? "has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={!!errors[name]}
      />
      {errors[name] && <span className="field__error">{errors[name]}</span>}
    </div>
  );
}

export default function CheckoutForm() {
  const router = useRouter();
  const { items, hydrated, subtotal, clear } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [order, setOrder] = useState<{ id: string; status: string; total: number } | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate fields
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    for (const [key, msg] of Object.entries(REQUIRED)) {
      if (!String(data.get(key) ?? "").trim()) next[key] = msg;
    }
    const email = String(data.get("email") ?? "").trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      next.email = "A valid email is required";
    }

    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }

    // Require authentication so order is properly associated with the account
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setSubmitting(true);

    try {
      let receiptUrl: string | null = null;

      // 1. Upload payment receipt to payment-uploads bucket if provided
      if (receiptFile) {
        const ext = receiptFile.name.split(".").pop() || "bin";
        const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { data: uploadData, error: uploadErr } = await insforge.storage
          .from("payment-uploads")
          .upload(filename, receiptFile);

        if (uploadErr) {
          console.warn("Receipt upload notice:", uploadErr.message);
        }
        receiptUrl = uploadData?.url || filename;
      }

      // 2. Insert order row into orders table
      const shipping = shippingFor(subtotal);
      const total = subtotal + shipping;

      const orderPayload = {
        user_id: user.id,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          size: i.size,
          qty: i.qty,
          price: i.price,
        })),
        subtotal,
        shipping,
        total,
        status: "pending",
        contact: {
          name: String(data.get("name") ?? "").trim(),
          email,
          phone: String(data.get("phone") ?? "").trim(),
        },
        shipping_address: {
          address: String(data.get("address") ?? "").trim(),
          city: String(data.get("city") ?? "").trim(),
          zip: String(data.get("zip") ?? "").trim(),
          country: String(data.get("country") ?? "").trim(),
        },
        payment_receipt_url: receiptUrl,
      };

      const { data: createdOrder, error: orderErr } = await insforge.database
        .from("orders")
        .insert([orderPayload])
        .select("id, status, total")
        .single();

      if (orderErr || !createdOrder) {
        throw new Error(orderErr?.message || "Failed to create order");
      }

      clear();
      setOrder({
        id: createdOrder.id,
        status: createdOrder.status || "pending",
        total: Number(createdOrder.total),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setSubmitError((err as Error).message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="container empty-state confirm">
        <span className="confirm__tick"><CheckIcon size={28} /></span>
        <p className="micro">Order confirmed · Status: {order.status}</p>
        <h1 className="h1">Thank you for your order</h1>
        <p>Your order ID is <strong style={{ fontFamily: "monospace" }}>{order.id}</strong>.</p>
        <p>Total charged: {money(order.total)}. Status is currently <strong>{order.status}</strong>.</p>
        <div className="empty-state__cta" style={{ marginTop: "2rem" }}>
          <Link href="/profile" className="btn btn--dark">View in Profile</Link>
          <Link href="/" className="btn btn--outline">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="container cart-page">
        <p className="micro">Loading…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <h1 className="h1">Nothing to check out</h1>
        <p>Your cart is empty.</p>
        <div className="empty-state__cta">
          <Link href="/women" className="btn btn--dark">Shop Women</Link>
          <Link href="/men" className="btn btn--outline">Shop Men</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="h1">Checkout</h1>

      {!user && (
        <div
          style={{
            background: "var(--bg-alt)",
            border: "1px solid var(--line)",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span>Already have an account? Sign in for saved details and order tracking.</span>
          <Link href="/login?redirect=/checkout" className="link-underline" style={{ fontWeight: 600 }}>
            Sign In &rarr;
          </Link>
        </div>
      )}

      {submitError && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            fontSize: "13px",
            color: "#b91c1c",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
          }}
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="cart-layout">
        <form ref={formRef} className="checkout-form" onSubmit={submit} noValidate>
          <fieldset>
            <legend className="h3">Contact</legend>
            <Field name="name" label="Full name" errors={errors} autoComplete="name" />
            <div className="field-row">
              <Field
                name="email"
                label="Email"
                type="email"
                errors={errors}
                defaultValue={user?.email || ""}
                autoComplete="email"
                inputMode="email"
              />
              <Field name="phone" label="Phone" type="tel" errors={errors} autoComplete="tel" inputMode="tel" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="h3">Shipping</legend>
            <Field name="address" label="Address" errors={errors} autoComplete="street-address" />
            <div className="field-row">
              <Field name="city" label="City" errors={errors} autoComplete="address-level2" />
              <Field name="zip" label="ZIP / Postcode" errors={errors} autoComplete="postal-code" />
            </div>
            <Field name="country" label="Country" errors={errors} autoComplete="country-name" />
          </fieldset>

          <fieldset>
            <legend className="h3">Payment Receipt</legend>
            <p className="dummy-note" style={{ marginBottom: "1rem" }}>
              Upload your payment receipt (image or PDF) to verify your transaction.
            </p>
            <div className="field">
              <label htmlFor="receipt">Receipt document (optional)</label>
              <input
                id="receipt"
                name="receipt"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                disabled={submitting}
              />
              {receiptFile && (
                <span className="micro" style={{ marginTop: "0.3rem", color: "var(--ink-soft)" }}>
                  Selected: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          </fieldset>

          <button type="submit" className="btn btn--dark btn--block" disabled={submitting}>
            {submitting ? "Processing Order…" : "Place Order"}
          </button>
        </form>

        <OrderSummary>
          <ul className="mini-items">
            {items.map((i) => (
              <li key={i.key}>
                <span>{i.name} · {i.size} × {i.qty}</span>
                <span>{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
        </OrderSummary>
      </div>
    </div>
  );
}
