import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireProjectView, requireProjectEdit } from "@/lib/project-access";
import { getWeekStartKey } from "@/lib/founder-metrics";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  try {
    await requireProjectView(user.id, id);
  } catch {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const weekStart = getWeekStartKey();
  const review = await prisma.weeklyReview.findUnique({
    where: { projectId_weekStart: { projectId: id, weekStart } },
  });

  return NextResponse.json({ weekStart, review });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  try {
    await requireProjectEdit(user.id, id);
  } catch {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();
  const weekStart = getWeekStartKey();

  const review = await prisma.weeklyReview.upsert({
    where: { projectId_weekStart: { projectId: id, weekStart } },
    create: {
      projectId: id,
      userId: user.id,
      weekStart,
      wins: body.wins ?? "",
      blockers: body.blockers ?? "",
      nextFocus: body.nextFocus ?? "",
      habitPct: body.habitPct ?? 0,
      progressPct: body.progressPct ?? 0,
    },
    update: {
      wins: body.wins ?? "",
      blockers: body.blockers ?? "",
      nextFocus: body.nextFocus ?? "",
      habitPct: body.habitPct ?? 0,
      progressPct: body.progressPct ?? 0,
    },
  });

  await prisma.progressLog.create({
    data: {
      projectId: id,
      note: `Weekly CEO review completed — focus: ${(body.nextFocus ?? "").slice(0, 120)}`,
    },
  });

  return NextResponse.json({ review });
}
