import type { FounderModuleId } from "@/lib/founder-nav";

export const PRO_ONLY_MODULES: FounderModuleId[] = [
  "habits",
  "competitors",
  "pitch",
  "ceo-review",
];

export function isProOnlyModule(id: FounderModuleId): boolean {
  return PRO_ONLY_MODULES.includes(id);
}

export const PRO_MODULE_COPY: Partial<
  Record<FounderModuleId, { title: string; description: string }>
> = {
  habits: {
    title: "Daily Habits & Planner",
    description:
      "Track founder habits, plan your week, and build consistency with a CEO-grade daily ritual.",
  },
  competitors: {
    title: "Competitor Intelligence",
    description:
      "AI-powered competitor analysis, weaknesses to exploit, and one-click additions to your roadmap.",
  },
  pitch: {
    title: "Investor Export",
    description:
      "Print investor-ready progress reports and one-page pitch summaries from your live company data.",
  },
  "ceo-review": {
    title: "Weekly CEO Review",
    description:
      "A guided 15-minute ritual — wins, blockers, and next week's focus, saved to your activity log.",
  },
};

export function proFeatureError(featureName: string): string {
  return `${featureName} is a Pro feature. Upgrade to unlock it.`;
}
