"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { CATEGORY_CONFIG, WORKFLOW_PHASES } from "@/lib/constants";
import { parseNodeTasks } from "@/lib/project-utils";
import { formatCurrency } from "@/lib/utils";
import type { NodeCategory } from "@/lib/types";
import type { CompanyProject } from "../CompanyWorkspace";

type ColumnId = "now" | "next" | "later" | "done";

interface RoadmapItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  phase: string;
  status: string;
  progress: number;
  estimatedCost: number | null;
  taskCount: number;
  completedTasks: number;
  description: string;
}

function classifyNode(node: CompanyProject["nodes"][0]): ColumnId {
  if (node.status === "completed" || node.progress >= 100) return "done";
  if (node.status === "in_progress" || node.progress > 0) return "now";
  if (node.progress === 0) return "next";
  return "later";
}

export function RoadmapModule({ project }: { project: CompanyProject }) {
  const items = useMemo((): RoadmapItem[] => {
    return project.nodes.map((node) => {
      const cat = CATEGORY_CONFIG[node.category as NodeCategory];
      const tasks = parseNodeTasks(node.tasks);
      const phase = WORKFLOW_PHASES.find((p) =>
        p.categories.includes(node.category as NodeCategory)
      );
      return {
        id: node.id,
        title: node.title,
        category: node.category,
        categoryLabel: cat?.shortLabel ?? node.category,
        phase: phase?.label ?? "Build",
        status: node.status,
        progress: node.progress,
        estimatedCost: node.estimatedCost,
        taskCount: tasks.length,
        completedTasks: Math.round((node.progress / 100) * tasks.length),
        description: node.description,
      };
    });
  }, [project.nodes]);

  const columns: { id: ColumnId; label: string; sub: string; color: string }[] = [
    { id: "now", label: "Now", sub: "In progress", color: "bg-navy-800" },
    { id: "next", label: "Next", sub: "Up next", color: "bg-navy-500" },
    { id: "later", label: "Later", sub: "Queued", color: "bg-slate-400" },
    { id: "done", label: "Completed", sub: "Shipped", color: "bg-emerald-600" },
  ];

  const grouped = columns.map((col) => ({
    ...col,
    items: items.filter((i) => classifyNode(project.nodes.find((n) => n.id === i.id)!) === col.id),
  }));

  const totalTasks = items.reduce((s, i) => s + i.taskCount, 0);
  const doneTasks = items.reduce((s, i) => s + i.completedTasks, 0);

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Roadmap blocks", value: project.nodes.length },
          { label: "Overall progress", value: `${project.progress}%` },
          { label: "Tasks tracked", value: totalTasks },
          { label: "Tasks done", value: doneTasks },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {s.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-navy-900">{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Phase timeline */}
      <GlassCard className="p-6" hover={false}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Execution phases
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {WORKFLOW_PHASES.map((phase) => {
            const phaseNodes = items.filter((i) =>
              phase.categories.includes(i.category as NodeCategory)
            );
            const avg =
              phaseNodes.length > 0
                ? Math.round(
                    phaseNodes.reduce((s, n) => s + n.progress, 0) / phaseNodes.length
                  )
                : 0;
            return (
              <div
                key={phase.id}
                className="rounded-xl border border-navy-900/6 bg-white/60 p-4"
              >
                <p className="text-[10px] font-bold text-navy-400">{phase.step}</p>
                <p className="font-display font-semibold text-navy-900">{phase.label}</p>
                <p className="mt-1 text-xs text-slate-500">{phase.description}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-900/8">
                  <div
                    className="h-full rounded-full bg-navy-700 transition-all"
                    style={{ width: `${avg}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">{avg}% · {phaseNodes.length} blocks</p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Kanban */}
      <div className="grid gap-4 lg:grid-cols-4">
        {grouped.map((col) => (
          <div key={col.id} className="min-w-0">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${col.color}`} />
              <h3 className="font-display text-sm font-bold text-navy-900">{col.label}</h3>
              <span className="rounded-full bg-navy-900/8 px-2 py-0.5 text-[10px] font-bold text-navy-600">
                {col.items.length}
              </span>
              <span className="text-[10px] text-slate-400">{col.sub}</span>
            </div>
            <div className="space-y-3">
              {col.items.length === 0 ? (
                <GlassCard className="border-dashed p-6 text-center" hover={false}>
                  <p className="text-xs text-slate-400">Nothing here yet</p>
                </GlassCard>
              ) : (
                col.items.map((item) => (
                  <RoadmapCard key={item.id} item={item} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapCard({ item }: { item: RoadmapItem }) {
  const StatusIcon =
    item.progress >= 100
      ? CheckCircle2
      : item.progress > 0
        ? Loader2
        : item.status === "in_progress"
          ? Clock
          : Circle;

  return (
    <GlassCard className="p-4" hover={false}>
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-navy-900/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-700">
          {item.categoryLabel}
        </span>
        <StatusIcon
          className={`h-4 w-4 shrink-0 ${
            item.progress >= 100
              ? "text-emerald-600"
              : item.progress > 0
                ? "animate-spin text-navy-600"
                : "text-slate-300"
          }`}
        />
      </div>
      <h4 className="mt-2 font-display text-sm font-bold leading-snug text-navy-900">
        {item.title}
      </h4>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {item.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
        <span>{item.phase}</span>
        {item.estimatedCost != null && item.estimatedCost > 0 && (
          <span className="font-semibold text-navy-700">
            {formatCurrency(item.estimatedCost)}
          </span>
        )}
        {item.taskCount > 0 && (
          <span>
            {item.completedTasks}/{item.taskCount} tasks
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px]">
          <span className="text-slate-400">Progress</span>
          <span className="font-semibold text-navy-800">{item.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-navy-900/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-navy-800 to-navy-400"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
