"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink, ListChecks } from "lucide-react";
import { companyModuleNodeHref } from "@/lib/founder-nav";
import type { TaskStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MilestoneTasksPeek({
  projectId,
  nodeId,
  nodeTitle,
  tasks,
  compact = false,
}: {
  projectId: string;
  nodeId: string;
  nodeTitle: string;
  tasks: TaskStep[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (tasks.length === 0) {
    return (
      <p className={cn("text-slate-400", compact ? "mt-2 text-[10px]" : "mt-1 text-[10px]")}>
        No action steps yet —{" "}
        <Link
          href={companyModuleNodeHref(projectId, "workspace", nodeId)}
          className="font-semibold text-navy-700 hover:underline"
        >
          open on canvas
        </Link>
      </p>
    );
  }

  return (
    <div className={cn("border-t border-navy-900/8 pt-2", compact ? "mt-2" : "mt-2")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${open ? "Hide" : "Show"} ${tasks.length} tasks for ${nodeTitle}`}
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-navy-900/5 px-2.5 py-1.5 text-left transition hover:bg-navy-900/10"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-800">
          <ListChecks className="h-3.5 w-3.5 shrink-0" />
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
          <span className="font-normal text-slate-500">· tap to {open ? "hide" : "view"}</span>
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        )}
      </button>

      {open && (
        <ol className="mt-2 max-h-44 space-y-1.5 overflow-y-auto pr-0.5">
          {tasks.map((task, i) => (
            <li
              key={i}
              className="rounded-lg bg-white px-2.5 py-2 text-[11px] leading-snug text-slate-700 ring-1 ring-navy-900/6"
            >
              <p className="font-semibold text-navy-900">
                <span className="mr-1 text-navy-500">{i + 1}.</span>
                {task.title}
              </p>
              {task.detail ? (
                <p className="mt-1 line-clamp-3 text-[10px] leading-relaxed text-slate-500">
                  {task.detail}
                </p>
              ) : null}
              {task.estimatedTime ? (
                <p className="mt-1 text-[10px] font-medium text-navy-600">{task.estimatedTime}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      <Link
        href={companyModuleNodeHref(projectId, "workspace", nodeId)}
        className="mt-2 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[10px] font-semibold text-navy-700 transition hover:bg-navy-900/5 hover:text-navy-900"
      >
        Open on canvas
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}
