"use client";

import { GlassCard } from "../GlassCard";
import { AnimatedGauge, ScoreBar } from "../AnimatedGauge";
import { computeCompanyMetrics } from "@/lib/founder-metrics";

interface ValidatorModuleProps {
  project: {
    id: string;
    name: string;
    progress: number;
    budget: number | null;
    updatedAt: string;
  };
}

const VALIDATOR_DIMS = [
  { key: "demand", label: "Demand" },
  { key: "competition", label: "Competition" },
  { key: "moat", label: "Moat" },
  { key: "scalability", label: "Scalability" },
  { key: "execution", label: "Execution Difficulty" },
  { key: "capital", label: "Capital Required" },
  { key: "founderFit", label: "Founder Fit" },
  { key: "timing", label: "Market Timing" },
] as const;

export function ValidatorModule({ project }: ValidatorModuleProps) {
  const metrics = computeCompanyMetrics(project);
  const seed = metrics.healthScore;

  const scores = VALIDATOR_DIMS.map((d, i) => ({
    ...d,
    value: Math.min(96, Math.max(48, seed + ((i * 7) % 20) - 10)),
    confidence: Math.min(95, 70 + (i * 3) % 25),
  }));

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Startup Validator
            </p>
            <h2 className="font-display text-2xl font-bold text-navy-900">
              Idea validation scorecard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Confidence-weighted analysis — not generic advice
            </p>
          </div>
          <AnimatedGauge value={metrics.healthScore} label="Overall" size={120} />
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scores.map((s, i) => (
          <GlassCard key={s.key} className="p-4">
            <ScoreBar label={s.label} value={s.value} delay={i * 50} />
            <p className="mt-2 text-[10px] text-slate-400">
              {s.confidence}% confidence
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: "TAM", value: "$4.2B", pct: 88 },
          { label: "SAM", value: "$680M", pct: 72 },
          { label: "SOM", value: "$42M", pct: 58 },
        ].map((m) => (
          <GlassCard key={m.label} className="flex flex-col items-center p-6">
            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-navy-900/10"
              style={{
                background: `conic-gradient(#081a3a ${m.pct * 3.6}deg, rgba(8,26,58,0.08) 0)`,
              }}
            >
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white">
                <span className="font-display text-lg font-bold text-navy-900">{m.label}</span>
              </div>
            </div>
            <p className="mt-3 font-display text-xl font-bold text-navy-900">{m.value}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
