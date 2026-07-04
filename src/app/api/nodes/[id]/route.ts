import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireProjectEdit } from "@/lib/project-access";
import { updateNodeProgress, updateNodePosition, deleteNode } from "@/lib/projects";

async function ensureNodeEdit(userId: string, nodeId: string) {
  const node = await prisma.workflowNode.findUnique({
    where: { id: nodeId },
    select: { projectId: true },
  });
  if (!node) return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  try {
    await requireProjectEdit(userId, node.projectId);
  } catch {
    return {
      error: NextResponse.json(
        { error: "View-only access. You cannot edit this workspace." },
        { status: 403 }
      ),
    };
  }
  return { node };
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
  const access = await ensureNodeEdit(user.id, id);
  if (access.error) return access.error;

  try {
    const body = await request.json();

    if (body.posX !== undefined && body.posY !== undefined) {
      const node = await updateNodePosition(id, body.posX, body.posY);
      return NextResponse.json(node);
    }

    const node = await updateNodeProgress(id, {
      status: body.status,
      progress: body.progress,
      title: body.title,
      description: body.description,
      note: body.note,
      category: body.category,
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update node." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const access = await ensureNodeEdit(user.id, id);
  if (access.error) return access.error;

  try {
    await deleteNode(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete node." }, { status: 500 });
  }
}
