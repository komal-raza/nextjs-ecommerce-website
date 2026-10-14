const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Formats a number as USD, e.g. 1234 → "$1,234.00". */
export function money(n: number): string {
  return fmt.format(n);
}

export const FREE_SHIPPING_THRESHOLD = 75;
export const FLAT_SHIPPING = 8;

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

