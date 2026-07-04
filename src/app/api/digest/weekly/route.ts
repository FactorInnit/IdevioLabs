import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendWeeklyDigestEmail } from "@/lib/email";
import { computeCompanyMetrics } from "@/lib/founder-metrics";
import { calcHabitStreak } from "@/lib/habits-streak";
import { parseHabitsData } from "@/lib/habits-data";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ userId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      nodes: { select: { id: true, title: true, progress: true, category: true, status: true } },
      habits: true,
    },
    take: 10,
  });

  if (projects.length === 0) {
    return NextResponse.json({ error: "No companies to include in digest." }, { status: 400 });
  }

  const payload = projects.map((p) => {
    const habits = parseHabitsData(p.habits?.dataJson);
    const streak = calcHabitStreak(habits.log, habits.habits.length || 4);
    const metrics = computeCompanyMetrics({
      id: p.id,
      name: p.name,
      progress: p.progress,
      budget: p.budget,
      updatedAt: p.updatedAt.toISOString(),
      nodes: p.nodes,
    });
    return {
      name: p.name,
      progress: p.progress,
      streak,
      nextMilestone: metrics.nextMilestone,
    };
  });

  const result = await sendWeeklyDigestEmail({
    to: user.email,
    firstName: user.name.split(" ")[0] ?? "Founder",
    projects: payload,
  });

  if (!result.sent) {
    return NextResponse.json({ error: result.reason, sent: false }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
