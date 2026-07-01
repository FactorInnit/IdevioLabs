import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: body.name,
      budget: body.budget,
      budgetNotes: body.budgetNotes,
      status: body.status,
    },
    include: {
      nodes: true,
      edges: true,
      reminders: true,
      progressLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  return NextResponse.json(project);
}
