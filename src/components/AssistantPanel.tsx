"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, Send, Sparkles, User } from "lucide-react";
import { ASSISTANT_NAME, PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantNodeRef {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
}

export interface AssistantContext {
  projectId?: string;
  name?: string;
  description?: string;
  budget?: number | null;
  selectedBlock?: string;
  progress?: number;
  nodes?: AssistantNodeRef[];
}

const SUGGESTIONS = [
  "What should I do first?",
  "How do I validate this idea?",
  "Who are my main competitors?",
  "Add a marketing block",
];

export function AssistantPanel({
  context,
  onProjectChange,
  onSelectNode,
  compact = false,
  strategyMode = false,
}: {
  context: AssistantContext;
  onProjectChange?: () => Promise<void> | void;
  onSelectNode?: (nodeId: string) => void;
  compact?: boolean;
  strategyMode?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm ${ASSISTANT_NAME}, your ${PRODUCT_NAME} coach${
        context.name ? ` for ${context.name}` : ""
      }. Ask me anything about your startup — strategy, validation, competitors, budget — or tell me to update your roadmap.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    connected: boolean;
    message?: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setAiStatus({
          configured: data.configured === true,
          connected: data.connected === true,
          message: typeof data.message === "string" ? data.message : undefined,
        });
      })
      .catch(() => setAiStatus(null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context, strategyMode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error === "Sign in required."
                ? "Please sign in to chat with me."
                : data.upgradeRequired
                  ? `${data.error} Visit /pricing to upgrade.`
                  : data.error ?? "Sorry, something went wrong. Please try again.",
          },
        ]);
        return;
      }

      if (typeof data.aiConfigured === "boolean") {
        setAiStatus((prev) =>
          prev
            ? { ...prev, configured: data.aiConfigured }
            : { configured: data.aiConfigured, connected: false }
        );
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "…" },
      ]);

      if (data.actionsApplied?.length > 0) {
        await onProjectChange?.();
        if (data.selectNodeId) {
          onSelectNode?.(data.selectNodeId);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden",
        compact
          ? "min-h-0 rounded-xl bg-white"
          : "min-h-[520px] rounded-2xl border border-slate-200 bg-white shadow-sm"
      )}
    >
      {!compact && (
        <div className="flex items-center gap-3 border-b border-white/10 bg-navy-950 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 font-semibold text-white">
              {ASSISTANT_NAME}
              <Sparkles className="h-3.5 w-3.5 text-navy-400" />
            </h3>
            <p className="text-xs text-white/50">
              ChatGPT coach · knows your startup context
            </p>
          </div>
        </div>
      )}

      {aiStatus && !aiStatus.connected && (
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-950">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {aiStatus.message ??
              (aiStatus.configured
                ? "ChatGPT is configured but not responding. Check your OpenAI billing and redeploy on Vercel."
                : `Add OPENAI_API_KEY to Vercel (no quotes around the value), redeploy, then try again.`)}
          </span>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2.5",
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                m.role === "user" ? "bg-navy-200" : "bg-navy-900"
              )}
            >
              {m.role === "user" ? (
                <User className="h-3.5 w-3.5 text-navy-800" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-white" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "rounded-tr-sm bg-navy-900 text-white"
                  : "rounded-tl-sm bg-slate-100 text-navy-900"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-navy-800 transition hover:border-navy-300 hover:bg-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-slate-200 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${ASSISTANT_NAME} about ${context.name ?? "your startup"}…`}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-navy-400 focus:bg-white"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white transition hover:bg-navy-800 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
