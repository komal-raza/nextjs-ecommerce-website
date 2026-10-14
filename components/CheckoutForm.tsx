"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { money, shippingFor } from "@/lib/format";
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
  card: "Enter a card number",
  expiry: "Enter an expiry date",
  cvc: "Enter the CVC",
};

function Field({ name, label, errors, type = "text", placeholder, autoComplete, inputMode }: {
  name: string; label: string; errors: Errors; type?: string; placeholder?: string; autoComplete?: string; inputMode?: "numeric" | "tel" | "email" | "text";
}) {
  return (
    <div className={`field ${errors[name] ? "has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} aria-invalid={!!errors[name]} />
      {errors[name] && <span className="field__error">{errors[name]}</span>}
    </div>
  );
}

export default function CheckoutForm() {
  const { items, hydrated, subtotal, clear } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [order, setOrder] = useState<{ number: string; total: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    for (const [key, msg] of Object.entries(REQUIRED)) {
      if (!String(data.get(key) ?? "").trim()) next[key] = msg;
    }
    const email = String(data.get("email") ?? "");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) next.email = "A valid email is required";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const total = subtotal + shippingFor(subtotal);
    const number = `VL-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    clear();
    setOrder({ number, total });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (order) {
    return (
      <div className="container empty-state confirm">
        <span className="confirm__tick"><CheckIcon size={28} /></span>
        <p className="micro">Order confirmed</p>
        <h1 className="h1">Thank you for your order</h1>
        <p>Your order number is <strong>{order.number}</strong>.</p>
        <p>Total charged (demo): {money(order.total)}. A confirmation would be emailed to you.</p>
        <div className="empty-state__cta">
          <Link href="/" className="btn btn--dark">Back to home</Link>
          <Link href="/women" className="btn btn--outline">Keep shopping</Link>
        </div>
      </div>
    );
  }

  if (!hydrated) return <div className="container cart-page"><p className="micro">Loading…</p></div>;

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <h1 className="h1">Nothing to check out</h1>
        <p>Your cart is empty.</p>
        <div className="empty-state__cta"><Link href="/women" className="btn btn--dark">Shop Women</Link><Link href="/men" className="btn btn--outline">Shop Men</Link></div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="h1">Checkout</h1>
      <div className="cart-layout">
        <form ref={formRef} className="checkout-form" onSubmit={submit} noValidate>
          <fieldset>
            <legend className="h3">Contact</legend>
            <Field name="name" label="Full name" errors={errors} autoComplete="name" />
            <div className="field-row">
              <Field name="email" label="Email" type="email" errors={errors} autoComplete="email" inputMode="email" />
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
            <legend className="h3">Payment</legend>
            <p className="dummy-note">Demo only — do not enter real card details. Nothing is stored or charged.</p>
            <Field name="card" label="Card number (dummy)" errors={errors} placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="off" />
            <div className="field-row">
              <Field name="expiry" label="Expiry" errors={errors} placeholder="MM / YY" autoComplete="off" />
              <Field name="cvc" label="CVC" errors={errors} placeholder="123" inputMode="numeric" autoComplete="off" />
            </div>
          </fieldset>

          <button type="submit" className="btn btn--dark btn--block">Place Order</button>
        </form>

        <OrderSummary>
          <ul className="mini-items">
            {items.map((i) => (
              <li key={i.key}><span>{i.name} · {i.size} × {i.qty}</span><span>{money(i.price * i.qty)}</span></li>
            ))}
          </ul>
        </OrderSummary>
      </div>
    </div>
  );
}

