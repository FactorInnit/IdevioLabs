"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Plus,
  StickyNote,
  Trash2,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { cn } from "@/lib/utils";
import { calcHabitStreak, notifyHabitsUpdated } from "@/lib/habits-streak";

type Priority = "urgent" | "high" | "normal";

interface Habit {
  id: string;
  label: string;
  priority: Priority;
}

interface HabitsData {
  habits: Habit[];
  log: Record<string, string[]>;
  dayNotes: Record<string, string>;
  planner: Record<string, { time: string; label: string }[]>;
}

const DEFAULT_HABITS: Habit[] = [
  { id: "h1", label: "Review today's priorities", priority: "urgent" },
  { id: "h2", label: "Complete 1 roadmap task", priority: "high" },
  { id: "h3", label: "Check budget & runway", priority: "normal" },
  { id: "h4", label: "Talk to 1 potential customer", priority: "high" },
  { id: "h5", label: "Ship something — any progress", priority: "urgent" },
];

const PRIORITY_ORDER: Priority[] = ["urgent", "high", "normal"];
const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
};
const PRIORITY_STYLE: Record<Priority, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  normal: "bg-slate-100 text-slate-600",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(projectId: string) {
  return `idevio-habits-v2-${projectId}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function loadData(projectId: string): HabitsData {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<HabitsData>;
      return {
        habits: parsed.habits ?? DEFAULT_HABITS,
        log: parsed.log ?? {},
        dayNotes: parsed.dayNotes ?? {},
        planner: parsed.planner ?? {},
      };
    }
  } catch {
    // ignore
  }
  return { habits: DEFAULT_HABITS, log: {}, dayNotes: {}, planner: {} };
}

function calcStreak(log: Record<string, string[]>, habitCount: number): number {
  return calcHabitStreak(log, habitCount || 4);
}

export function HabitsModule({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [data, setData] = useState<HabitsData>({
    habits: DEFAULT_HABITS,
    log: {},
    dayNotes: {},
    planner: {},
  });
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(todayKey());
  const [newLabel, setNewLabel] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("normal");
  const [planTime, setPlanTime] = useState("09:00");
  const [planLabel, setPlanLabel] = useState("");

  useEffect(() => {
    const local = loadData(projectId);
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/habits`);
        if (res.ok) {
          const serverRaw = await res.json();
          const server = {
            habits: serverRaw.habits ?? DEFAULT_HABITS,
            log: serverRaw.log ?? {},
            dayNotes: serverRaw.dayNotes ?? {},
            planner: serverRaw.planner ?? {},
          } satisfies HabitsData;
          const merged: HabitsData = {
            habits: server.habits.length ? server.habits : local.habits,
            log: { ...server.log, ...local.log },
            dayNotes: { ...server.dayNotes, ...local.dayNotes },
            planner: { ...server.planner, ...local.planner },
          };
          setData(merged);
          localStorage.setItem(storageKey(projectId), JSON.stringify(merged));
          return;
        }
      } catch {
        // fall through
      }
      setData(local);
    })();
  }, [projectId]);

  const persist = useCallback(
    (next: HabitsData) => {
      setData(next);
      localStorage.setItem(storageKey(projectId), JSON.stringify(next));
      notifyHabitsUpdated();
      fetch(`/api/projects/${projectId}/habits`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => {});
    },
    [projectId]
  );

  const today = todayKey();
  const todayDone = data.log[today] ?? [];

  const sortedHabits = useMemo(() => {
    return [...data.habits].sort(
      (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
    );
  }, [data.habits]);

  const toggleToday = (id: string) => {
    const completed = todayDone.includes(id)
      ? todayDone.filter((c) => c !== id)
      : [...todayDone, id];
    persist({ ...data, log: { ...data.log, [today]: completed } });
  };

  const addHabit = () => {
    if (!newLabel.trim()) return;
    const habit: Habit = {
      id: `h-${Date.now()}`,
      label: newLabel.trim(),
      priority: newPriority,
    };
    persist({ ...data, habits: [...data.habits, habit] });
    setNewLabel("");
  };

  const removeHabit = (id: string) => {
    persist({
      ...data,
      habits: data.habits.filter((h) => h.id !== id),
      log: Object.fromEntries(
        Object.entries(data.log).map(([date, ids]) => [
          date,
          ids.filter((i) => i !== id),
        ])
      ),
    });
  };

  const moveHabit = (index: number, dir: -1 | 1) => {
    const habits = [...sortedHabits];
    const target = index + dir;
    if (target < 0 || target >= habits.length) return;
    [habits[index], habits[target]] = [habits[target], habits[index]];
    persist({ ...data, habits });
  };

  const setPriority = (id: string, priority: Priority) => {
    persist({
      ...data,
      habits: data.habits.map((h) => (h.id === id ? { ...h, priority } : h)),
    });
  };

  const streak = calcStreak(data.log, data.habits.length);
  const todayPct =
    data.habits.length > 0
      ? Math.round((todayDone.length / data.habits.length) * 100)
      : 0;

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const calendarCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const dayIntensity = (day: number) => {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const done = data.log[key]?.length ?? 0;
    if (data.habits.length === 0) return 0;
    return done / data.habits.length;
  };

  const dayKeyFromParts = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const setDayNote = (date: string, note: string) => {
    persist({ ...data, dayNotes: { ...data.dayNotes, [date]: note } });
  };

  const addPlannerItem = () => {
    if (!planLabel.trim() || !selectedDay) return;
    const items = data.planner[selectedDay] ?? [];
    persist({
      ...data,
      planner: {
        ...data.planner,
        [selectedDay]: [...items, { time: planTime, label: planLabel.trim() }].sort((a, b) =>
          a.time.localeCompare(b.time)
        ),
      },
    });
    setPlanLabel("");
  };

  const removePlannerItem = (date: string, index: number) => {
    const items = [...(data.planner[date] ?? [])];
    items.splice(index, 1);
    persist({ ...data, planner: { ...data.planner, [date]: items } });
  };

  const selectedPlanner = data.planner[selectedDay] ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-4 p-5" hover={false}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
            <Flame className="h-7 w-7 text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Day streak
            </p>
            <p className="font-display text-3xl font-bold text-navy-900">{streak}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 p-5" hover={false}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Today
          </p>
          <p className="font-display text-3xl font-bold text-navy-900">{todayPct}%</p>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 p-5" hover={false}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Habits
          </p>
          <p className="font-display text-3xl font-bold text-navy-900">
            {todayDone.length}/{data.habits.length}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-6" hover={false}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy-900">Consistency calendar</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="rounded-lg p-1 hover:bg-navy-900/5">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-navy-900">
              {monthLabel(viewYear, viewMonth)}
            </span>
            <button onClick={nextMonth} className="rounded-lg p-1 hover:bg-navy-900/5">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {calendarCells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const intensity = dayIntensity(day);
            const isToday =
              day === new Date().getDate() &&
              viewMonth === new Date().getMonth() &&
              viewYear === new Date().getFullYear();
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(dayKeyFromParts(viewYear, viewMonth, day))}
                title={`${Math.round(intensity * 100)}% habits done`}
                className={cn(
                  "flex h-10 flex-col items-center justify-center rounded-lg text-xs font-medium transition",
                  intensity >= 1
                    ? "bg-emerald-500 text-white"
                    : intensity >= 0.6
                      ? "bg-emerald-300 text-navy-900"
                      : intensity >= 0.3
                        ? "bg-emerald-100 text-navy-800"
                        : intensity > 0
                          ? "bg-navy-100 text-navy-700"
                          : "bg-navy-900/5 text-slate-400",
                  isToday && "ring-2 ring-navy-700 ring-offset-1",
                  selectedDay === dayKeyFromParts(viewYear, viewMonth, day) &&
                    "ring-2 ring-navy-500"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Darker green = more habits completed that day. Click a day to plan time &amp; add notes.
        </p>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-navy-700" />
            <h2 className="font-display text-lg font-bold text-navy-900">
              Day planner — {selectedDay}
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Plan your time blocks for the selected day.
          </p>
          <ul className="mt-4 space-y-2">
            {selectedPlanner.length === 0 ? (
              <li className="text-sm text-slate-400">No time blocks planned yet.</li>
            ) : (
              selectedPlanner.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-navy-900/6 bg-white p-3"
                >
                  <div>
                    <span className="text-xs font-bold text-navy-600">{item.time}</span>
                    <p className="text-sm font-medium text-navy-900">{item.label}</p>
                  </div>
                  <button
                    onClick={() => removePlannerItem(selectedDay, i)}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="time"
              value={planTime}
              onChange={(e) => setPlanTime(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
            />
            <input
              value={planLabel}
              onChange={(e) => setPlanLabel(e.target.value)}
              placeholder="What are you doing?"
              className="min-w-[160px] flex-1 rounded-xl border px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addPlannerItem()}
            />
            <button
              onClick={addPlannerItem}
              className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add block
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-navy-700" />
            <h2 className="font-display text-lg font-bold text-navy-900">Day notes</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Journal thoughts, wins, or blockers for {selectedDay}.
          </p>
          <textarea
            value={data.dayNotes[selectedDay] ?? ""}
            onChange={(e) => setDayNote(selectedDay, e.target.value)}
            placeholder="What happened today? What did you learn?"
            rows={8}
            className="mt-4 w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm leading-relaxed"
          />
        </GlassCard>
      </div>

      <GlassCard className="p-6" hover={false}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {projectName}
        </p>
        <h2 className="font-display text-xl font-bold text-navy-900">Your habits</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add, reorder, and set urgency. Urgent habits appear first.
        </p>

        <ul className="mt-6 space-y-2">
          {sortedHabits.map((habit, index) => {
            const done = todayDone.includes(habit.id);
            return (
              <li
                key={habit.id}
                className="flex items-center gap-2 rounded-xl border border-navy-900/6 bg-white/80 p-3"
              >
                <button
                  onClick={() => toggleToday(habit.id)}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2",
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {done && <Check className="h-3.5 w-3.5" />}
                </button>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm font-medium",
                    done ? "text-emerald-800 line-through" : "text-navy-900"
                  )}
                >
                  {habit.label}
                </span>
                <select
                  value={habit.priority}
                  onChange={(e) => setPriority(habit.id, e.target.value as Priority)}
                  className={cn(
                    "rounded-lg px-2 py-1 text-[10px] font-bold",
                    PRIORITY_STYLE[habit.priority]
                  )}
                >
                  {PRIORITY_ORDER.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => moveHabit(index, -1)}
                  className="text-slate-400 hover:text-navy-700"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveHabit(index, 1)}
                  className="text-slate-400 hover:text-navy-700"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="text-slate-300 hover:text-red-500"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="New habit…"
            className="min-w-[200px] flex-1 rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as Priority)}
            className="rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
          >
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
          <button
            onClick={addHabit}
            className="inline-flex items-center gap-1 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
