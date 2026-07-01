import { NextResponse } from "next/server";
import { deleteEdge } from "@/lib/projects";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteEdge(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete edge." }, { status: 500 });
  }
}
