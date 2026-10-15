"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";
import { insforge, getClientAuthToken } from "@/lib/insforge";
import { useCart } from "@/lib/store";
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
  required = true,
}: {
  name: string;
  label: string;
  errors: Errors;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className={`field ${errors[name] ? "has-error" : ""}`}>
      <label htmlFor={name}>
        {label} {required && <span style={{ color: "#e11d48", fontWeight: 700 }} title="Required field">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-required={required}
        aria-invalid={!!errors[name]}
      />
      {errors[name] && <span className="field__error">{errors[name]}</span>}
    </div>
  );
}

export default function CheckoutForm() {
  const router = useRouter();
  const { items, hydrated } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
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
    if (submitting) return; // Prevent duplicate submissions

    setSubmitError(null);

    // Validate all required fields
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

    setSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          id: i.id,
          size: i.size,
          qty: i.qty,
        })),
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
      };

      // If user is authenticated, attach token to associate order with account;
      // otherwise, proceed smoothly with Guest Checkout.
      const token = getClientAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token && user) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to create order");
      }

      // Redirect immediately to payment interstitial for Stripe checkout
      router.push(`/payment/${result.orderId}`);
    } catch (err: unknown) {
      setSubmitError((err as Error).message || "Checkout failed. Please try again.");
      setSubmitting(false);
    }
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
        <h1 className="h1" style={{ margin: 0 }}>Checkout</h1>
        <span className="micro" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "#e11d48", fontWeight: 700 }}>*</span> Required fields
        </span>
      </div>

      {!user ? (
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
          <span>
            Checking out as a <strong>Guest</strong>. Have an account? Sign in to save this order to your profile.
          </span>
          <Link href="/login?redirect=/checkout" className="link-underline" style={{ fontWeight: 600 }}>
            Sign In &rarr;
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-alt)",
            border: "1px solid var(--line)",
            padding: "0.75rem 1.25rem",
            marginBottom: "1.5rem",
            fontSize: "13px",
            color: "var(--ink-soft)",
          }}
        >
          Signed in as <strong>{user.email}</strong>. This order will be saved to your account.
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
            <legend className="h3">Contact Details</legend>
            <Field name="name" label="Full name" errors={errors} autoComplete="name" placeholder="e.g. Jane Doe" />
            <div className="field-row">
              <Field
                name="email"
                label="Email address"
                type="email"
                errors={errors}
                defaultValue={user?.email || ""}
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
              />
              <Field
                name="phone"
                label="Phone number"
                type="tel"
                errors={errors}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="h3">Shipping Address</legend>
            <Field name="address" label="Street address" errors={errors} autoComplete="street-address" placeholder="123 Fashion Blvd, Apt 4B" />
            <div className="field-row">
              <Field name="city" label="City" errors={errors} autoComplete="address-level2" placeholder="New York" />
              <Field name="zip" label="ZIP / Postcode" errors={errors} autoComplete="postal-code" placeholder="10001" />
            </div>
            <Field name="country" label="Country" errors={errors} autoComplete="country-name" placeholder="United States" />
          </fieldset>

          <fieldset>
            <legend className="h3">Payment Method</legend>
            <div
              style={{
                background: "var(--bg-alt)",
                border: "1px solid var(--line)",
                padding: "1.25rem",
                borderRadius: "2px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>Stripe Secure Checkout</span>
                <span className="micro" style={{ letterSpacing: "0.05em", color: "var(--ink-soft)" }}>CARD / APPLE PAY / GOOGLE PAY</span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ink-soft)", lineHeight: 1.5 }}>
                You will be redirected to Stripe to securely enter your card details and finalize your payment. No account required.
              </p>
            </div>
          </fieldset>

          <button type="submit" className="btn btn--dark btn--block" disabled={submitting}>
            {submitting ? "Creating Order…" : "Place Order & Pay with Stripe"}
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
