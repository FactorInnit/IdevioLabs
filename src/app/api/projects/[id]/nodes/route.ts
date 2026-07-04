import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireProjectEdit } from "@/lib/project-access";
import { createNodeForProject } from "@/lib/projects";
import type { NodeCategory } from "@/lib/types";

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
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // empty body is fine
    }
    const node = await createNodeForProject(id, {
      category: body.category as NodeCategory | undefined,
      title: body.title ? String(body.title) : undefined,
      description: body.description ? String(body.description) : undefined,
      estimatedCost:
        typeof body.estimatedCost === "number" ? body.estimatedCost : undefined,
      tasks: Array.isArray(body.tasks)
        ? body.tasks.map((t: { title?: string; detail?: string }) => ({
            title: String(t.title ?? "Task"),
            detail: t.detail ? String(t.detail) : undefined,
          }))
        : undefined,
    });
    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create block." }, { status: 500 });
  }
}
