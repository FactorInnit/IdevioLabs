"use client";

import { useAuth } from "./auth-context";
import { getPlan, type Plan, type PlanId } from "./plans";

export function usePlan(): {
  planId: PlanId;
  plan: Plan;
  checkoutPlan: (id: PlanId) => Promise<{ error?: string; url?: string }>;
} {
  const { planId, checkoutPlan } = useAuth();
  return { planId, plan: getPlan(planId), checkoutPlan };
}
