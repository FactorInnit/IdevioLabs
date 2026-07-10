import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isBetaPaymentsDisabled } from "@/lib/beta";
import { getStripe } from "@/lib/stripe";
import {
  applyCheckoutSessionToUser,
  buildAuthUserPayload,
  isCheckoutSessionPaid,
  toCheckoutSessionPayload,
} from "@/lib/stripe-plan-sync";

export async function POST(request: Request) {
  if (isBetaPaymentsDisabled()) {
    return NextResponse.json(
      { error: "Paid plans are not available during public beta." },
      { status: 403 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const sessionId = String(body.sessionId ?? "").trim();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionUserId =
      session.metadata?.userId || session.client_reference_id || null;

    if (sessionUserId !== user.id) {
      return NextResponse.json({ error: "Session does not belong to this user." }, { status: 403 });
    }

    const checkoutSession = toCheckoutSessionPayload(session);

    if (!isCheckoutSessionPaid(checkoutSession)) {
      return NextResponse.json({ pending: true, user: { ...user, plan: user.plan } });
    }

    const updatedUser = await applyCheckoutSessionToUser(checkoutSession);
    if (!updatedUser) {
      return NextResponse.json({ error: "Invalid checkout session." }, { status: 400 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Verify checkout session error:", error);
    return NextResponse.json({ error: "Failed to verify checkout." }, { status: 500 });
  }
}
