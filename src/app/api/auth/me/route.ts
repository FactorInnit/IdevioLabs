import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserProjectCount } from "@/lib/plan-limits";
import { getPlan, type PlanId } from "@/lib/plans";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const projectCount = await getUserProjectCount(user.id);
  const plan = getPlan(user.plan as PlanId);

  return NextResponse.json({
    user: {
      ...user,
      projectCount,
      maxStartups: plan.maxStartups,
      canCreateMore: projectCount < plan.maxStartups,
    },
  });
}

/** Plan upgrades are handled by Stripe webhooks only. */
export async function PATCH() {
  return NextResponse.json(
    { error: "Plan changes require checkout. Use the upgrade flow." },
    { status: 403 }
  );
}
