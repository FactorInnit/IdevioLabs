import { NextResponse } from "next/server";
import { exchangeGoogleCode, verifyState } from "@/lib/google-auth";
import { attachSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOAuthOrigin } from "@/lib/site";

function loginError(origin: string, code: string) {
  return NextResponse.redirect(new URL(`/login?error=${code}`, origin));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const fallbackOrigin = getOAuthOrigin(request);

  if (error || !code || !state) {
    return loginError(fallbackOrigin, "google_signin_failed");
  }

  const parsedState = verifyState(state);
  if (!parsedState) {
    return loginError(fallbackOrigin, "invalid_state");
  }

  const origin = parsedState.origin;

  try {
    const profile = await exchangeGoogleCode(code, origin);
    const email = profile.email.toLowerCase();

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.id }, { email }],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.id,
          name: user.name || profile.name,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || email.split("@")[0],
          googleId: profile.id,
        },
      });
    }

    const redirectUrl = new URL(parsedState.next, origin);
    redirectUrl.searchParams.set("signed_in", "1");

    const response = NextResponse.redirect(redirectUrl);
    return attachSessionCookie(response, user.id);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    const message = err instanceof Error ? err.message : String(err);

    if (
      message.includes("Failed to exchange Google auth code") ||
      message.includes("Google OAuth is not configured")
    ) {
      return loginError(origin, "google_token_failed");
    }

    if (
      message.includes("SQLITE") ||
      message.includes("libsql") ||
      message.includes("database") ||
      message.includes("Prisma") ||
      message.includes("no such table")
    ) {
      return loginError(origin, "database_not_configured");
    }

    return loginError(origin, "google_signin_failed");
  }
}
