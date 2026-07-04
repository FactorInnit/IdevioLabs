import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireProjectEdit } from "@/lib/project-access";
import { deleteEdge } from "@/lib/projects";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;

  const edge = await prisma.workflowEdge.findUnique({
    where: { id },
    select: { projectId: true },
  });
  if (!edge) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    await requireProjectEdit(user.id, edge.projectId);
  } catch {
    return NextResponse.json(
      { error: "View-only access. You cannot edit this workspace." },
      { status: 403 }
    );
  }

  try {
    await deleteEdge(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete edge." }, { status: 500 });
  }
}
