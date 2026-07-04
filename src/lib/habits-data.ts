export interface HabitItem {
  id: string;
  label: string;
  priority: "critical" | "high" | "normal";
}

export interface HabitsData {
  habits: HabitItem[];
  log: Record<string, string[]>;
  dayNotes: Record<string, string>;
  planner: Record<string, { time: string; label: string }[]>;
}

export const DEFAULT_HABITS: HabitItem[] = [
  { id: "h1", label: "Review roadmap & priorities", priority: "critical" },
  { id: "h2", label: "Talk to 1 user or customer", priority: "high" },
  { id: "h3", label: "Ship one meaningful task", priority: "high" },
  { id: "h4", label: "Update metrics / runway", priority: "normal" },
];

export function emptyHabitsData(): HabitsData {
  return { habits: DEFAULT_HABITS, log: {}, dayNotes: {}, planner: {} };
}

export function parseHabitsData(raw: string | null | undefined): HabitsData {
  if (!raw) return emptyHabitsData();
  try {
    const parsed = JSON.parse(raw) as Partial<HabitsData>;
    return {
      habits: parsed.habits?.length ? parsed.habits : DEFAULT_HABITS,
      log: parsed.log ?? {},
      dayNotes: parsed.dayNotes ?? {},
      planner: parsed.planner ?? {},
    };
  } catch {
    return emptyHabitsData();
  }
}

export function todayHabitPct(data: HabitsData): number {
  const today = new Date().toISOString().slice(0, 10);
  const done = data.log[today]?.length ?? 0;
  const total = data.habits.length || DEFAULT_HABITS.length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function mergeHabitsData(local: HabitsData, server: HabitsData): HabitsData {
  return {
    habits: server.habits.length ? server.habits : local.habits,
    log: { ...server.log, ...local.log },
    dayNotes: { ...server.dayNotes, ...local.dayNotes },
    planner: { ...server.planner, ...local.planner },
  };
}
