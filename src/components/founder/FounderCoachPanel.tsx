"use client";

import { useState } from "react";
import { Bot, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { AssistantPanel, type AssistantContext } from "@/components/AssistantPanel";
import { ASSISTANT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface FounderCoachPanelProps {
  context: AssistantContext;
  onProjectChange?: () => void | Promise<void>;
}

export function FounderCoachPanel({
  context,
  onProjectChange,
}: FounderCoachPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Collapsed tab */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-navy-900/10 bg-white/90 px-2.5 py-4 shadow-xl backdrop-blur-xl transition hover:bg-white"
          aria-label="Open AI Founder Coach"
        >
          <Bot className="h-5 w-5 text-navy-800" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-700 [writing-mode:vertical-lr]">
            Coach
          </span>
        </button>
      )}

      {/* Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-40 flex h-screen flex-col border-l border-navy-900/8 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300",
          open ? "w-[380px]" : "w-0 overflow-hidden border-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-navy-900/8 bg-navy-950 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-white">
                {ASSISTANT_NAME}
                <Sparkles className="h-3 w-3 text-navy-300" />
              </p>
              <p className="text-[10px] text-white/50">AI Founder Coach · always here</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Collapse coach"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-2">
          <AssistantPanel
            context={context}
            onProjectChange={onProjectChange}
            compact
          />
        </div>
      </aside>

      {/* Expand hint when open */}
      {open && (
        <div className="pointer-events-none fixed right-[380px] top-1/2 z-30 hidden -translate-y-1/2 lg:block">
          <ChevronLeft className="h-4 w-4 text-slate-300" />
        </div>
      )}
    </>
  );
}
