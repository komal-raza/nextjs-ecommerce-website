"use client";

import { useState } from "react";
import type { Product } from "@/lib/data";
import { useCart } from "@/lib/store";
import { MinusIcon, PlusIcon } from "./Icons";
import { useToast } from "./Toast";

/** Size selector + quantity stepper + Add to Cart. Size is required. */
export default function ProductPurchase({ product }: { product: Product }) {
  const { add } = useCart();
  const toast = useToast();
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);

  const addToCart = () => {
    if (!size) {
      setError(true);
      return;
    }
    add({ id: product.id, name: product.name, price: product.price, image: product.images[0], size }, qty);
    toast(`${product.name} (${size}) added to your cart`);
    setQty(1);
  };

  return (
    <div className="purchase">
      <div className="purchase__row">
        <span className="micro">Size</span>
        {error && !size && <span className="purchase__error" role="alert">Please select a size</span>}
      </div>
      <div className="sizes" role="radiogroup" aria-label="Size">
        {product.sizes.map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={size === s}
            className={`size ${size === s ? "is-active" : ""}`}
            onClick={() => {
              setSize(s);
              setError(false);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="purchase__row">
        <span className="micro">Quantity</span>
      </div>
      <div className="stepper">
        <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}><MinusIcon /></button>
        <span aria-live="polite">{qty}</span>
        <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))}><PlusIcon /></button>
      </div>

      <button className="btn btn--dark btn--block" onClick={addToCart}>Add to Cart</button>
      <p className="purchase__note">Free shipping over $75 · Free returns within 30 days</p>
    </div>
  );
}

