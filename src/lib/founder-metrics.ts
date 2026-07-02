/** Derive founder OS metrics from project data (live where possible, seeded otherwise). */

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

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h << 5) - h + input.charCodeAt(i);
  return Math.abs(h);
}

function seededRange(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

export function computeCompanyMetrics(project: {
  id: string;
  name: string;
  progress: number;
  budget: number | null;
  updatedAt: string;
  nodes?: { progress: number; category: string }[];
}): CompanyMetrics {
  const seed = hashSeed(project.id + project.name);
  const nodeProgress =
    project.nodes && project.nodes.length > 0
      ? Math.round(
          project.nodes.reduce((s, n) => s + n.progress, 0) / project.nodes.length
        )
      : project.progress;

  const execution = Math.min(98, Math.max(42, nodeProgress + seededRange(seed, -8, 12)));
  const market = seededRange(seed + 1, 68, 96);
  const competition = seededRange(seed + 2, 62, 88);
  const businessModel = seededRange(seed + 3, 70, 94);
  const team = seededRange(seed + 4, 48, 82);
  const defensibility = seededRange(seed + 5, 65, 90);
  const virality = seededRange(seed + 6, 58, 86);
  const funding = seededRange(seed + 7, 52, 84);

  const breakdown = {
    market,
    execution,
    competition,
    businessModel,
    team,
    defensibility,
    virality,
    funding,
  };

  const healthScore = Math.round(
    Object.values(breakdown).reduce((a, b) => a + b, 0) / 8
  );

  const budgetBase = project.budget ?? 250_000;
  const valuationEstimate = Math.round(
    budgetBase * (1.2 + healthScore / 100) * (1 + project.progress / 200)
  );

  const milestones = [
    "Validate MVP scope",
    "Ship beta to 50 users",
    "Close seed round",
    "Hit $10k MRR",
    "Expand to new market",
  ];
  const nextMilestone = milestones[seededRange(seed, 0, milestones.length - 1)];

  return {
    healthScore,
    readinessLabel:
      healthScore >= 85
        ? "Investor Ready"
        : healthScore >= 70
          ? "Launch Ready"
          : healthScore >= 55
            ? "Building Momentum"
            : "Early Stage",
    valuationEstimate,
    completionScore: project.progress,
    lastActivity: project.updatedAt,
    nextMilestone,
    launchProbability: Math.min(94, Math.round(healthScore * 0.85 + seededRange(seed, 5, 15))),
    fundingReadiness: funding,
    breakdown,
  };
}

export function formatValuation(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}
