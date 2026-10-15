import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecretKey) {
  if (process.env.NODE_ENV === "development") {
    console.warn("Missing STRIPE_SECRET_KEY in environment variables.");
  }
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : (null as unknown as Stripe);

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables."
    );
  }
  return stripe;
}

