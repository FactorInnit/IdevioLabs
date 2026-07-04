import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDailyMotivationQuote } from "@/lib/motivation-quotes";
import {
  getMotivationSettings,
  motivationSettingsReady,
  upsertMotivationSettings,
} from "@/lib/motivation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const dbReady = await motivationSettingsReady();
  const settings = await getMotivationSettings(user.id);
  const quote = getDailyMotivationQuote({
    userId: user.id,
    category: settings.category,
  });

  return NextResponse.json({ settings, quote, dbReady });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json();

  try {
    const settings = await upsertMotivationSettings(user.id, {
      category: body.category !== undefined ? String(body.category) : undefined,
      notifyTime: body.notifyTime !== undefined ? String(body.notifyTime) : undefined,
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      browserNotify:
        typeof body.browserNotify === "boolean" ? body.browserNotify : undefined,
      lastNotifiedDate:
        body.lastNotifiedDate !== undefined ? String(body.lastNotifiedDate) : undefined,
    });

    const quote = getDailyMotivationQuote({
      userId: user.id,
      category: settings.category,
    });

    return NextResponse.json({ settings, quote, dbReady: true });
  } catch (error) {
    if (error instanceof Error && error.message === "DB_NOT_READY") {
      return NextResponse.json(
        {
          error: "Motivation settings need a database update. Run the motivation migration in Turso.",
          dbReady: false,
        },
        { status: 503 }
      );
    }
    console.error("Motivation settings error:", error);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
