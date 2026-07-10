"use client";

import { useEffect, useState } from "react";
import { Bot, Loader2, Shield, Sparkles } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { AnimatedProgressBar } from "./AnimatedProgressBar";
import { BetaUpgradeLink } from "@/components/BetaUpgradeLink";
import {
  FREE_AI_MESSAGES_PER_MONTH,
  FREE_VALIDATOR_RUNS_PER_MONTH,
} from "@/lib/usage-constants";
import { cn } from "@/lib/utils";

interface UsageSummary {
  ai: { used: number; limit: number; remaining: number };
  validator: { used: number; limit: number; remaining: number };
}

function usagePct(used: number, limit: number): number {
  if (limit === Infinity || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function UsageRow({
  icon: Icon,
  label,
  used,
  limit,
  remaining,
}: {
  icon: typeof Bot;
  label: string;
  used: number;
  limit: number;
  remaining: number;
}) {
  const pct = usagePct(used, limit);
  const low = remaining <= Math.max(1, Math.floor(limit * 0.2));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-navy-600" />
          <span className="text-xs font-semibold text-navy-900">{label}</span>
        </div>
        <span
          className={cn(
            "text-xs tabular-nums",
            low ? "font-semibold text-amber-700" : "text-slate-500"
          )}
        >
          {used} / {limit} used
        </span>
      </div>
      <AnimatedProgressBar value={pct} className={low ? "opacity-100" : undefined} />
    </div>
  );
}

export function UsageLimitsPanel({
  planId,
  compact = false,
  className,
}: {
  planId: string;
  compact?: boolean;
  className?: string;
}) {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planId !== "free") {
      setLoading(false);
      return;
    }

    fetch("/api/usage")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<UsageSummary>;
      })
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [planId]);

  if (planId !== "free") return null;

  if (loading) {
    return (
      <GlassCard className={cn("flex justify-center py-6", className)} hover={false}>
        <Loader2 className="h-5 w-5 animate-spin text-navy-600" />
      </GlassCard>
    );
  }

  if (!summary) return null;

  const aiRemaining =
    summary.ai.remaining === Infinity ? FREE_AI_MESSAGES_PER_MONTH : summary.ai.remaining;
  const validatorRemaining =
    summary.validator.remaining === Infinity
      ? FREE_VALIDATOR_RUNS_PER_MONTH
      : summary.validator.remaining;
  const atLimit = aiRemaining === 0 || validatorRemaining === 0;

  if (compact) {
    return (
      <div className={cn("rounded-xl border border-navy-900/8 bg-navy-50/80 p-3", className)}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Free plan usage
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
          AI coach{" "}
          <span className="font-semibold text-navy-900">
            {summary.ai.used}/{FREE_AI_MESSAGES_PER_MONTH}
          </span>
          {" · "}
          Validator{" "}
          <span className="font-semibold text-navy-900">
            {summary.validator.used}/{FREE_VALIDATOR_RUNS_PER_MONTH}
          </span>
        </p>
        {atLimit && (
          <BetaUpgradeLink className="mt-2 inline-flex text-[11px] font-semibold text-navy-700 hover:text-navy-900">
            Register interest in Pro →
          </BetaUpgradeLink>
        )}
      </div>
    );
  }

  return (
    <GlassCard className={cn("p-5", className)} hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Free plan limits
          </p>
          <h3 className="mt-1 font-display font-bold text-navy-900">Monthly usage</h3>
        </div>
        <BetaUpgradeLink className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-navy-800">
          <Sparkles className="h-3.5 w-3.5" />
          Register interest in Pro
        </BetaUpgradeLink>
      </div>

      <div className="mt-5 space-y-4">
        <UsageRow
          icon={Bot}
          label="AI coach messages"
          used={summary.ai.used}
          limit={FREE_AI_MESSAGES_PER_MONTH}
          remaining={aiRemaining}
        />
        <UsageRow
          icon={Shield}
          label="Validator runs"
          used={summary.validator.used}
          limit={FREE_VALIDATOR_RUNS_PER_MONTH}
          remaining={validatorRemaining}
        />
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Pro unlocks unlimited AI coach chats, validator runs, daily habits, competitor intel, CEO
        review, and investor exports.
      </p>
    </GlassCard>
  );
}
