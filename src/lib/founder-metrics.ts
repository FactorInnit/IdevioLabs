/** Real founder metrics derived from project behavior — no fake seeded scores. */

export interface CompanyMetricsInput {
  id: string;
  name: string;
  progress: number;
  budget: number | null;
  updatedAt: string;
  nodes?: {
    id?: string;
    title?: string;
    progress: number;
    category: string;
    status?: string;
  }[];
  memberCount?: number;
  habitPct?: number;
  weeklyReviewDone?: boolean;
  progressLogCount?: number;
}

export interface CompanyMetrics {
  healthScore: number;
  readinessLabel: string;
  valuationEstimate: number;
  completionScore: number;
  lastActivity: string;
  nextMilestone: string;
  launchProbability: number;
  fundingReadiness: number;
  breakdown: {
    market: number;
    execution: number;
    competition: number;
    businessModel: number;
    team: number;
    defensibility: number;
    virality: number;
    funding: number;
  };
}

const CATEGORY_TO_AXIS: Record<string, keyof CompanyMetrics["breakdown"]> = {
  idea: "market",
  product: "execution",
  marketing: "virality",
  finance: "businessModel",
  legal: "defensibility",
  operations: "execution",
  team: "team",
  launch: "funding",
};

function avgProgress(nodes: { progress: number }[]): number {
  if (!nodes.length) return 0;
  return Math.round(nodes.reduce((s, n) => s + n.progress, 0) / nodes.length);
}

function axisFromCategories(
  nodes: { progress: number; category: string }[],
  axis: keyof CompanyMetrics["breakdown"]
): number {
  const relevant = nodes.filter((n) => CATEGORY_TO_AXIS[n.category] === axis);
  if (relevant.length === 0) {
    return axis === "execution" ? avgProgress(nodes) : 0;
  }
  return avgProgress(relevant);
}

export function computeCompanyMetrics(project: CompanyMetricsInput): CompanyMetrics {
  const nodes = project.nodes ?? [];
  const nodeProgress = avgProgress(nodes);
  const completed = nodes.filter((n) => n.progress >= 100).length;
  const completionRatio = nodes.length ? completed / nodes.length : 0;

  const breakdown = {
    market: axisFromCategories(nodes, "market"),
    execution: axisFromCategories(nodes, "execution"),
    competition: Math.min(
      100,
      Math.round(nodeProgress * 0.4 + (project.progressLogCount ?? 0) * 3)
    ),
    businessModel: axisFromCategories(nodes, "businessModel"),
    team: Math.min(100, Math.round(((project.memberCount ?? 1) - 1) * 25 + nodeProgress * 0.3)),
    defensibility: axisFromCategories(nodes, "defensibility"),
    virality: axisFromCategories(nodes, "virality"),
    funding: axisFromCategories(nodes, "funding"),
  };

  let healthScore = Math.round(
    Object.values(breakdown).reduce((a, b) => a + b, 0) / 8
  );

  if (project.habitPct != null && project.habitPct > 0) {
    healthScore = Math.min(100, Math.round(healthScore * 0.85 + project.habitPct * 0.15));
  }
  if (project.weeklyReviewDone) {
    healthScore = Math.min(100, healthScore + 5);
  }

  const incomplete = nodes.find((n) => n.progress < 100);
  const nextMilestone = incomplete?.title ?? "All milestones complete — focus on launch";

  const budgetBase = project.budget ?? 50_000;
  const valuationEstimate = Math.round(
    budgetBase * (0.8 + completionRatio * 1.5 + healthScore / 200)
  );

  const launchProbability = Math.min(
    98,
    Math.round(nodeProgress * 0.55 + completionRatio * 35 + (project.weeklyReviewDone ? 8 : 0))
  );

  const fundingReadiness = Math.min(
    100,
    Math.round(breakdown.funding * 0.5 + breakdown.businessModel * 0.3 + breakdown.team * 0.2)
  );

  return {
    healthScore,
    readinessLabel:
      healthScore >= 85
        ? "Investor Ready"
        : healthScore >= 70
          ? "Launch Ready"
          : healthScore >= 55
            ? "Building Momentum"
            : healthScore >= 30
              ? "Early Stage"
              : "Getting Started",
    valuationEstimate,
    completionScore: project.progress,
    lastActivity: project.updatedAt,
    nextMilestone,
    launchProbability,
    fundingReadiness,
    breakdown,
  };
}

export function formatValuation(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

export function getWeekStartKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
