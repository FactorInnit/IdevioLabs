export type PlanId = "free" | "pro" | "ultra";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;
  oldPrice?: number;
  period: string;
  highlight?: boolean;
  badge?: string;
  maxStartups: number;
  collaborators: boolean;
  maxCollaborators: number;
  features: string[];
  notIncluded?: string[];
  cta: string;
}

export interface PlanComparisonRow {
  label: string;
  free: string;
  pro: string;
  ultra: string;
}

export const PLAN_COMPARISON: PlanComparisonRow[] = [
  { label: "Startup roadmaps", free: "1", pro: "Up to 10", ultra: "Unlimited" },
  { label: "AI roadmap generation", free: "✓", pro: "✓ Priority", ultra: "✓ Priority" },
  { label: "8-block workflow map", free: "✓", pro: "✓", ultra: "✓" },
  { label: "Step-by-step action plans", free: "✓", pro: "✓", ultra: "✓" },
  { label: "Budget-aware tool picks", free: "✓", pro: "✓", ultra: "✓" },
  { label: "Idevio AI assistant", free: "Basic", pro: "Unlimited", ultra: "Strategy mode" },
  { label: "Daily reminders", free: "✓", pro: "✓", ultra: "✓" },
  { label: "Progress tracking", free: "✓", pro: "✓", ultra: "✓" },
  { label: "Team collaborators", free: "—", pro: "Up to 5", ultra: "Unlimited" },
  { label: "Invite teammates", free: "—", pro: "✓", ultra: "✓" },
  { label: "Export to PDF", free: "—", pro: "✓", ultra: "✓" },
  { label: "Custom branding", free: "—", pro: "—", ultra: "✓" },
  { label: "Priority support", free: "—", pro: "—", ultra: "✓" },
];

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Validate your first idea",
    price: 0,
    period: "forever",
    maxStartups: 1,
    collaborators: false,
    maxCollaborators: 0,
    cta: "Start free",
    features: [
      "1 startup roadmap",
      "Full workflow map & action plans",
      "Budget-aware recommendations",
      "Basic Idevio assistant",
      "Daily reminders & progress tracking",
    ],
    notIncluded: [
      "No team invites",
      "No second startup",
      "No PDF export",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Build with your team",
    price: 19.99,
    oldPrice: 24.99,
    period: "month",
    highlight: true,
    badge: "Most popular",
    maxStartups: 10,
    collaborators: true,
    maxCollaborators: 5,
    cta: "Upgrade to Pro",
    features: [
      "Up to 10 startup roadmaps",
      "Invite up to 5 collaborators",
      "Unlimited Idevio assistant chats",
      "Priority AI generation",
      "Export roadmaps to PDF",
      "Everything in Free",
    ],
    notIncluded: ["No unlimited roadmaps", "No custom branding"],
  },
  {
    id: "ultra",
    name: "Ultra",
    tagline: "Scale without limits",
    price: 29.99,
    oldPrice: 34.99,
    period: "month",
    badge: "Best value",
    maxStartups: Infinity,
    collaborators: true,
    maxCollaborators: Infinity,
    cta: "Go Ultra",
    features: [
      "Unlimited startup roadmaps",
      "Unlimited collaborators",
      "Idevio strategy mode",
      "Custom branding on shared roadmaps",
      "Priority support & early access",
      "Everything in Pro",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function formatPlanPrice(price: number): string {
  if (price === 0) return "$0";
  return `$${price.toFixed(2)}`;
}

export function formatStartupLimit(max: number): string {
  if (max === Infinity) return "Unlimited";
  return String(max);
}
