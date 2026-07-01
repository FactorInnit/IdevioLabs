import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskStep } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Normalizes the stored tasks JSON into rich TaskStep objects.
 * Handles both the legacy string[] format and the new TaskStep[] format.
 */
export function parseTasks(value: string): TaskStep[] {
  const raw = parseJson<unknown>(value, []);
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): TaskStep | null => {
      if (typeof item === "string") {
        return { title: item, detail: "", tools: [], resources: [] };
      }
      if (item && typeof item === "object") {
        const obj = item as Partial<TaskStep>;
        if (!obj.title) return null;
        return {
          title: obj.title,
          detail: obj.detail ?? "",
          tools: Array.isArray(obj.tools) ? obj.tools : [],
          resources: Array.isArray(obj.resources) ? obj.resources : [],
          estimatedTime: obj.estimatedTime,
        };
      }
      return null;
    })
    .filter((t): t is TaskStep => t !== null);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateProjectProgress(
  nodes: { progress: number; status: string }[]
): number {
  if (nodes.length === 0) return 0;
  const total = nodes.reduce((sum, node) => sum + node.progress, 0);
  return Math.round(total / nodes.length);
}
