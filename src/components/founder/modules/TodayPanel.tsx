"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BellOff,
  Clock,
  Flame,
  Loader2,
  Lock,
  Target,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { StreakBadge } from "../StreakBadge";
import { AnimatedProgressBar } from "../AnimatedProgressBar";
import { companyModuleHref } from "@/lib/founder-nav";
import { canAccessProFeature } from "@/lib/plan-access";
import { usePlan } from "@/lib/usePlan";
import { todayHabitPct, type HabitsData } from "@/lib/habits-data";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { cn, parseJson } from "@/lib/utils";
import type { ReminderData } from "@/lib/types";
import type { NodeCategory } from "@/lib/types";
import type { CompanyProject } from "../CompanyWorkspace";

function pickTodayPriority(project: CompanyProject) {
  const incomplete = project.nodes.filter((n) => n.progress < 100);
  if (incomplete.length === 0) return null;
  return [...incomplete].sort((a, b) => b.progress - a.progress)[0];
}

export function TodayPanel({ project }: { project: CompanyProject }) {
  const { planId } = usePlan();
  const hasPro = canAccessProFeature(planId);
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [habitPct, setHabitPct] = useState(0);
  const [habitsLoading, setHabitsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const priority = useMemo(() => pickTodayPriority(project), [project]);

  const loadReminders = useCallback(async () => {
    setRemindersLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/reminders`);
      if (res.ok) setReminders(await res.json());
    } catch {
      // ignore
    } finally {
      setRemindersLoading(false);
    }
  }, [project.id]);

  const loadHabits = useCallback(async () => {
    if (!hasPro) {
      setHabitsLoading(false);
      setHabitPct(0);
      return;
    }
    setHabitsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/habits`);
      if (res.ok) {
        const data = (await res.json()) as HabitsData;
        setHabitPct(todayHabitPct(data));
      }
    } catch {
      // ignore
    } finally {
      setHabitsLoading(false);
    }
  }, [project.id, hasPro]);

  useEffect(() => {
    loadReminders();
    loadHabits();
  }, [loadReminders, loadHabits]);

  const toggleReminder = async (reminder: ReminderData) => {
    setTogglingId(reminder.id);
    try {
      await fetch(`/api/projects/${project.id}/reminders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reminder.id, enabled: !reminder.enabled }),
      });
      await loadReminders();
    } finally {
      setTogglingId(null);
    }
  };

  const categoryLabel = priority
    ? CATEGORY_CONFIG[priority.category as NodeCategory]?.label ?? priority.category
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900/10">
            <TrendingUp className="h-5 w-5 text-navy-700" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Today
            </p>
            <h2 className="font-display text-lg font-bold text-navy-900">CEO daily briefing</h2>
          </div>
        </div>
        <StreakBadge projectIds={[project.id]} compact />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-navy-700" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Today&apos;s priority
            </p>
          </div>
          {priority ? (
            <>
              <p className="mt-3 font-display text-base font-bold text-navy-900">
                {priority.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{categoryLabel}</p>
              <div className="mt-3">
                <AnimatedProgressBar value={priority.progress} showLabel />
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-emerald-700">
              All milestones complete — time to launch or set new goals.
            </p>
          )}
          <Link
            href={companyModuleHref(project.id, "roadmap")}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-navy-900"
          >
            View roadmap
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-600" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Habits today
            </p>
            {!hasPro && <Lock className="ml-auto h-3.5 w-3.5 text-slate-400" aria-hidden />}
          </div>
          {!hasPro ? (
            <>
              <p className="mt-3 text-sm text-slate-500">
                Daily habits & planner are a Pro feature.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-navy-900"
              >
                Upgrade to track habits
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : habitsLoading ? (
            <Loader2 className="mt-4 h-5 w-5 animate-spin text-navy-600" />
          ) : (
            <>
              <p className="mt-3 font-display text-3xl font-bold text-navy-900">{habitPct}%</p>
              <div className="mt-2">
                <AnimatedProgressBar value={habitPct} />
              </div>
              <Link
                href={companyModuleHref(project.id, "habits")}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-navy-900"
              >
                Open habits
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-5" hover={false}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-navy-700" />
            <p className="text-sm font-semibold text-navy-900">Reminders</p>
          </div>
          <Link
            href={companyModuleHref(project.id, "ceo-review")}
            className="inline-flex items-center gap-1 rounded-lg bg-navy-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-navy-800"
          >
            {!hasPro && <Lock className="h-3 w-3" aria-hidden />}
            CEO Review
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {remindersLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-navy-600" />
          </div>
        ) : reminders.length === 0 ? (
          <p className="text-sm text-slate-400">No reminders yet.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((reminder) => {
              const days = parseJson<number[]>(reminder.days, []);
              const dayLabel =
                days.length === 7
                  ? "Daily"
                  : days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))
                    ? "Weekdays"
                    : `${days.length} days/wk`;

              return (
                <li
                  key={reminder.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
                    reminder.enabled
                      ? "border-navy-900/8 bg-white/80"
                      : "border-slate-200 bg-slate-50 opacity-60"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-900">
                      {reminder.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3 shrink-0" />
                      {reminder.time}
                      <span className="text-slate-300">·</span>
                      {dayLabel}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={togglingId === reminder.id}
                    onClick={() => toggleReminder(reminder)}
                    className={cn(
                      "shrink-0 rounded-lg p-2 transition",
                      reminder.enabled
                        ? "bg-navy-900 text-white"
                        : "bg-slate-200 text-slate-500"
                    )}
                    aria-label={reminder.enabled ? "Disable reminder" : "Enable reminder"}
                  >
                    {togglingId === reminder.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : reminder.enabled ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
