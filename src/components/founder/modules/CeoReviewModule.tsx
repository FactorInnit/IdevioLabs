"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { AnimatedProgressBar } from "../AnimatedProgressBar";
import { fireConfetti } from "@/lib/celebrations";
import { todayHabitPct, type HabitsData } from "@/lib/habits-data";
import { cn } from "@/lib/utils";
import type { CompanyProject } from "../CompanyWorkspace";

interface WeeklyReview {
  id: string;
  wins: string;
  blockers: string;
  nextFocus: string;
  habitPct: number;
  progressPct: number;
  weekStart: string;
}

const STEPS = [
  { id: "wins", label: "Wins", prompt: "What went well this week? Celebrate momentum." },
  { id: "blockers", label: "Blockers", prompt: "What's slowing you down? Be honest." },
  { id: "nextFocus", label: "Next week", prompt: "One clear focus for the week ahead." },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function CeoReviewModule({
  project,
  userId: _userId,
}: {
  project: CompanyProject;
  userId: string;
}) {
  const [step, setStep] = useState(0);
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [habitPct, setHabitPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [existingReview, setExistingReview] = useState<WeeklyReview | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const progressPct = project.progress;
  const completedMilestones = useMemo(
    () => project.nodes.filter((n) => n.progress >= 100).length,
    [project.nodes]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewRes, habitsRes] = await Promise.all([
        fetch(`/api/projects/${project.id}/weekly-review`),
        fetch(`/api/projects/${project.id}/habits`),
      ]);

      if (habitsRes.ok) {
        const habits = (await habitsRes.json()) as HabitsData;
        setHabitPct(todayHabitPct(habits));
      }

      if (reviewRes.ok) {
        const data = await reviewRes.json();
        if (data.review) {
          setExistingReview(data.review);
          setWins(data.review.wins ?? "");
          setBlockers(data.review.blockers ?? "");
          setNextFocus(data.review.nextFocus ?? "");
          setDone(true);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    load();
  }, [load]);

  const currentStep = STEPS[step];
  const values: Record<StepId, string> = { wins, blockers, nextFocus };
  const setters: Record<StepId, (v: string) => void> = {
    wins: setWins,
    blockers: setBlockers,
    nextFocus: setNextFocus,
  };

  const canAdvance = values[currentStep.id].trim().length > 0;

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/weekly-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wins, blockers, nextFocus, habitPct, progressPct }),
      });
      if (!res.ok) throw new Error("Failed to save review");
      const data = await res.json();
      setExistingReview(data.review);
      setDone(true);
      setSubmitted(true);
      await fireConfetti("epic");
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-navy-700" />
        <p className="mt-4 text-sm text-slate-500">Loading your weekly review…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <GlassCard className="flex flex-col items-center py-16 text-center" hover={false}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Sparkles className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">Review saved</h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Your 15-minute CEO review is logged. Next week&apos;s focus:{" "}
          <span className="font-semibold text-navy-800">{nextFocus}</span>
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {done && existingReview && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Review completed this week</p>
            <p className="mt-1 text-xs text-emerald-800/80">
              You can update your answers below and resubmit anytime before the week ends.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-5" hover={false}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Project progress
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-navy-900">{progressPct}%</p>
          <AnimatedProgressBar value={progressPct} className="mt-2" />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Habit consistency
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-navy-900">{habitPct}%</p>
          <p className="mt-1 text-xs text-slate-500">Today&apos;s completion rate</p>
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Milestones shipped
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-navy-900">
            {completedMilestones}
            <span className="text-lg text-slate-400">/{project.nodes.length}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Nodes at 100% progress</p>
        </GlassCard>
      </div>

      <GlassCard className="p-6" hover={false}>
        <div className="mb-6 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-navy-700" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              15-minute CEO review
            </p>
            <h2 className="font-display text-xl font-bold text-navy-900">Weekly reflection</h2>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition",
                i === step
                  ? "bg-navy-900 text-white"
                  : values[s.id].trim()
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-navy-900/5 text-slate-500"
              )}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="flex items-center gap-2 text-sm font-semibold text-navy-900">
            {step === 0 && <Trophy className="h-4 w-4 text-amber-600" />}
            {step === 2 && <Target className="h-4 w-4 text-navy-700" />}
            {currentStep.label}
          </span>
          <p className="mt-1 text-xs text-slate-500">{currentStep.prompt}</p>
          <textarea
            value={values[currentStep.id]}
            onChange={(e) => setters[currentStep.id](e.target.value)}
            rows={6}
            className="mt-3 w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm leading-relaxed"
            placeholder="Write freely…"
          />
        </label>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-navy-700 disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={!canAdvance || submitting}
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Complete review"
              )}
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
