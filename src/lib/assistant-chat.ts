import type OpenAI from "openai";
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
import { getOpenAIClient, isOpenAIConfigured, formatOpenAIError, OPENAI_MODEL } from "@/lib/openai";
import {
  formatProjectContextForPrompt,
  loadProjectAiContext,
} from "@/lib/project-ai-context";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function enrichContext(context?: AssistantContext): Promise<AssistantContext | undefined> {
  if (!context?.projectId) return context;

  try {
    const projectCtx = await loadProjectAiContext(context.projectId);
    if (!projectCtx) return context;

    return {
      ...context,
      name: projectCtx.name,
      description: projectCtx.description ?? projectCtx.prompt,
      budget: projectCtx.budget,
      progress: projectCtx.progress,
      nodes: projectCtx.blocks.map((b) => ({
        id: b.id,
        title: b.title,
        category: b.category,
        status: b.status,
        progress: b.progress,
      })),
      budgetNotes: projectCtx.budgetNotes ?? undefined,
      prompt: projectCtx.prompt,
      teamSize: projectCtx.teamSize,
      pendingTasks: projectCtx.pendingTasks,
      recentProgress: projectCtx.recentProgress,
      reminders: projectCtx.reminders,
      blockSummaries: projectCtx.blocks.map((b) => ({
        title: b.title,
        category: b.category,
        progress: b.progress,
        status: b.status,
        taskCount: b.tasks.length,
        description: b.description?.slice(0, 120),
      })),
      projectContextText: formatProjectContextForPrompt(projectCtx),
    };
  } catch (error) {
    console.error("Assistant context load error:", error);
    return context;
  }
}

function buildSystemPrompt(context: AssistantContext | undefined): string {
  const startupContext = context?.projectContextText
    ? context.projectContextText
    : [
        `- Company: ${context?.name ?? "unknown"}`,
        `- Idea / description: ${context?.description ?? "unknown"}`,
        `- Original prompt: ${context?.prompt ?? context?.description ?? "unknown"}`,
        `- Budget: ${context?.budget != null ? `$${context.budget.toLocaleString()}` : "not set"}`,
        `- Budget notes: ${context?.budgetNotes ?? "none"}`,
        `- Overall progress: ${context?.progress ?? 0}%`,
        `- Currently viewing: ${context?.selectedBlock ?? "company workspace"}`,
        "",
        "Roadmap blocks:",
        context?.blockSummaries?.length
          ? context.blockSummaries
              .map(
                (b) =>
                  `- ${b.category}: "${b.title}" (${b.status}, ${b.progress}%, ${b.taskCount} tasks)${b.description ? ` — ${b.description}` : ""}`
              )
              .join("\n")
          : buildNodesSummary(context?.nodes ?? []) || "No blocks yet.",
      ].join("\n");

  return `You are ${ASSISTANT_NAME}, the AI founder coach inside ${PRODUCT_NAME} by ${COMPANY_NAME}.

Talk naturally like ChatGPT — warm, clear, and conversational. Answer greetings, questions, strategy, validation, competitors, finance, and product advice using the user's startup context below.

You can also update their roadmap when they ask (add/edit/delete blocks, set budget, mark progress). Only use tools for explicit change requests — not for normal chat or advice.

Startup context:
${startupContext}

Guidelines:
- For "hi" or casual messages, respond naturally and reference their company by name when relevant.
- Give specific, actionable founder advice tied to their idea — not generic startup platitudes.
- Reference their open tasks, recent progress, and reminders when relevant.
- Keep most replies under 150 words unless they ask for a deep dive.
- When you use tools to change the roadmap, briefly explain what you did.
- Respect budget constraints; suggest free tools when bootstrapping.${
    context?.strategyMode
      ? `

STRATEGY MODE (Ultra): You are in strategic planning mode. Run scenario analysis, compare tradeoffs, stress-test assumptions, and give CEO-level recommendations with clear decision frameworks. Reference their roadmap blocks and budget explicitly when advising on timing, hiring, fundraising, or pivoting.`
      : ""
  }`;
}

function fallbackChat(message: string, context?: AssistantContext): string {
  const m = message.toLowerCase().trim();
  const name = context?.name ?? "your startup";
  const budgetLine =
    context?.budget != null
      ? `Your budget is $${context.budget.toLocaleString()}.`
      : "You haven't set a budget yet — I'd start bootstrap-first.";

  if (/^(hi|hello|hey|yo|sup|good morning|good afternoon|good evening)\b/.test(m)) {
    return `Hey! Good to hear from you. I'm ${ASSISTANT_NAME}, your coach for ${name}. Ask me anything — what to build next, how to validate, competitor angles, or tell me to update your roadmap (e.g. "add a finance block" or "set budget to $500").`;
  }

  if (m.includes("budget") || m.includes("cost") || m.includes("money")) {
    return `${budgetLine}\n\nFor ${name}, prioritize free tiers first (Notion, Google Sheets, Canva). Say "set budget to $500" and I'll update it on your project.\n\nWhat specific cost are you trying to figure out?`;
  }

  if (
    m.includes("next") ||
    m.includes("start") ||
    m.includes("first") ||
    m.includes("should i")
  ) {
    const topBlock = context?.nodes?.[0];
    return `For ${name}, I'd start with validation before building more.\n\n1. Talk to 10–15 potential users about the core problem\n2. Ship the smallest MVP that tests one hypothesis\n3. Track progress on your canvas blocks\n\n${budgetLine}${
      topBlock ? `\n\nYour "${topBlock.title}" block is at ${topBlock.progress}% — want help pushing that forward?` : ""
    }`;
  }

  if (m.includes("competitor") || m.includes("competition")) {
    return `Open the Competitors module for a full AI report on ${name}. I can also discuss positioning here — what's the main app or product you're up against?`;
  }

  if (m.includes("valid") || m.includes("idea")) {
    return `Check the Validator module for a scored report on ${name}. Quick take: validate demand with real user interviews before investing in features incumbents already nail.\n\nWhat assumption about ${name} do you most want to test?`;
  }

  return `I'm here to help with ${name} — strategy, roadmap, budget, validation, or competitors.\n\n${budgetLine}\n\nTry asking "What should I do first?" or tell me to "add a marketing block" / "mark idea as complete" and I'll update your canvas.`;
}

export async function generateAssistantReply(
  messages: ChatMessage[],
  context?: AssistantContext
): Promise<{
  reply: string;
  actionsApplied: Awaited<ReturnType<typeof executeAssistantAction>>[];
  selectNodeId?: string;
  source: "ai" | "fallback";
}> {
  const enriched = await enrichContext(context);
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const projectId = enriched?.projectId;
  const nodes = enriched?.nodes ?? [];

  let actionResults: Awaited<ReturnType<typeof executeAssistantAction>>[] = [];
  let selectNodeId: string | undefined;

  const client = getOpenAIClient();

  if (!client) {
    const setupHint = isOpenAIConfigured()
      ? ""
      : "\n\n(Add OPENAI_API_KEY in your environment for full ChatGPT answers about your startup.)";

    if (projectId) {
      for (const action of detectFallbackActions(lastUser)) {
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
      actionResults.length > 0 ? formatActionReply(actionResults, lastUser) : "";
    return {
      reply: (actionReply || fallbackChat(lastUser, enriched)) + setupHint,
      actionsApplied: actionResults,
      selectNodeId,
      source: "fallback",
    };
  }

  try {
    const systemPrompt = buildSystemPrompt(enriched);
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m) => m.content.trim())
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.7,
      messages: chatMessages,
      tools: projectId ? ASSISTANT_TOOLS : undefined,
      tool_choice: projectId ? "auto" : undefined,
    });

    const choice = completion.choices[0]?.message;
    let reply = choice?.content?.trim() ?? "";

    if (projectId && choice?.tool_calls?.length) {
      try {
        const { results, selectNodeId: nodeId } = await executeToolCalls(
          projectId,
          choice.tool_calls
        );
        actionResults = results;
        selectNodeId = nodeId;

        const actionSummary = formatActionReply(results, lastUser);
        if (reply && actionSummary) {
          reply = `${reply}\n\n${actionSummary}`;
        } else if (actionSummary) {
          reply = actionSummary;
        }
      } catch (toolError) {
        console.error("Assistant tool execution error:", toolError);
        if (!reply) {
          reply =
            "I understood your request but had trouble updating the roadmap. Try again or rephrase the block you want to change.";
        }
      }
    }

    if (!reply) {
      reply = fallbackChat(lastUser, enriched);
    }

    return {
      reply,
      actionsApplied: actionResults,
      selectNodeId,
      source: "ai",
    };
  } catch (error) {
    console.error("OpenAI assistant error:", error);
    const aiError = formatOpenAIError(error);

    if (projectId) {
      for (const action of detectFallbackActions(lastUser)) {
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
      actionResults.length > 0 ? formatActionReply(actionResults, lastUser) : "";

    return {
      reply:
        actionReply ||
        fallbackChat(lastUser, enriched) + `\n\n(${aiError.message})`,
      actionsApplied: actionResults,
      selectNodeId,
      source: "fallback",
    };
  }
}
