"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, Users } from "lucide-react";
import { GlassCard } from "../GlassCard";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface TeamMessage {
  id: string;
  userName: string;
  message: string;
  createdAt: string;
}

export function TeamModule({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${projectId}/team`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/company/${projectId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  };

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/company/${projectId}?module=team`
      : "";

  return (
    <div className="space-y-6">
      <GlassCard className="p-5" hover={false}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/8">
            <Users className="h-6 w-6 text-navy-700" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-navy-900">
              {projectName} — Team workspace
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Chat with co-founders and teammates. Share this link so they can join the same
              project chat.
            </p>
            {inviteLink && (
              <code className="mt-2 block truncate rounded-lg bg-navy-900/5 px-3 py-2 text-xs text-navy-800">
                {inviteLink}
              </code>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="flex h-[520px] flex-col p-0" hover={false}>
        <div className="border-b border-navy-900/6 px-5 py-3">
          <p className="text-xs font-semibold text-slate-500">
            {messages.length} message{messages.length !== 1 ? "s" : ""} · auto-refreshes
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No messages yet. Say hello to your team!
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isMe = user?.name === m.userName;
                return (
                  <div
                    key={m.id}
                    className={cn("flex", isMe ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5",
                        isMe
                          ? "bg-navy-900 text-white"
                          : "bg-navy-900/8 text-navy-900"
                      )}
                    >
                      {!isMe && (
                        <p className="mb-0.5 text-[10px] font-bold opacity-70">
                          {m.userName}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">{m.message}</p>
                      <p
                        className={cn(
                          "mt-1 text-[9px]",
                          isMe ? "text-white/60" : "text-slate-400"
                        )}
                      >
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t border-navy-900/6 p-4">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Message your team…"
              className="flex-1 rounded-xl border border-navy-900/10 px-4 py-2.5 text-sm"
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
