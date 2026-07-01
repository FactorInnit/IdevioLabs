import { NextResponse } from "next/server";
import { updateNodeProgress, updateNodePosition, deleteNode } from "@/lib/projects";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update node." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteNode(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete node." },
      { status: 500 }
    );
  }
}
