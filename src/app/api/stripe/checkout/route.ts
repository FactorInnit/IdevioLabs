import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPlan, type PlanId } from "@/lib/plans";
import { getAppUrl, getStripe, getStripePriceId } from "@/lib/stripe";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upgrade your plan." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const planId = String(body.planId ?? "") as PlanId;

    if (planId !== "pro" && planId !== "ultra") {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = getStripePriceId(planId);

    if (!stripe || !priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY and price IDs to your environment.",
        },
        { status: 503 }
      );
    }

    const plan = getPlan(planId);
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success&plan=${planId}`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to start checkout." },
      { status: 500 }
    );
  }
}
