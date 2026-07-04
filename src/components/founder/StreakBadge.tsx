"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import {
  getBestStreakFromStorage,
  HABITS_UPDATED_EVENT,
} from "@/lib/habits-streak";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  projectIds?: string[];
  className?: string;
  light?: boolean;
  compact?: boolean;
}

export function StreakBadge({
  projectIds,
  className,
  light = false,
  compact = false,
}: StreakBadgeProps) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const refresh = () => setStreak(getBestStreakFromStorage(projectIds));
    refresh();
    window.addEventListener(HABITS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(HABITS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [projectIds]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition",
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        streak > 0
          ? light
            ? "border border-amber-300/30 bg-amber-400/15 text-amber-100"
            : "border border-amber-200 bg-amber-50 text-amber-800"
          : light
            ? "border border-white/10 bg-white/5 text-white/60"
            : "border border-navy-900/8 bg-navy-900/5 text-slate-500",
        className
      )}
      title={
        streak > 0
          ? `${streak}-day CEO habit streak — keep it going`
          : "Complete daily habits to start your streak"
      }
    >
      <Flame
        className={cn(
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
          streak > 0 ? "text-amber-500" : light ? "text-white/40" : "text-slate-400"
        )}
      />
      {compact ? (
        <span>{streak > 0 ? streak : "0"}</span>
      ) : (
        <span>{streak > 0 ? `${streak} day streak` : "Start streak"}</span>
      )}
    </div>
  );
}

export function useFounderStreak(projectIds?: string[]) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const refresh = () => setStreak(getBestStreakFromStorage(projectIds));
    refresh();
    window.addEventListener(HABITS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(HABITS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [projectIds]);

  return streak;
}
