"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { AnimatedGauge, ScoreBar } from "../AnimatedGauge";
import { RadarChart } from "../charts/RadarChart";
import type { ValidatorReport } from "@/lib/company-research";

export function ValidatorModule({ projectId }: { projectId: string }) {
  const [report, setReport] = useState<ValidatorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/company/${projectId}/validator`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load report");
      setReport(data.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-navy-700" />
        <p className="mt-4 text-sm text-slate-500">AI researching your startup in depth…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <GlassCard className="p-8 text-center" hover={false}>
        <p className="text-red-600">{error || "No report"}</p>
        <button onClick={load} className="mt-4 text-sm font-semibold text-navy-700">
          Retry
        </button>
      </GlassCard>
    );
  }

  const avgConfidence =
    report.dimensions.length > 0
      ? Math.round(
          report.dimensions.reduce((s, d) => s + d.confidence, 0) / report.dimensions.length
        )
      : 0;

  return (
    <div className="space-y-8">
      <GlassCard className="p-6" hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              AI Startup Validator — Deep Research Report
            </p>
            <h2 className="font-display text-2xl font-bold text-navy-900">{report.verdict}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{report.summary}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {report.source === "ai" ? (
                <span className="rounded-full bg-violet-50 px-3 py-1 font-semibold text-violet-800">
                  AI research report
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-800">
                  Research preview — add OPENAI_API_KEY for live AI
                </span>
              )}
              <span className="rounded-full bg-navy-900/8 px-3 py-1 font-semibold text-navy-800">
                {avgConfidence}% avg confidence
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
                {report.pros.length} strengths
              </span>
              <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                {report.cons.length} weaknesses
              </span>
            </div>
          </div>
          <AnimatedGauge value={report.overallScore} label="Overall score" size={140} />
        </div>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-navy-700 hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate full report
        </button>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" hover={false}>
          <h3 className="mb-4 font-display font-bold text-navy-900">Score radar</h3>
          <RadarChart
            labels={report.dimensions.map((d) => d.label)}
            values={report.dimensions.map((d) => d.score)}
          />
        </GlassCard>
        <GlassCard className="p-6" hover={false}>
          <h3 className="mb-4 font-display font-bold text-navy-900">Dimension breakdown</h3>
          <div className="space-y-4">
            {report.dimensions.map((d, i) => (
              <div key={d.label}>
                <ScoreBar label={d.label} value={d.score} delay={i * 30} />
                <p className="mt-1 text-[10px] text-slate-400">{d.confidence}% confidence</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {report.dimensions.map((d) => (
          <GlassCard key={d.label} className="p-5" hover={false}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-navy-900">{d.label}</h4>
              <span className="font-display text-2xl font-bold text-navy-800">{d.score}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{d.analysis}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" hover={false}>
          <div className="mb-4 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display font-bold text-navy-900">Pros — why this can work</h3>
          </div>
          <ul className="space-y-3">
            {report.pros.map((p) => (
              <li
                key={p}
                className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-sm text-slate-700"
              >
                <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-600" />
                {p}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard className="p-6" hover={false}>
          <div className="mb-4 flex items-center gap-2">
            <ThumbsDown className="h-5 w-5 text-red-500" />
            <h3 className="font-display font-bold text-navy-900">Cons — what could kill it</h3>
          </div>
          <ul className="space-y-3">
            {report.cons.map((c) => (
              <li
                key={c}
                className="rounded-xl border border-red-100 bg-red-50/40 p-3 text-sm text-slate-700"
              >
                <AlertTriangle className="mr-2 inline h-4 w-4 text-red-400" />
                {c}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="p-6" hover={false}>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-navy-700" />
          <h3 className="font-display font-bold text-navy-900">How to improve — prioritized actions</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {report.improvements.map((imp, i) => (
            <div key={i} className="rounded-xl border border-navy-900/6 bg-white/80 p-4">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  imp.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : "bg-navy-100 text-navy-700"
                }`}
              >
                {imp.priority}
              </span>
              <p className="mt-2 font-semibold text-navy-900">{imp.action}</p>
              <p className="mt-1 text-sm text-slate-600">{imp.impact}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: "TAM", value: report.tamSamSom.tam, pct: 100 },
          { label: "SAM", value: report.tamSamSom.sam, pct: 65 },
          { label: "SOM", value: report.tamSamSom.som, pct: 35 },
        ].map((m) => (
          <GlassCard key={m.label} className="p-6" hover={false}>
            <p className="text-xs font-semibold uppercase text-slate-400">{m.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-navy-900">{m.value}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-navy-900/8">
              <div
                className="h-full rounded-full bg-navy-600"
                style={{ width: `${m.pct}%` }}
              />
            </div>
          </GlassCard>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-slate-500">{report.tamSamSom.notes}</p>

      <GlassCard className="border-l-4 border-l-red-400 p-6" hover={false}>
        <h3 className="font-display font-bold text-navy-900">Key risks to monitor</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {report.risks.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-slate-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              {r}
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
