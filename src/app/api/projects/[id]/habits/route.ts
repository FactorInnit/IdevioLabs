import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireProjectView, requireProjectEdit } from "@/lib/project-access";
import { parseHabitsData } from "@/lib/habits-data";

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

  const row = await prisma.projectHabits.findUnique({ where: { projectId: id } });
  return NextResponse.json(parseHabitsData(row?.dataJson));
}

export async function PUT(
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
  const dataJson = JSON.stringify(body);

  const row = await prisma.projectHabits.upsert({
    where: { projectId: id },
    create: { projectId: id, dataJson },
    update: { dataJson },
  });

  return NextResponse.json(parseHabitsData(row.dataJson));
}
