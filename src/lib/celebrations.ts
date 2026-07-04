export const PROGRESS_MILESTONES = [25, 50, 75, 100] as const;

export type ProgressMilestone = (typeof PROGRESS_MILESTONES)[number];

export function getCrossedMilestones(
  previous: number,
  next: number
): ProgressMilestone[] {
  return PROGRESS_MILESTONES.filter((m) => previous < m && next >= m);
}

export async function fireConfetti(intensity: "normal" | "epic" = "normal") {
  if (typeof window === "undefined") return;

  const confetti = (await import("canvas-confetti")).default;
  const base = {
    origin: { y: 0.65 },
    spread: intensity === "epic" ? 100 : 70,
    ticks: intensity === "epic" ? 200 : 120,
    gravity: 0.9,
    scalar: intensity === "epic" ? 1.2 : 1,
  };

  confetti({
    ...base,
    particleCount: intensity === "epic" ? 120 : 60,
    colors: ["#081a3a", "#4a78b4", "#059669", "#d97706", "#7c3aed"],
  });

  if (intensity === "epic") {
    setTimeout(() => {
      confetti({
        ...base,
        particleCount: 80,
        angle: 60,
        origin: { x: 0, y: 0.6 },
      });
      confetti({
        ...base,
        particleCount: 80,
        angle: 120,
        origin: { x: 1, y: 0.6 },
      });
    }, 180);
  }
}

export async function celebrateProgress(
  previous: number,
  next: number
): Promise<ProgressMilestone[]> {
  const crossed = getCrossedMilestones(previous, next);
  for (const milestone of crossed) {
    await fireConfetti(milestone === 100 ? "epic" : "normal");
  }
  return crossed;
}

export function milestoneLabel(milestone: ProgressMilestone): string {
  if (milestone === 100) return "Milestone complete!";
  return `${milestone}% milestone reached`;
}
