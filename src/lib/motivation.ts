import { prisma } from "@/lib/prisma";

export interface MotivationSettings {
  category: string;
  notifyTime: string;
  enabled: boolean;
  browserNotify: boolean;
  lastNotifiedDate: string | null;
}

export const DEFAULT_MOTIVATION_SETTINGS: MotivationSettings = {
  category: "random",
  notifyTime: "08:00",
  enabled: true,
  browserNotify: true,
  lastNotifiedDate: null,
};

export async function motivationSettingsReady(): Promise<boolean> {
  try {
    await prisma.$queryRawUnsafe('SELECT 1 FROM "UserMotivationSettings" LIMIT 1');
    return true;
  } catch {
    return false;
  }
}

export async function getMotivationSettings(userId: string): Promise<MotivationSettings> {
  if (!(await motivationSettingsReady())) {
    return DEFAULT_MOTIVATION_SETTINGS;
  }

  const row = await prisma.userMotivationSettings.findUnique({ where: { userId } });
  if (!row) return DEFAULT_MOTIVATION_SETTINGS;

  return {
    category: row.category,
    notifyTime: row.notifyTime,
    enabled: row.enabled,
    browserNotify: row.browserNotify,
    lastNotifiedDate: row.lastNotifiedDate,
  };
}

export async function upsertMotivationSettings(
  userId: string,
  input: Partial<MotivationSettings>
): Promise<MotivationSettings> {
  if (!(await motivationSettingsReady())) {
    throw new Error("DB_NOT_READY");
  }

  const row = await prisma.userMotivationSettings.upsert({
    where: { userId },
    create: {
      userId,
      category: normalizeCategory(input.category) ?? DEFAULT_MOTIVATION_SETTINGS.category,
      notifyTime: normalizeTime(input.notifyTime) ?? DEFAULT_MOTIVATION_SETTINGS.notifyTime,
      enabled: input.enabled ?? DEFAULT_MOTIVATION_SETTINGS.enabled,
      browserNotify: input.browserNotify ?? DEFAULT_MOTIVATION_SETTINGS.browserNotify,
    },
    update: {
      ...(input.category !== undefined
        ? { category: normalizeCategory(input.category) ?? DEFAULT_MOTIVATION_SETTINGS.category }
        : {}),
      ...(input.notifyTime !== undefined
        ? { notifyTime: normalizeTime(input.notifyTime) ?? DEFAULT_MOTIVATION_SETTINGS.notifyTime }
        : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.browserNotify !== undefined ? { browserNotify: input.browserNotify } : {}),
      ...(input.lastNotifiedDate !== undefined
        ? { lastNotifiedDate: input.lastNotifiedDate }
        : {}),
    },
  });

  return {
    category: row.category,
    notifyTime: row.notifyTime,
    enabled: row.enabled,
    browserNotify: row.browserNotify,
    lastNotifiedDate: row.lastNotifiedDate,
  };
}

function normalizeCategory(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase().slice(0, 40) : null;
}

function normalizeTime(value: string | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
