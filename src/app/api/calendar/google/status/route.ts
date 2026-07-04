import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGoogleCalendarStatus } from "@/lib/google-calendar-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const status = await getGoogleCalendarStatus(user.id);
  return NextResponse.json(status);
}
