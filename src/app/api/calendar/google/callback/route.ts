import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import {
  exchangeGoogleCalendarCode,
  verifyCalendarState,
} from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { getOAuthOrigin } from "@/lib/site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const fallbackOrigin = getOAuthOrigin(request);

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard?calendar_error=google_denied", fallbackOrigin)
    );
  }

  const parsed = verifyCalendarState(state);
  if (!parsed) {
    return NextResponse.redirect(
      new URL("/dashboard?calendar_error=invalid_state", fallbackOrigin)
    );
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    const login = new URL("/login", parsed.origin);
    login.searchParams.set("next", parsed.next);
    return NextResponse.redirect(login);
  }

  try {
    const tokens = await exchangeGoogleCalendarCode(code, parsed.origin);

    let email: string | null = null;
    if (tokens.access_token) {
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (profileRes.ok) {
        const profile = (await profileRes.json()) as { email?: string };
        email = profile.email ?? null;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(tokens.refresh_token
          ? { googleCalendarRefreshToken: tokens.refresh_token }
          : {}),
        googleCalendarEmail: email,
      },
    });

    const redirectUrl = new URL(parsed.next, parsed.origin);
    redirectUrl.searchParams.set("google_calendar", "connected");
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Google Calendar callback error:", err);
    const redirectUrl = new URL(parsed.next, parsed.origin);
    redirectUrl.searchParams.set("calendar_error", "google_failed");
    return NextResponse.redirect(redirectUrl);
  }
}
