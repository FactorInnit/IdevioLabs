import Stripe from "stripe";
import { getSiteUrl } from "@/lib/site";
import { type PlanId } from "@/lib/plans";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function getAppUrl(): string {
  return getSiteUrl();
}

export function getStripePriceId(planId: PlanId): string | null {
  if (planId === "pro") return process.env.STRIPE_PRICE_PRO ?? null;
  if (planId === "ultra") return process.env.STRIPE_PRICE_ULTRA ?? null;
  return null;
}

export function planFromStripePrice(priceId: string): PlanId | null {
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ULTRA) return "ultra";
  return null;
}
