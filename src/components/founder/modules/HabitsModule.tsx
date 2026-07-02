"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Flame, Target, Trophy } from "lucide-react";
import { GlassCard } from "../GlassCard";
import { cn } from "@/lib/utils";

const DEFAULT_HABITS = [
  { id: "h1", label: "Review today's priorities", streak: 0 },
  { id: "h2", label: "Complete 1 roadmap task", streak: 0 },
  { id: "h3", label: "Check budget & runway", streak: 0 },
  { id: "h4", label: "Talk to 1 potential customer", streak: 0 },
  { id: "h5", label: "Ship something — any progress", streak: 0 },
];

interface HabitState {
  date: string;
  completed: string[];
  streak: number;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(projectId: string) {
  return `idevio-habits-${projectId}`;
}

export function HabitsModule({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [state, setState] = useState<HabitState>({
    date: todayKey(),
    completed: [],
    streak: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(projectId));
      if (raw) {
        const parsed = JSON.parse(raw) as HabitState;
        if (parsed.date === todayKey()) {
          setState(parsed);
        } else {
          const yesterdayDone = parsed.completed.length >= 3;
          setState({
            date: todayKey(),
            completed: [],
            streak: yesterdayDone ? parsed.streak + 1 : 0,
          });
        }
      }
    } catch {
      // ignore
    }
  }, [projectId]);

  const persist = useCallback(
    (next: HabitState) => {
      setState(next);
      localStorage.setItem(storageKey(projectId), JSON.stringify(next));
    },
    [projectId]
  );

  const toggle = (id: string) => {
    const completed = state.completed.includes(id)
      ? state.completed.filter((c) => c !== id)
      : [...state.completed, id];
    persist({ ...state, completed });
  };

  const pct = Math.round((state.completed.length / DEFAULT_HABITS.length) * 100);
  const allDone = state.completed.length === DEFAULT_HABITS.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
            <Flame className="h-7 w-7 text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Day streak
            </p>
            <p className="font-display text-3xl font-bold text-navy-900">{state.streak}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900/8">
            <Target className="h-7 w-7 text-navy-700" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Today&apos;s progress
            </p>
            <p className="font-display text-3xl font-bold text-navy-900">{pct}%</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Trophy className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Habits done
            </p>
            <p className="font-display text-3xl font-bold text-navy-900">
              {state.completed.length}/{DEFAULT_HABITS.length}
            </p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6" hover={false}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Daily founder habits
        </p>
        <h2 className="font-display text-xl font-bold text-navy-900">
          {projectName} — today&apos;s checklist
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Complete 3+ habits to extend your streak. Resets at midnight.
        </p>

        <ul className="mt-6 space-y-2">
          {DEFAULT_HABITS.map((habit) => {
            const done = state.completed.includes(habit.id);
            return (
              <li key={habit.id}>
                <button
                  onClick={() => toggle(habit.id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition",
                    done
                      ? "border-emerald-200 bg-emerald-50/80"
                      : "border-navy-900/6 bg-white/70 hover:border-navy-300/30 hover:bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition",
                      done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {done && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      done ? "text-emerald-800 line-through" : "text-navy-900"
                    )}
                  >
                    {habit.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {allDone && (
          <p className="mt-4 rounded-xl bg-navy-900 px-4 py-3 text-center text-sm font-semibold text-white">
            Perfect day — you&apos;re building momentum.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
