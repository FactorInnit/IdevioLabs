import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reminders = await prisma.reminder.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(reminders);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const reminder = await prisma.reminder.create({
    data: {
      projectId: id,
      title: body.title,
      message: body.message,
      time: body.time,
      days: JSON.stringify(body.days ?? [1, 2, 3, 4, 5]),
      enabled: body.enabled ?? true,
    },
  });

  return NextResponse.json(reminder, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const reminder = await prisma.reminder.update({
    where: { id: body.id },
    data: {
      title: body.title,
      message: body.message,
      time: body.time,
      days: body.days ? JSON.stringify(body.days) : undefined,
      enabled: body.enabled,
    },
  });

  return NextResponse.json(reminder);
}
