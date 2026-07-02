"use client";

import {
  AlertTriangle,
  ExternalLink,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { RevenueSimulator } from "./RevenueSimulator";
import {
  collectProjectTools,
  totalEstimatedCost,
} from "@/lib/project-utils";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { NodeCategory } from "@/lib/types";

interface FinanceDashboardModuleProps {
  project: {
    budget: number | null;
    budgetNotes: string | null;
    nodes: {
      id: string;
      title: string;
      category: string;
      tools: string;
      estimatedCost: number | null;
      progress: number;
    }[];
  };
}

export function FinanceDashboardModule({ project }: FinanceDashboardModuleProps) {
  const total = totalEstimatedCost(project.nodes);
  const budget = project.budget;
  const hasBudget = budget != null && budget > 0;
  const remaining = hasBudget ? budget - total : null;
  const over = hasBudget && total > budget;
  const tools = collectProjectTools(project.nodes);

  const allocations = project.nodes
    .filter((n) => (n.estimatedCost ?? 0) > 0)
    .map((n) => {
      const cat = CATEGORY_CONFIG[n.category as NodeCategory];
      return {
        id: n.id,
        title: n.title,
        cost: n.estimatedCost ?? 0,
        progress: n.progress,
        color: cat?.minimap ?? "#081a3a",
        category: cat?.shortLabel ?? n.category,
      };
    })
    .sort((a, b) => b.cost - a.cost);

  const maxCost = Math.max(...allocations.map((a) => a.cost), 1);

  return (
    <div className="space-y-8">
      {/* Budget overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total Budget"
          value={hasBudget ? formatCurrency(budget) : "Not set"}
          hint={hasBudget ? "Your starting capital" : "Set budget in workspace"}
        />
        <StatCard
          icon={PieChart}
          label="Allocated"
          value={formatCurrency(total)}
          hint={`Across ${project.nodes.length} blocks`}
        />
        <StatCard
          icon={over ? TrendingDown : TrendingUp}
          label={over ? "Over Budget" : "Remaining"}
          value={
            hasBudget
              ? formatCurrency(over ? total - budget : remaining!)
              : "—"
          }
          highlight={over ? "danger" : "success"}
          hint={over ? "Review high-cost blocks" : "Available to spend"}
        />
        <StatCard
          icon={Wrench}
          label="Recommended Tools"
          value={String(tools.length)}
          hint="Budget-matched picks"
        />
      </div>

      {project.budgetNotes && (
        <GlassCard className="border-l-4 border-l-navy-600 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            AI budget guidance
          </p>
          <p className="mt-2 text-sm leading-relaxed text-navy-900">
            {project.budgetNotes}
          </p>
        </GlassCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Allocation breakdown */}
        <GlassCard className="p-6" hover={false}>
          <h3 className="font-display text-lg font-bold text-navy-900">
            Budget by block
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Where your money goes across the roadmap
          </p>
          <div className="mt-6 space-y-4">
            {allocations.length === 0 ? (
              <p className="text-sm text-slate-400">No cost estimates yet.</p>
            ) : (
              allocations.map((a) => (
                <div key={a.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-900">
                        {a.title}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        {a.category} · {a.progress}% done
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-navy-800">
                      {formatCurrency(a.cost)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-navy-900/6">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(a.cost / maxCost) * 100}%`,
                        backgroundColor: a.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          {over && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Over budget by {formatCurrency(total - budget!)}. Trim tools or raise capital.
            </div>
          )}
        </GlassCard>

        {/* Recommended tools */}
        <GlassCard className="p-6" hover={false}>
          <h3 className="font-display text-lg font-bold text-navy-900">
            Recommended tools
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Picked for your budget and startup stage
          </p>
          <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {tools.length === 0 ? (
              <p className="text-sm text-slate-400">Generate a roadmap to see tools.</p>
            ) : (
              tools.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-xl border border-navy-900/6 bg-white/80 p-4 transition hover:border-navy-300/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy-900">{tool.name}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {tool.block}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-navy-900/8 px-2 py-0.5 text-[10px] font-bold text-navy-700">
                      {tool.pricing}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {tool.purpose}
                  </p>
                  {tool.url && (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:underline"
                    >
                      Visit tool
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-navy-900">
          Revenue simulator
        </h3>
        <RevenueSimulator />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  highlight?: "danger" | "success";
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900/8">
          <Icon className="h-4 w-4 text-navy-700" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
      <p
        className={`mt-3 font-display text-2xl font-bold ${
          highlight === "danger"
            ? "text-red-600"
            : highlight === "success"
              ? "text-emerald-700"
              : "text-navy-900"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </GlassCard>
  );
}
