"use client";

import { AlertTriangle, CheckCircle2, PieChart, Wallet } from "lucide-react";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import type { NodeCategory, WorkflowNodeData } from "@/lib/types";

export function FinancialBreakdown({
  budget,
  nodes,
}: {
  budget: number | null;
  nodes: WorkflowNodeData[];
}) {
  const items = nodes
    .map((n) => {
      const config =
        CATEGORY_CONFIG[n.category as NodeCategory] ?? CATEGORY_CONFIG.operations;
      return {
        id: n.id,
        label: n.title,
        category: config.shortLabel,
        cost: n.estimatedCost ?? 0,
        color: config.minimap === "#ffffff" ? "#3b5998" : config.minimap,
      };
    })
    .sort((a, b) => b.cost - a.cost);

  const total = items.reduce((s, i) => s + i.cost, 0);
  const hasBudget = budget != null && budget > 0;
  const over = hasBudget && total > budget;
  const remaining = hasBudget ? budget - total : 0;
  const denom = hasBudget ? Math.max(budget, total) : total || 1;

  // Which blocks push it over budget (cumulative beyond the budget line).
  const overContributors: { label: string; cost: number }[] = [];
  if (over) {
    let running = 0;
    for (const item of items) {
      if (item.cost <= 0) continue;
      running += item.cost;
      if (running > budget) {
        overContributors.push({ label: item.label, cost: item.cost });
      }
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
          <PieChart className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-navy-950">Financial plan</h3>
          <p className="text-xs text-slate-500">Where your money is going</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        <Stat
          label="Budget"
          value={hasBudget ? formatCurrency(budget) : "Not set"}
          icon={<Wallet className="h-3.5 w-3.5 text-slate-400" />}
        />
        <Stat label="Allocated" value={formatCurrency(total)} />
        <Stat
          label={over ? "Over by" : "Remaining"}
          value={
            hasBudget
              ? over
                ? formatCurrency(total - budget)
                : formatCurrency(remaining)
              : "—"
          }
          tone={over ? "danger" : hasBudget ? "success" : "muted"}
        />
      </div>

      <div className="px-5 py-4">
        {/* Segmented budget usage bar */}
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>Budget usage</span>
          {hasBudget && (
            <span className={over ? "text-red-600" : "text-navy-700"}>
              {Math.round((total / budget) * 100)}% used
            </span>
          )}
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
          {items
            .filter((i) => i.cost > 0)
            .map((i) => (
              <div
                key={i.id}
                title={`${i.label}: ${formatCurrency(i.cost)}`}
                style={{
                  width: `${(i.cost / denom) * 100}%`,
                  backgroundColor: i.color,
                }}
              />
            ))}
          {hasBudget && !over && remaining > 0 && (
            <div
              className="bg-slate-200"
              style={{ width: `${(remaining / denom) * 100}%` }}
              title={`Unallocated: ${formatCurrency(remaining)}`}
            />
          )}
        </div>

        {/* Overage / healthy note */}
        {over ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  You&apos;re {formatCurrency(total - budget)} over your{" "}
                  {formatCurrency(budget!)} budget.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-red-700">
                  The costs pushing you over budget are{" "}
                  {overContributors
                    .map((c) => `${c.label} (${formatCurrency(c.cost)})`)
                    .join(", ") || "your higher-cost blocks"}
                  . Consider deferring these, switching to free alternatives, or
                  raising your budget. New roadmaps are auto-trimmed to fit your
                  budget.
                </p>
              </div>
            </div>
          </div>
        ) : hasBudget ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-navy-200 bg-navy-50 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-navy-700" />
            <p className="text-xs leading-relaxed text-navy-900">
              Your plan fits within budget with {formatCurrency(remaining)} to spare.
              Keep this buffer for unexpected costs.
            </p>
          </div>
        ) : null}

        {/* Per-block breakdown */}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Cost by block
          </p>
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: i.color }}
              />
              <span className="w-20 shrink-0 truncate text-xs font-medium text-slate-500">
                {i.category}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${total > 0 ? (i.cost / total) * 100 : 0}%`,
                    backgroundColor: i.color,
                  }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-xs font-semibold text-navy-900">
                {formatCurrency(i.cost)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger" | "muted";
  icon?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "mt-1 text-lg font-bold",
          tone === "danger"
            ? "text-red-600"
            : tone === "success"
              ? "text-navy-700"
              : tone === "muted"
                ? "text-slate-400"
                : "text-navy-950"
        )}
      >
        {value}
      </p>
    </div>
  );
}
