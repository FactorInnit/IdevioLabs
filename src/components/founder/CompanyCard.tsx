"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  Map,
  Shield,
  Swords,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { GlassCard } from "./GlassCard";
import { AnimatedGauge, ScoreBar } from "./AnimatedGauge";
import {
  computeCompanyMetrics,
  formatValuation,
} from "@/lib/founder-metrics";
import { companyModuleHref } from "@/lib/founder-nav";
import { CompanyVisionQuote } from "./CompanyVisionQuote";
import { cn } from "@/lib/utils";

interface CompanyCardProps {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  budget: number | null;
  updatedAt: string;
  nodes?: {
    id?: string;
    title?: string;
    progress: number;
    category: string;
    status?: string;
  }[];
  memberCount?: number;
  habitPct?: number;
  weeklyReviewDone?: boolean;
  progressLogCount?: number;
  featured?: boolean;
  priority?: boolean;
}

const QUICK_LINKS = [
  { module: "workspace" as const, label: "Canvas", icon: Workflow },
  { module: "validator" as const, label: "Validate", icon: Shield },
  { module: "competitors" as const, label: "Compete", icon: Swords },
  { module: "roadmap" as const, label: "Roadmap", icon: Map },
];

export function CompanyCard({
  id,
  name,
  description,
  progress,
  budget,
  updatedAt,
  nodes,
  featured = false,
  priority = false,
}: CompanyCardProps) {
  const metrics = computeCompanyMetrics({
    id,
    name,
    progress,
    budget,
    updatedAt,
    nodes,
  });

  const healthColor =
    metrics.healthScore >= 80
      ? "from-emerald-500 to-emerald-400"
      : metrics.healthScore >= 65
        ? "from-navy-600 to-navy-400"
        : "from-amber-500 to-amber-400";

  return (
    <GlassCard
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        featured ? "p-0" : "p-6",
        priority && !featured && "ring-1 ring-navy-400/20"
      )}
      hover
    >
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b",
          healthColor
        )}
      />
      <div className="founder-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />

      {featured ? (
        <div className="relative grid lg:grid-cols-[1fr_auto]">
          <Link href={`/company/${id}?module=workspace`} className="block p-8 lg:p-10">
            <FeaturedHeader name={name} description={description} metrics={metrics} />
            <FeaturedMetrics metrics={metrics} progress={progress} updatedAt={updatedAt} />
          </Link>
          <div className="flex flex-col justify-between border-t border-navy-900/6 bg-navy-50/30 p-6 lg:min-w-[280px] lg:border-l lg:border-t-0">
            <div className="text-center lg:text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Health score
              </p>
              <p className="font-display text-5xl font-bold text-navy-900">
                {metrics.healthScore}
              </p>
              <p className="mt-1 text-xs text-slate-500">{metrics.readinessLabel}</p>
              <CompanyVisionQuote
                projectId={id}
                projectName={name}
                description={description}
              />
            </div>
            <QuickLinks id={id} className="mt-6" />
          </div>
        </div>
      ) : (
        <>
          <Link href={`/company/${id}?module=workspace`} className="relative block">
            <CardHeader name={name} description={description} metrics={metrics} />
            <CardMetrics metrics={metrics} progress={progress} updatedAt={updatedAt} />
          </Link>
          <QuickLinks id={id} className="relative mt-4 border-t border-navy-900/6 pt-4" compact />
        </>
      )}
    </GlassCard>
  );
}

function FeaturedHeader({
  name,
  description,
  metrics,
}: {
  name: string;
  description: string | null;
  metrics: ReturnType<typeof computeCompanyMetrics>;
}) {
  return (
    <div className="flex items-start gap-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-600 text-xl font-bold text-white shadow-lg shadow-navy-900/30">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {metrics.readinessLabel}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            <TrendingUp className="h-3 w-3" />
            {metrics.launchProbability}% launch prob.
          </span>
        </div>
        <h3 className="font-display text-2xl font-bold text-navy-900 transition group-hover:text-navy-700">
          {name}
        </h3>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      <ArrowUpRight className="hidden h-6 w-6 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-navy-600 sm:block" />
    </div>
  );
}

function CardHeader({
  name,
  description,
  metrics,
}: {
  name: string;
  description: string | null;
  metrics: ReturnType<typeof computeCompanyMetrics>;
}) {
  return (
    <div className="relative flex items-start justify-between gap-4 pl-3">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-navy-900/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-700">
            {metrics.readinessLabel}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            {metrics.launchProbability}%
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
  );
}

function FeaturedMetrics({
  metrics,
  progress,
  updatedAt,
}: {
  metrics: ReturnType<typeof computeCompanyMetrics>;
  progress: number;
  updatedAt: string;
}) {
  return (
    <div className="mt-8 pl-3">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Metric label="Progress" value={`${progress}`} suffix="%" large />
        <Metric label="Valuation" value={formatValuation(metrics.valuationEstimate)} large />
        <Metric label="Next milestone" value={metrics.nextMilestone} small wide />
        <Metric
          label="Updated"
          value={formatDistanceToNow(new Date(updatedAt), { addSuffix: false })}
          small
        />
      </div>
      <ProgressBar score={metrics.completionScore} milestone={metrics.nextMilestone} className="mt-6" />
    </div>
  );
}

function CardMetrics({
  metrics,
  progress,
  updatedAt,
}: {
  metrics: ReturnType<typeof computeCompanyMetrics>;
  progress: number;
  updatedAt: string;
}) {
  return (
    <div className="relative mt-6 pl-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Health" value={`${metrics.healthScore}`} suffix="/100" />
        <Metric label="Progress" value={`${progress}`} suffix="%" />
        <Metric label="Valuation" value={formatValuation(metrics.valuationEstimate)} />
        <Metric
          label="Updated"
          value={formatDistanceToNow(new Date(updatedAt), { addSuffix: false })}
          small
        />
      </div>
      <ProgressBar score={metrics.completionScore} milestone={metrics.nextMilestone} className="mt-4" />
    </div>
  );
}

function ProgressBar({
  score,
  milestone,
  className,
}: {
  score: number;
  milestone: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-[10px] text-slate-400">
        <span>Completion</span>
        <span>{score}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-navy-900/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-navy-800 via-navy-600 to-navy-400 transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Next: <span className="font-medium text-navy-800">{milestone}</span>
      </p>
    </div>
  );
}

function QuickLinks({
  id,
  className,
  compact,
}: {
  id: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {QUICK_LINKS.map((link) => (
        <Link
          key={link.module}
          href={companyModuleHref(id, link.module)}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-navy-900/8 bg-white/80 font-semibold text-navy-800 transition hover:border-navy-400/40 hover:bg-navy-50 hover:shadow-sm",
            compact ? "px-2.5 py-1.5 text-[10px]" : "px-3 py-2 text-xs"
          )}
        >
          <link.icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  suffix,
  small,
  large,
  wide,
}: {
  label: string;
  value: string;
  suffix?: string;
  small?: boolean;
  large?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={cn(
          "font-display font-bold text-navy-900",
          large ? "text-xl" : small ? "text-sm" : "text-lg",
          wide && "line-clamp-2"
        )}
      >
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
