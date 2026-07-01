import { getPlan, type PlanId } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function getUserProjectCount(userId: string): Promise<number> {
  return prisma.project.count({ where: { userId } });
}

export async function canCreateProject(userId: string, planId: PlanId) {
  const plan = getPlan(planId);
  const count = await getUserProjectCount(userId);
  const max = plan.maxStartups;

  if (count >= max) {
    return {
      allowed: false as const,
      count,
      max,
      message: `Your ${plan.name} plan includes ${max === Infinity ? "unlimited" : max} startup${max === 1 ? "" : "s"}. Upgrade to create more.`,
    };
  }

  return { allowed: true as const, count, max };
}

export function canUseCollaborators(planId: PlanId): boolean {
  return getPlan(planId).collaborators;
}

export async function getUserPlanContext(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const planId = (user.plan as PlanId) || "free";
  const projectCount = await getUserProjectCount(userId);
  const plan = getPlan(planId);

  return {
    user,
    planId,
    plan,
    projectCount,
    canCreateMore: projectCount < plan.maxStartups,
    canCollaborate: plan.collaborators,
  };
}
