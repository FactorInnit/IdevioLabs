import type { PlanId } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getUserProjectCount } from "@/lib/plan-limits";
import { getPlan } from "@/lib/plans";
import { getStripe, planFromStripePrice } from "@/lib/stripe";

type CheckoutSession = {
  metadata?: { userId?: string; planId?: string } | null;
  client_reference_id?: string | null;
  customer?: string | null;
  subscription?: string | null;
  payment_status?: string | null;
  status?: string | null;
};

export async function applyCheckoutSessionToUser(session: CheckoutSession) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const planId = session.metadata?.planId as PlanId | undefined;

  if (!userId || !planId || (planId !== "pro" && planId !== "ultra")) {
    return null;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      plan: planId,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : undefined,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : undefined,
    },
  });

  const projectCount = await getUserProjectCount(user.id);
  const plan = getPlan(planId);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: planId,
    projectCount,
    maxStartups: plan.maxStartups,
    canCreateMore: projectCount < plan.maxStartups,
  };
}

export function isCheckoutSessionPaid(session: CheckoutSession): boolean {
  return session.payment_status === "paid" || session.status === "complete";
}

/** Reconcile plan from Stripe when webhook was delayed or missed. */
export async function syncUserPlanFromStripe(userId: string) {
  const stripe = getStripe();
  if (!stripe) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  let customerId = user.stripeCustomerId;
  let subscriptionId = user.stripeSubscriptionId;

  if (!customerId) {
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    customerId = customers.data[0]?.id ?? null;
  }

  if (!subscriptionId && customerId) {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    subscriptionId = subs.data[0]?.id ?? null;
  }

  if (!subscriptionId) return user;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.status === "active" || subscription.status === "trialing") {
    const priceId = subscription.items.data[0]?.price.id;
    const planId = priceId ? planFromStripePrice(priceId) : null;
    const resolvedCustomerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : customerId ?? user.stripeCustomerId;

    if (planId) {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          plan: planId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: resolvedCustomerId ?? undefined,
        },
      });
    }
  }

  return user;
}

export async function buildAuthUserPayload(userId: string) {
  const user = await syncUserPlanFromStripe(userId);
  if (!user) return null;

  const planId = (user.plan as PlanId) || "free";
  const projectCount = await getUserProjectCount(user.id);
  const plan = getPlan(planId);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: planId,
    projectCount,
    maxStartups: plan.maxStartups,
    canCreateMore: projectCount < plan.maxStartups,
  };
}
