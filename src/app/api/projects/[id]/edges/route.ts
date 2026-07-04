import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireProjectEdit } from "@/lib/project-access";
import { createEdge } from "@/lib/projects";

export async function POST(
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

  try {
    const body = await request.json();
    const { sourceId, targetId } = body as {
      sourceId?: string;
      targetId?: string;
    };
    if (!sourceId || !targetId || sourceId === targetId) {
      return NextResponse.json({ error: "Invalid connection." }, { status: 400 });
    }
    const edge = await createEdge(id, sourceId, targetId);
    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to connect blocks." }, { status: 500 });
  }
}
