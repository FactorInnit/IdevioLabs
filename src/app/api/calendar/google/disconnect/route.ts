import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      googleCalendarRefreshToken: null,
      googleCalendarEmail: null,
    },
  });

  return NextResponse.json({ connected: false });
}
