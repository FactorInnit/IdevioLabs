import { NextResponse } from "next/server";
import { createEdge } from "@/lib/projects";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
