import type { PlanId } from "@/lib/plans";
import { isBetaPaymentsDisabled } from "@/lib/beta";
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

function isValidPlanId(value: string | undefined | null): value is PlanId {
  return value === "pro" || value === "ultra";
}

function resolvePlanIdFromPriceAmount(unitAmount: number | null | undefined): PlanId | null {
  if (unitAmount === 1999) return "pro";
  if (unitAmount === 2999) return "ultra";
  return null;
}

function resolvePlanIdFromMetadata(
  metadata: { planId?: string; userId?: string } | null | undefined
): PlanId | null {
  const planId = metadata?.planId;
  return isValidPlanId(planId) ? planId : null;
}

function resolvePlanIdFromSubscription(subscription: {
  metadata?: { planId?: string } | null;
  items: { data: { price: { id: string; unit_amount: number | null } }[] };
}): PlanId | null {
  const fromMetadata = resolvePlanIdFromMetadata(subscription.metadata);
  if (fromMetadata) return fromMetadata;

  const price = subscription.items.data[0]?.price;
  if (!price) return null;

  const fromEnv = planFromStripePrice(price.id);
  if (fromEnv) return fromEnv;

  return resolvePlanIdFromPriceAmount(price.unit_amount);
}

async function updateUserPlan(
  userId: string,
  planId: PlanId,
  stripeCustomerId?: string | null,
  stripeSubscriptionId?: string | null
) {
  if (isBetaPaymentsDisabled() && (planId === "pro" || planId === "ultra")) {
    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      plan: planId,
      stripeCustomerId: stripeCustomerId ?? undefined,
      stripeSubscriptionId: stripeSubscriptionId ?? undefined,
    },
  });
}

export async function applyCheckoutSessionToUser(session: CheckoutSession) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const planId = resolvePlanIdFromMetadata(session.metadata);

  if (!userId || !planId) {
    return null;
  }

  const user = await updateUserPlan(
    userId,
    planId,
    typeof session.customer === "string" ? session.customer : null,
    typeof session.subscription === "string" ? session.subscription : null
  );

  const projectCount = await getUserProjectCount(user.id);
  const effectivePlanId = (user.plan as PlanId) || "free";
  const plan = getPlan(effectivePlanId);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: effectivePlanId,
    projectCount,
    maxStartups: plan.maxStartups,
    canCreateMore: projectCount < plan.maxStartups,
  };
}

export function isCheckoutSessionPaid(session: CheckoutSession): boolean {
  return session.payment_status === "paid" || session.status === "complete";
}

async function findPaidCheckoutSessionForUser(userId: string, email: string) {
  const stripe = getStripe();
  if (!stripe) return null;

  const recent = await stripe.checkout.sessions.list({ limit: 100 });
  return (
    recent.data.find(
      (session) =>
        session.payment_status === "paid" &&
        (session.metadata?.userId === userId ||
          session.client_reference_id === userId ||
          session.customer_email?.toLowerCase() === email.toLowerCase())
    ) ?? null
  );
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
      status: "all",
      limit: 10,
    });
    const active = subs.data.find((sub) =>
      ["active", "trialing", "past_due"].includes(sub.status)
    );
    subscriptionId = active?.id ?? null;
  }

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (["active", "trialing", "past_due"].includes(subscription.status)) {
      const planId = resolvePlanIdFromSubscription(subscription);
      const resolvedCustomerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : customerId ?? user.stripeCustomerId;

      if (planId) {
        user = await updateUserPlan(
          userId,
          planId,
          resolvedCustomerId,
          subscription.id
        );
        return user;
      }
    }
  }

  const checkoutSession = await findPaidCheckoutSessionForUser(userId, user.email);
  if (checkoutSession) {
    const checkoutPayload = {
      metadata: checkoutSession.metadata,
      client_reference_id: checkoutSession.client_reference_id,
      customer:
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer?.id ?? null,
      subscription:
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription?.id ?? null,
      payment_status: checkoutSession.payment_status,
      status: checkoutSession.status,
    };

    const applied = await applyCheckoutSessionToUser(checkoutPayload);
    if (applied) {
      user = await prisma.user.findUnique({ where: { id: userId } });
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

export function toCheckoutSessionPayload(session: {
  metadata?: { userId?: string; planId?: string } | null;
  client_reference_id?: string | null;
  customer?: string | { id: string } | null;
  subscription?: string | { id: string } | null;
  payment_status?: string | null;
  status?: string | null;
}): CheckoutSession {
  return {
    metadata: session.metadata,
    client_reference_id: session.client_reference_id,
    customer:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null,
    subscription:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null,
    payment_status: session.payment_status,
    status: session.status,
  };
}
