import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { buildAuthUserPayload } from "@/lib/stripe-plan-sync";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await buildAuthUserPayload(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

/** Plan upgrades are handled by Stripe webhooks only. */
export async function PATCH() {
  return NextResponse.json(
    { error: "Plan changes require checkout. Use the upgrade flow." },
    { status: 403 }
  );
}
