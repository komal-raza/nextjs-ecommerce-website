"use client";

import Link from "next/link";
import { FLAT_SHIPPING, FREE_SHIPPING_THRESHOLD, money, shippingFor } from "@/lib/format";
import { useCart } from "@/lib/store";
import { CloseIcon, MinusIcon, PlusIcon } from "./Icons";
import SafeImage from "./SafeImage";

/** Order summary — shared by the cart and checkout pages. */
export function OrderSummary({ children }: { children?: React.ReactNode }) {
  const { subtotal } = useCart();
  const shipping = shippingFor(subtotal);
  return (
    <aside className="summary">
      <h2 className="h3">Order summary</h2>
      <dl>
        <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
        <div><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : money(shipping)}</dd></div>
        {shipping > 0 && (
          <p className="summary__hint">Add {money(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping (otherwise {money(FLAT_SHIPPING)}).</p>
        )}
        <div className="summary__total"><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div>
      </dl>
      {children}
    </aside>
  );
}

export default function CartView() {
  const { items, hydrated, updateQty, remove } = useCart();

  if (!hydrated) return <div className="container cart-page"><p className="micro">Loading your cart…</p></div>;

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <p className="micro">Your cart</p>
        <h1 className="h1">Your cart is empty</h1>
        <p>Discover pieces made to be lived in.</p>
        <div className="empty-state__cta">
          <Link href="/women" className="btn btn--dark">Shop Women</Link>
          <Link href="/men" className="btn btn--outline">Shop Men</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="h1">Shopping Cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((it) => (
            <li key={it.key} className="cart-item">
              <Link href={`/product/${it.id}`} className="cart-item__img">
                <SafeImage src={it.image} alt={it.name} sizes="120px" />
              </Link>
              <div className="cart-item__info">
                <Link href={`/product/${it.id}`} className="cart-item__name">{it.name}</Link>
                <p className="micro">Size {it.size}</p>
                <p>{money(it.price)}</p>
                <div className="stepper stepper--sm">
                  <button aria-label="Decrease quantity" onClick={() => updateQty(it.key, it.qty - 1)}><MinusIcon size={14} /></button>
                  <span>{it.qty}</span>
                  <button aria-label="Increase quantity" onClick={() => updateQty(it.key, it.qty + 1)}><PlusIcon size={14} /></button>
                </div>
              </div>
              <div className="cart-item__end">
                <strong>{money(it.price * it.qty)}</strong>
                <button className="icon-btn" aria-label={`Remove ${it.name}`} onClick={() => remove(it.key)}><CloseIcon size={18} /></button>
              </div>
            </li>
          ))}
        </ul>
        <OrderSummary>
          <Link href="/checkout" className="btn btn--dark btn--block">Proceed to Checkout</Link>
          <Link href="/women" className="link-underline summary__continue">Continue shopping</Link>
        </OrderSummary>
      </div>
    </div>
  );
}
