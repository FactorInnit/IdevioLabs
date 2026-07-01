import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ASSISTANT_TOOLS,
  buildNodesSummary,
  detectFallbackActions,
  executeAssistantAction,
  executeToolCalls,
  formatActionReply,
  type AssistantContext,
} from "@/lib/assistant-actions";
import { ASSISTANT_NAME, COMPANY_NAME, PRODUCT_NAME } from "@/lib/brand";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function fallbackAdvice(message: string, context?: AssistantContext): string {
  const m = message.toLowerCase();
  const budgetLine = context?.budget
    ? `With your $${context.budget.toLocaleString()} budget, stick to free/freemium tools first.`
    : "Since you haven't set a budget, assume bootstrap mode and lean on free tools.";

  if (m.includes("budget") || m.includes("cost")) {
    return `${budgetLine}\n\nAsk me to "set budget to $500" and I'll update it for you directly.`;
  }
  if (m.includes("next") || m.includes("start") || m.includes("first")) {
    return `Start with validation — talk to 10-15 potential customers before building. Work through your roadmap blocks in order.\n\n${budgetLine}`;
  }

  return `I can update your roadmap directly — try "add a finance block", "set budget to $100", or "mark idea as complete".\n\n${budgetLine}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : [];
    const context: AssistantContext | undefined = body.context;
    const lastUser =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const projectId = context?.projectId;
    const nodes = context?.nodes ?? [];

    const apiKey = process.env.OPENAI_API_KEY;

    // No API key — rule-based actions + advice
    if (!apiKey) {
      let actionResults: Awaited<
        ReturnType<typeof executeAssistantAction>
      >[] = [];
      let selectNodeId: string | undefined;

      if (projectId) {
        const detected = detectFallbackActions(lastUser);
        for (const action of detected) {
          const result = await executeAssistantAction(
            projectId,
            action.name,
            action.args,
            nodes
          );
          actionResults.push(result);
          if (result.nodeId) selectNodeId = result.nodeId;
        }
      }

      const actionReply =
        actionResults.length > 0
          ? formatActionReply(actionResults, lastUser)
          : "";
      const advice = actionReply || fallbackAdvice(lastUser, context);

      return NextResponse.json({
        reply: advice,
        actionsApplied: actionResults,
        selectNodeId,
      });
    }

    const client = new OpenAI({ apiKey });

    const nodesSummary = buildNodesSummary(nodes);
    const canAct = Boolean(projectId);

    const systemPrompt = `You are ${ASSISTANT_NAME}, the AI assistant inside ${PRODUCT_NAME} by ${COMPANY_NAME}. You help founders plan and build their startup.

You can BOTH give advice AND make changes to the user's roadmap when they ask. When the user asks you to add, remove, update, connect blocks, or change the budget — use the provided tools to execute the change immediately. Don't just explain how — do it.

Startup context:
- Name: ${context?.name ?? "unknown"}
- Idea: ${context?.description ?? "unknown"}
- Budget: ${context?.budget ? `$${context.budget}` : "not set"}
- Overall progress: ${context?.progress ?? 0}%
- Currently viewing: ${context?.selectedBlock ?? "none"}

Current roadmap blocks:
${nodesSummary}

Rules:
- Be concise (under 120 words) and actionable.
- When using tools, also explain briefly what you did.
- Respect budget: bootstrap = free tools only.
- If they ask to add a block type that already exists, add another block in that category anyway unless they say otherwise.
- Warm, encouraging tone — like a seasoned founder mentor.`;

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: chatMessages,
      tools: canAct ? ASSISTANT_TOOLS : undefined,
      tool_choice: canAct ? "auto" : undefined,
    });

    const choice = completion.choices[0]?.message;
    let reply = choice?.content ?? "";
    let selectNodeId: string | undefined;
    let actionsApplied: Awaited<
      ReturnType<typeof executeAssistantAction>
    >[] = [];

    if (projectId && choice?.tool_calls?.length) {
      const { results, selectNodeId: nodeId } = await executeToolCalls(
        projectId,
        choice.tool_calls
      );
      actionsApplied = results;
      selectNodeId = nodeId;

      const actionSummary = formatActionReply(results, lastUser);
      if (reply) {
        reply = `${reply}\n\n${actionSummary}`;
      } else {
        reply = actionSummary;
      }
    }

    if (!reply) {
      reply = fallbackAdvice(lastUser, context);
    }

    return NextResponse.json({ reply, actionsApplied, selectNodeId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        reply: "Sorry, I hit an error. Please try again in a moment.",
        actionsApplied: [],
      },
      { status: 200 }
    );
  }
}
