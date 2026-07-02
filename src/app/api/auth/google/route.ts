import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-auth";
import { getOAuthOrigin, sanitizeNextPath } from "@/lib/site";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const next = sanitizeNextPath(searchParams.get("next"));
    const origin = getOAuthOrigin(request);
    const url = getGoogleAuthUrl(next, origin);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      new URL("/login?error=google_not_configured", request.url)
    );
  }
}
