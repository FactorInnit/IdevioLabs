import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUsageSummary } from "@/lib/usage-limits";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const summary = await getUsageSummary(user.id, user.plan);
  return NextResponse.json(summary);
}
