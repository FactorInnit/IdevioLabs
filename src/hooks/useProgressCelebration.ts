"use client";

import { useCallback, useState } from "react";
import {
  celebrateProgress,
  getCrossedMilestones,
  milestoneLabel,
} from "@/lib/celebrations";

export function useProgressCelebration() {
  const [milestoneToast, setMilestoneToast] = useState<string | null>(null);

  const celebrateIfCrossed = useCallback(
    async (previous: number, next: number, context?: string) => {
      const crossed = getCrossedMilestones(previous, next);
      if (crossed.length === 0) return;

      await celebrateProgress(previous, next);
      const label = milestoneLabel(crossed[crossed.length - 1]);
      setMilestoneToast(context ? `${label} — ${context}` : label);
    },
    []
  );

  return {
    milestoneToast,
    clearMilestoneToast: () => setMilestoneToast(null),
    celebrateIfCrossed,
  };
}
