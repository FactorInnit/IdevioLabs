"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  ListChecks,
  MousePointerClick,
  Wrench,
} from "lucide-react";
import { CATEGORY_CONFIG, getPhaseForCategory } from "@/lib/constants";
import { cn, parseTasks } from "@/lib/utils";
import type { NodeCategory, WorkflowNodeData } from "@/lib/types";

interface OrderedTaskBlocksProps {
  node: WorkflowNodeData | null;
  onUpdateProgress: (progress: number, status: string, note?: string) => void;
}

export function OrderedTaskBlocks({
  node,
  onUpdateProgress,
}: OrderedTaskBlocksProps) {
  const tasks = useMemo(() => (node ? parseTasks(node.tasks) : []), [node]);
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!node) {
      setDone(new Set());
      return;
    }
    const total = tasks.length || 1;
    const completedCount = Math.round((node.progress / 100) * total);
    const initial = new Set<number>();
    for (let i = 0; i < completedCount; i++) initial.add(i);
    setDone(initial);
  }, [node, tasks.length]);

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-200 bg-white/70 px-6 py-14 text-center backdrop-blur-sm">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900">
          <MousePointerClick className="h-6 w-6 text-white/60" />
        </div>
        <h3 className="text-sm font-semibold text-navy-900">
          Pick a block above to open its sub-tasks
        </h3>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
          Click any item in the block index (Idea, Product, Finance…) or a block on
          the map. It expands into multiple smaller task blocks — each with the exact
          steps, tools, and websites to use, in order.
        </p>
      </div>
    );
  }

  const config =
    CATEGORY_CONFIG[node.category as NodeCategory] ?? CATEGORY_CONFIG.operations;
  const phase = getPhaseForCategory(node.category as NodeCategory);

  const toggle = (index: number) => {
    const next = new Set(done);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setDone(next);

    const total = tasks.length || 1;
    const progress = Math.round((next.size / total) * 100);
    const status =
      progress === 100 ? "completed" : progress > 0 ? "in_progress" : "pending";
    onUpdateProgress(
      progress,
      status,
      `Task "${tasks[index]?.title}" ${next.has(index) ? "completed" : "reopened"}`
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white",
              config.accent === "bg-white" ? "bg-navy-700" : config.accent
            )}
          >
            {String(config.order).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-base font-semibold text-navy-950">
              {node.title}
              <span className="ml-2 text-xs font-medium text-slate-400">
                {config.label}
                {phase ? ` · ${phase.label} phase` : ""}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {tasks.length} smaller task blocks — complete them in order.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
          <ListChecks className="h-4 w-4 text-navy-600" />
          <span className="text-xs font-semibold text-navy-900">
            {done.size} / {tasks.length} done
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task, index) => {
          const isDone = done.has(index);
          return (
            <div
              key={index}
              className={cn(
                "group relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all",
                isDone
                  ? "border-navy-300 bg-navy-50/50"
                  : "border-slate-200 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-md"
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    isDone
                      ? "bg-navy-900 text-white"
                      : "bg-slate-100 text-navy-900"
                  )}
                >
                  {index + 1}
                </span>
                <button
                  onClick={() => toggle(index)}
                  aria-label={isDone ? "Mark as not done" : "Mark as done"}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-navy-700" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 transition group-hover:text-navy-400" />
                  )}
                </button>
              </div>

              <h4
                className={cn(
                  "text-sm font-semibold leading-snug",
                  isDone ? "text-navy-500 line-through" : "text-navy-950"
                )}
              >
                {task.title}
              </h4>

              {task.estimatedTime && (
                <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  <Clock className="h-3 w-3" />
                  {task.estimatedTime}
                </span>
              )}

              {task.detail && (
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {task.detail}
                </p>
              )}

              {task.tools.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Wrench className="h-3 w-3 text-navy-500" />
                  {task.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-navy-900"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {task.resources.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2">
                  {task.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-600 hover:text-navy-800 hover:underline"
                    >
                      {r.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
