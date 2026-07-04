import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateAssistantReply, type ChatMessage } from "@/lib/assistant-chat";
import type { AssistantContext } from "@/lib/assistant-actions";
import { requireProjectView } from "@/lib/project-access";
import { checkAiUsage, incrementAiUsage, isUltra } from "@/lib/usage-limits";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages.filter(
          (m: ChatMessage) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
      : [];
    const context: AssistantContext | undefined = body.context;
    const strategyMode = body.strategyMode === true && isUltra(user.plan);

    if (context?.projectId) {
      try {
        await requireProjectView(user.id, context.projectId);
      } catch {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }
    }

    const usage = await checkAiUsage(user.id, user.plan);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `Free plan limit: ${usage.limit} AI messages per month. Upgrade to Pro for unlimited coach chats.`,
          upgradeRequired: true,
          usage,
        },
        { status: 402 }
      );
    }

    const { reply, actionsApplied, selectNodeId, source } =
      await generateAssistantReply(messages, { ...context, strategyMode });

    await incrementAiUsage(user.id, user.plan);

    return NextResponse.json({
      reply,
      actionsApplied,
      selectNodeId,
      source,
      strategyMode,
    });
  } catch (error) {
    console.error("Assistant route error:", error);
    return NextResponse.json(
      {
        reply:
          "Something went wrong on my end. Please try again — or ask a simpler question to start.",
        actionsApplied: [],
        source: "fallback",
      },
      { status: 200 }
    );
  }
}
