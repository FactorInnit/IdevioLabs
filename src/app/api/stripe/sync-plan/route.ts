import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { buildAuthUserPayload } from "@/lib/stripe-plan-sync";

/** Force-sync plan from Stripe (fixes missed webhooks). */
export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const user = await buildAuthUserPayload(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}
