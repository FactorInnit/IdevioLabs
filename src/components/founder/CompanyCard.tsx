"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { AnimatedGauge } from "./AnimatedGauge";
import {
  computeCompanyMetrics,
  formatValuation,
} from "@/lib/founder-metrics";
import { cn } from "@/lib/utils";

interface CompanyCardProps {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  budget: number | null;
  updatedAt: string;
  nodes?: { progress: number; category: string }[];
}

export function CompanyCard({
  id,
  name,
  description,
  progress,
  budget,
  updatedAt,
  nodes,
}: CompanyCardProps) {
  const metrics = computeCompanyMetrics({
    id,
    name,
    progress,
    budget,
    updatedAt,
    nodes,
  });

  return (
    <Link href={`/company/${id}?module=workspace`}>
      <GlassCard className="group relative overflow-hidden p-6">
        <div className="founder-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-navy-900/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-700">
                {metrics.readinessLabel}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                {metrics.launchProbability}% launch prob.
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-navy-900 transition group-hover:text-navy-700">
              {name}
            </h3>
            {description && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-navy-600" />
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric label="Health" value={`${metrics.healthScore}`} suffix="/100" />
          <Metric label="Progress" value={`${progress}`} suffix="%" />
          <Metric label="Valuation" value={formatValuation(metrics.valuationEstimate)} />
          <Metric
            label="Updated"
            value={formatDistanceToNow(new Date(updatedAt), { addSuffix: false })}
            small
          />
        </div>

        <div className="relative mt-4">
          <div className="mb-1 flex justify-between text-[10px] text-slate-400">
            <span>Completion</span>
            <span>{metrics.completionScore}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-navy-900/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-navy-800 to-navy-400 transition-all duration-700"
              style={{ width: `${metrics.completionScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Next: <span className="font-medium text-navy-800">{metrics.nextMilestone}</span>
          </p>
        </div>
      </GlassCard>
    </Link>
  );
}

function Metric({
  label,
  value,
  suffix,
  small,
}: {
  label: string;
  value: string;
  suffix?: string;
  small?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={cn("font-display font-bold text-navy-900", small ? "text-sm" : "text-lg")}>
        {value}
        {suffix && <span className="text-sm font-normal text-slate-400">{suffix}</span>}
      </p>
    </div>
  );
}

export function HealthScorePanel(props: CompanyCardProps) {
  const metrics = computeCompanyMetrics(props);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <AnimatedGauge
          value={metrics.healthScore}
          label="Startup Readiness"
          sublabel={metrics.readinessLabel}
          size={140}
        />
        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3">
          {Object.entries(metrics.breakdown).map(([key, val], i) => (
            <ScoreBar
              key={key}
              label={formatBreakdownLabel(key)}
              value={val}
              delay={i * 60}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function ScoreBar({
  label,
  value,
  delay,
}: {
  label: string;
  value: number;
  delay: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium capitalize text-navy-800">{label}</span>
        <span className="tabular-nums text-slate-500">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-navy-900/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-navy-800 to-navy-400 transition-all duration-700"
          style={{ width: `${value}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

function formatBreakdownLabel(key: string): string {
  const labels: Record<string, string> = {
    businessModel: "Business Model",
    market: "Market",
    execution: "Execution",
    competition: "Competition",
    team: "Team",
    defensibility: "Defensibility",
    virality: "Virality",
    funding: "Funding",
  };
  return labels[key] ?? key;
}
