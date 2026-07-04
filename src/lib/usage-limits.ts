import { prisma } from "@/lib/prisma";
import { isProOrAbove } from "@/lib/plan-access";
import {
  FREE_AI_MESSAGES_PER_MONTH,
  FREE_VALIDATOR_RUNS_PER_MONTH,
} from "@/lib/usage-constants";

export {
  FREE_AI_MESSAGES_PER_MONTH,
  FREE_VALIDATOR_RUNS_PER_MONTH,
} from "@/lib/usage-constants";

export { isProOrAbove, isUltra, normalizePlanId } from "@/lib/plan-access";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function getOrCreateUsage(userId: string) {
  const month = currentMonthKey();
  let usage = await prisma.userUsage.findUnique({ where: { userId } });
  if (!usage) {
    usage = await prisma.userUsage.create({
      data: { userId, aiMonth: month, validatorMonth: month },
    });
  }
  if (usage.aiMonth !== month) {
    usage = await prisma.userUsage.update({
      where: { userId },
      data: { aiMonth: month, aiMessageCount: 0 },
    });
  }
  if (usage.validatorMonth !== month) {
    usage = await prisma.userUsage.update({
      where: { userId },
      data: { validatorMonth: month, validatorRunCount: 0 },
    });
  }
  return usage;
}

export async function checkAiUsage(userId: string, plan: string) {
  if (isProOrAbove(plan)) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }
  const usage = await getOrCreateUsage(userId);
  const remaining = Math.max(0, FREE_AI_MESSAGES_PER_MONTH - usage.aiMessageCount);
  return {
    allowed: remaining > 0,
    remaining,
    limit: FREE_AI_MESSAGES_PER_MONTH,
  };
}

export async function incrementAiUsage(userId: string, plan: string) {
  if (isProOrAbove(plan)) return;
  await getOrCreateUsage(userId);
  await prisma.userUsage.update({
    where: { userId },
    data: { aiMessageCount: { increment: 1 } },
  });
}

export async function checkValidatorUsage(userId: string, plan: string) {
  if (isProOrAbove(plan)) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }
  const usage = await getOrCreateUsage(userId);
  const remaining = Math.max(0, FREE_VALIDATOR_RUNS_PER_MONTH - usage.validatorRunCount);
  return {
    allowed: remaining > 0,
    remaining,
    limit: FREE_VALIDATOR_RUNS_PER_MONTH,
  };
}

export async function incrementValidatorUsage(userId: string, plan: string) {
  if (isProOrAbove(plan)) return;
  await getOrCreateUsage(userId);
  await prisma.userUsage.update({
    where: { userId },
    data: { validatorRunCount: { increment: 1 } },
  });
}

export async function getUsageSummary(userId: string, plan: string) {
  const usage = await getOrCreateUsage(userId);
  const aiLimit = isProOrAbove(plan) ? Infinity : FREE_AI_MESSAGES_PER_MONTH;
  const validatorLimit = isProOrAbove(plan) ? Infinity : FREE_VALIDATOR_RUNS_PER_MONTH;
  return {
    ai: {
      used: usage.aiMessageCount,
      limit: aiLimit,
      remaining: aiLimit === Infinity ? Infinity : Math.max(0, aiLimit - usage.aiMessageCount),
    },
    validator: {
      used: usage.validatorRunCount,
      limit: validatorLimit,
      remaining:
        validatorLimit === Infinity
          ? Infinity
          : Math.max(0, validatorLimit - usage.validatorRunCount),
    },
    digestEnabled: usage.digestEnabled,
  };
}
