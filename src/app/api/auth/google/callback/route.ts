import { NextResponse } from "next/server";
import { exchangeGoogleCode, verifyState } from "@/lib/google-auth";
import { setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/stripe";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = getAppUrl();

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL("/login?error=google_signin_failed", appUrl)
    );
  }

  const parsedState = verifyState(state);
  if (!parsedState) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", appUrl)
    );
  }

  try {
    const profile = await exchangeGoogleCode(code);
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

    await setSessionCookie(user.id);

    const next = parsedState.next.startsWith("/") ? parsedState.next : "/dashboard";
    return NextResponse.redirect(new URL(next, appUrl));
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(
      new URL("/login?error=google_signin_failed", appUrl)
    );
  }
}
