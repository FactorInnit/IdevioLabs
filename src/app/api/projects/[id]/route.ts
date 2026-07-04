import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { requireProjectEdit } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

const MAX_NAME_LENGTH = 120;
const MAX_LOGO_URL_LENGTH = 600_000;

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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await requireProjectEdit(user.id, id);
  } catch {
    return NextResponse.json(
      { error: "View-only access. You cannot edit this workspace." },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data: {
    name?: string;
    logoUrl?: string | null;
    budget?: number;
    budgetNotes?: string;
    status?: string;
  } = {};

  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Company name cannot be empty." }, { status: 400 });
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: "Company name is too long." }, { status: 400 });
    }
    data.name = trimmed;
  }

  if (body.logoUrl === null) {
    data.logoUrl = null;
  } else if (typeof body.logoUrl === "string") {
    if (body.logoUrl.length > MAX_LOGO_URL_LENGTH) {
      return NextResponse.json({ error: "Logo file is too large." }, { status: 400 });
    }
    if (!body.logoUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Logo must be an image." }, { status: 400 });
    }
    data.logoUrl = body.logoUrl;
  }

  if (typeof body.budget === "number") {
    data.budget = body.budget;
  }
  if (typeof body.budgetNotes === "string") {
    data.budgetNotes = body.budgetNotes;
  }
  if (typeof body.status === "string") {
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        nodes: true,
        edges: true,
        reminders: true,
        progressLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}
