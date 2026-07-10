import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isBetaPaymentsDisabled } from "@/lib/beta";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planId = String(body.planId ?? "pro");
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (planId !== "pro" && planId !== "ultra") {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Name, phone, and email are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const user = await getCurrentUser();

    try {
      await prisma.upgradeInterestLead.create({
        data: {
          userId: user?.id,
          planId,
          name,
          phone,
          email,
        },
      });
    } catch (dbError) {
      console.error("Upgrade interest DB error:", dbError);
      if (isBetaPaymentsDisabled()) {
        return NextResponse.json(
          {
            error:
              "Could not save your details yet. Run the UpgradeInterestLead migration on Turso, then try again.",
          },
          { status: 503 }
        );
      }
      throw dbError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upgrade interest error:", error);
    return NextResponse.json(
      { error: "Failed to submit. Please try again." },
      { status: 500 }
    );
  }
}
