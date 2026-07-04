export interface HabitsLog {
  habits: { id: string }[];
  log: Record<string, string[]>;
}

const HABITS_KEY_PREFIX = "idevio-habits-v2-";

export function calcHabitStreak(
  log: Record<string, string[]>,
  habitCount: number
): number {
  let streak = 0;
  const d = new Date();
  const threshold = Math.max(1, Math.ceil(habitCount * 0.6));

  for (;;) {
    const key = d.toISOString().slice(0, 10);
    const done = log[key]?.length ?? 0;
    if (done >= threshold) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function loadHabitsData(projectId: string): HabitsLog {
  try {
    const raw = localStorage.getItem(`${HABITS_KEY_PREFIX}${projectId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<HabitsLog>;
      return {
        habits: parsed.habits ?? [],
        log: parsed.log ?? {},
      };
    }
  } catch {
    // ignore
  }
  return { habits: [], log: {} };
}

export function getProjectStreak(projectId: string): number {
  const data = loadHabitsData(projectId);
  const habitCount = data.habits.length || 4;
  return calcHabitStreak(data.log, habitCount);
}

export function getBestStreakFromStorage(projectIds?: string[]): number {
  if (projectIds?.length) {
    return Math.max(0, ...projectIds.map(getProjectStreak));
  }

  let best = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(HABITS_KEY_PREFIX)) continue;
      const projectId = key.slice(HABITS_KEY_PREFIX.length);
      best = Math.max(best, getProjectStreak(projectId));
    }
  } catch {
    // ignore
  }
  return best;
}

export const HABITS_UPDATED_EVENT = "idevio-habits-updated";

export function notifyHabitsUpdated() {
  window.dispatchEvent(new Event(HABITS_UPDATED_EVENT));
}
