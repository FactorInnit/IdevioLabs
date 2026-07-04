import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateAssistantReply, type ChatMessage } from "@/lib/assistant-chat";
import type { AssistantContext } from "@/lib/assistant-actions";
import { getProject } from "@/lib/projects";

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

    if (context?.projectId) {
      const project = await getProject(context.projectId);
      if (!project || project.userId !== user.id) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }
    }

    const { reply, actionsApplied, selectNodeId, source } =
      await generateAssistantReply(messages, context);

    return NextResponse.json({ reply, actionsApplied, selectNodeId, source });
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
