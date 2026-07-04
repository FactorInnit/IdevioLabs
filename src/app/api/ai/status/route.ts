import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isOpenAIConfigured, OPENAI_MODEL, verifyOpenAIConnection } from "@/lib/openai";

/** Whether ChatGPT is wired up and working (local `.env` or Vercel env). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const verify = await verifyOpenAIConnection();

  return NextResponse.json({
    configured: isOpenAIConfigured(),
    connected: verify.ok,
    model: OPENAI_MODEL,
    code: verify.code,
    message: verify.message,
  });
}
