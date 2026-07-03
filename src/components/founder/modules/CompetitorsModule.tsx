"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Plus,
  RefreshCw,
  Swords,
  Target,
  Zap,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import type { CompetitorsReport } from "@/lib/company-research";

export function CompetitorsModule({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [report, setReport] = useState<CompetitorsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/company/${projectId}/competitors`);
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

  const addToRoadmap = async (
    title: string,
    description: string,
    tasks: { title: string; detail?: string }[]
  ) => {
    setAdding(title);
    await fetch(`/api/projects/${projectId}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "marketing",
        title,
        description,
        tasks,
      }),
    });
    setAdded((prev) => new Set(prev).add(title));
    setAdding(null);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-navy-700" />
        <p className="mt-4 text-sm text-slate-500">Deep-diving into your competitive landscape…</p>
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

  return (
    <div className="space-y-8">
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-navy-700" />
              <h2 className="font-display text-xl font-bold text-navy-900">
                Competitive intelligence report
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{report.summary}</p>
            {report.source === "ai" ? (
              <span className="mt-3 inline-block rounded-full bg-violet-50 px-3 py-1 text-[10px] font-semibold text-violet-800">
                AI research report
              </span>
            ) : (
              <span className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold text-amber-800">
                Research preview — add OPENAI_API_KEY for live AI
              </span>
            )}
          </div>
          <button
            onClick={load}
            className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold text-navy-700"
          >
            <RefreshCw className="mr-1 inline h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-3">
        {report.competitors.map((c) => (
          <GlassCard key={c.name} className="overflow-hidden p-0" hover={false}>
            <div className="bg-navy-900 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
                  {c.name.charAt(0)}
                </div>
                <h3 className="font-display text-lg font-bold text-white">{c.name}</h3>
              </div>
            </div>
            <div className="p-5">
              <dl className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Funding", c.funding],
                  ["Team", c.employees],
                  ["Pricing", c.pricing],
                  ["Traffic", c.traffic],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-navy-900/5 px-2 py-1.5">
                    <dt className="text-slate-400">{k}</dt>
                    <dd className="font-semibold text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-slate-500">
                <span className="font-semibold">Moat:</span> {c.moat}
              </p>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-3">
                <p className="text-[10px] font-bold uppercase text-red-700">
                  Where they lack — your opening
                </p>
                <ul className="mt-2 space-y-1.5">
                  {c.weaknesses.map((w) => (
                    <li key={w} className="text-xs text-slate-700">
                      ✗ {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Their strengths</p>
                <ul className="mt-1 space-y-1">
                  {c.strengths.map((s) => (
                    <li key={s} className="text-xs text-slate-600">
                      + {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="border-l-4 border-l-navy-700 p-6" hover={false}>
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-navy-700" />
          <h3 className="font-display text-lg font-bold text-navy-900">
            How to beat them — actionable playbook
          </h3>
        </div>
        <p className="mt-3 rounded-xl bg-navy-900/5 p-4 text-sm font-medium text-navy-800">
          {report.positioning}
        </p>
        <div className="mt-6 space-y-5">
          {report.beatStrategy.map((strategy) => (
            <div key={strategy.title} className="rounded-xl border border-navy-900/8 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display font-bold text-navy-900">{strategy.title}</h4>
                <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">
                  {strategy.timeline}
                </span>
              </div>
              <ol className="mt-3 space-y-3">
                {strategy.steps.map((step) => (
                  <li
                    key={step}
                    className="flex items-start justify-between gap-3 rounded-lg bg-navy-900/5 p-3"
                  >
                    <span className="text-sm text-slate-700">{step}</span>
                    <button
                      onClick={() =>
                        addToRoadmap(strategy.title, step, [
                          { title: step, detail: `From competitor strategy: ${strategy.title}` },
                        ])
                      }
                      disabled={adding === strategy.title || added.has(strategy.title)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-navy-900 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50"
                    >
                      {added.has(strategy.title) ? (
                        <>
                          <Check className="h-3 w-3" /> Added
                        </>
                      ) : adding === strategy.title ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-3 w-3" /> Add to roadmap
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ol>
              <button
                onClick={() =>
                  addToRoadmap(
                    strategy.title,
                    `Full strategy: ${strategy.title}`,
                    strategy.steps.map((s) => ({ title: s }))
                  )
                }
                disabled={adding === strategy.title || added.has(`${strategy.title}-all`)}
                className="mt-3 text-xs font-semibold text-navy-700 hover:underline"
              >
                Add entire strategy as roadmap block →
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-navy-600" />
            <h3 className="font-display font-bold text-navy-900">Your differentiation</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {report.differentiation.map((d) => (
              <li key={d} className="rounded-lg bg-emerald-50/60 p-3 text-sm text-slate-700">
                ⚡ {d}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard className="p-6" hover={false}>
          <h3 className="font-display font-bold text-navy-900">Opportunities & threats</h3>
          <p className="mt-3 text-[10px] font-bold uppercase text-emerald-700">Opportunities</p>
          <ul className="mt-1 space-y-1">
            {report.opportunities.map((o) => (
              <li key={o} className="text-sm text-slate-600">
                + {o}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[10px] font-bold uppercase text-red-600">Threats</p>
          <ul className="mt-1 space-y-1">
            {report.threats.map((t) => (
              <li key={t} className="text-sm text-slate-600">
                − {t}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
