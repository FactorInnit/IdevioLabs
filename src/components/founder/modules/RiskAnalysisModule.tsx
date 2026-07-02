"use client";

import { GlassCard } from "../GlassCard";
import { AlertTriangle } from "lucide-react";

const RISKS = [
  { area: "Competition", prob: 72, impact: 85, mitigation: "Differentiate on AI + B2B" },
  { area: "Funding", prob: 58, impact: 90, mitigation: "Extend runway via revenue" },
  { area: "Execution", prob: 45, impact: 78, mitigation: "Hire senior eng lead" },
  { area: "Legal", prob: 32, impact: 65, mitigation: "Health data compliance audit" },
  { area: "Technology", prob: 40, impact: 70, mitigation: "Architecture review Q2" },
  { area: "Hiring", prob: 55, impact: 60, mitigation: "Remote-first talent pool" },
];

export function RiskAnalysisModule() {
  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">AI Risk Analysis</h2>
            <p className="text-sm text-slate-500">Probability × impact matrix</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RISKS.map((r) => (
          <GlassCard key={r.area} className="p-5">
            <h3 className="font-display font-semibold text-navy-900">{r.area}</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase text-slate-400">Probability</p>
                <p className="font-display text-xl font-bold text-navy-900">{r.prob}%</p>
                <div className="mt-1 h-1 rounded-full bg-navy-900/8">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${r.prob}%` }} />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400">Impact</p>
                <p className="font-display text-xl font-bold text-navy-900">{r.impact}%</p>
                <div className="mt-1 h-1 rounded-full bg-navy-900/8">
                  <div className="h-full rounded-full bg-red-400" style={{ width: `${r.impact}%` }} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              <span className="font-semibold text-navy-800">Mitigation:</span> {r.mitigation}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
