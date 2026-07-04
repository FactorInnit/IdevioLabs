import type { PlanId } from "@/lib/plans";

export function normalizePlanId(plan: string | null | undefined): PlanId {
  if (plan === "pro" || plan === "ultra") return plan;
  return "free";
}

export function isProOrAbove(plan: string | null | undefined): boolean {
  const id = normalizePlanId(plan);
  return id === "pro" || id === "ultra";
}

export function isUltra(plan: string | null | undefined): boolean {
  return normalizePlanId(plan) === "ultra";
}

export function canAccessProFeature(plan: string | null | undefined): boolean {
  return isProOrAbove(plan);
}
