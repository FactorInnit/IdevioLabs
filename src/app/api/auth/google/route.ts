import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next") || "/dashboard";
    const url = getGoogleAuthUrl(next);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      new URL("/login?error=google_not_configured", request.url)
    );
  }
}
