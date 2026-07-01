import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, planFromStripePrice } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          metadata?: { userId?: string; planId?: string };
          client_reference_id?: string;
          customer?: string;
          subscription?: string;
        };

        const userId = session.metadata?.userId || session.client_reference_id;
        const planId = session.metadata?.planId as PlanId | undefined;

        if (userId && planId && (planId === "pro" || planId === "ultra")) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: planId,
              stripeCustomerId:
                typeof session.customer === "string" ? session.customer : undefined,
              stripeSubscriptionId:
                typeof session.subscription === "string"
                  ? session.subscription
                  : undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as {
          id: string;
          customer: string;
          status: string;
          items: { data: { price: { id: string } }[] };
        };

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (!user) break;

        if (subscription.status === "active" || subscription.status === "trialing") {
          const priceId = subscription.items.data[0]?.price.id;
          const planId = priceId ? planFromStripePrice(priceId) : null;
          if (planId) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                plan: planId,
                stripeSubscriptionId: subscription.id,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as { customer: string };
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "free",
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
