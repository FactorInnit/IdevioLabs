"use client";

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { CheckCircle2, ListChecks, Wrench } from "lucide-react";
import { CATEGORY_CONFIG, getPhaseForCategory } from "@/lib/constants";
import { cn, formatCurrency, parseJson, parseTasks } from "@/lib/utils";
import type { NodeCategory, ToolRecommendation } from "@/lib/types";

export type StartupNodeData = {
  category: NodeCategory;
  title: string;
  description: string;
  tools: string;
  tasks: string;
  status: string;
  progress: number;
  estimatedCost: number | null;
  onSelect?: (id: string) => void;
};

export type StartupFlowNode = Node<StartupNodeData, "startup">;

export function StartupNode({ id, data, selected }: NodeProps<StartupFlowNode>) {
  const config = CATEGORY_CONFIG[data.category] ?? CATEGORY_CONFIG.operations;
  const phase = getPhaseForCategory(data.category);
  const tools = parseJson<ToolRecommendation[]>(data.tools, []);
  const tasks = parseTasks(data.tasks);

  return (
    <div
      className={cn(
        "w-[264px] overflow-hidden rounded-xl border bg-white shadow-xl transition-all duration-200",
        config.border,
        selected
          ? "scale-[1.03] ring-2 ring-white ring-offset-2 ring-offset-navy-900"
          : "hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
      )}
      onClick={() => data.onSelect?.(id)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-navy-900 !bg-white"
      />

      <div className={cn("px-3.5 py-2.5", config.headerBg)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-white/15 text-[10px] font-bold text-white">
              {String(config.order).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70">
              {config.label}
            </span>
          </div>
          <StatusDot status={data.status} />
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-white">
          {data.title}
        </h3>
        {phase && (
          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-white/40">
            {phase.label} phase
          </p>
        )}
      </div>

      <div className="p-3.5">
        <div className="mb-1 flex items-center justify-between text-[10px]">
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            Progress
          </span>
          <span className="font-bold text-navy-700">{data.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-navy-700 transition-all duration-300"
            style={{ width: `${data.progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5 text-navy-600" />
            {tasks.length} steps
          </span>
          <span className="inline-flex items-center gap-1">
            <Wrench className="h-3.5 w-3.5 text-navy-600" />
            {tools.length} tools
          </span>
          {data.estimatedCost != null && (
            <span className="font-semibold text-navy-800">
              {formatCurrency(data.estimatedCost)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-[10px] font-semibold text-navy-700">
          {data.status === "completed" ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-navy-600" />
              Completed
            </>
          ) : (
            <>Click to view {tasks.length} steps</>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-navy-900 !bg-white"
      />
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const styles =
    status === "completed"
      ? "bg-white text-navy-900"
      : status === "in_progress"
        ? "bg-navy-400 text-white"
        : "bg-white/10 text-white/70";

  const label =
    status === "completed"
      ? "Done"
      : status === "in_progress"
        ? "Active"
        : "Pending";

  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide",
        styles
      )}
    >
      {label}
    </span>
  );
}
