import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isOpenAIConfigured } from "@/lib/openai";

/** Whether ChatGPT is wired up (local `.env` or Vercel env). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  return NextResponse.json({
    configured: isOpenAIConfigured(),
    model: "gpt-4o-mini",
  });
}
