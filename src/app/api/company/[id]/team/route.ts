import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const messages = await prisma.teamMessage.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json();
  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message required." }, { status: 400 });
  }

  try {
    const created = await prisma.teamMessage.create({
      data: {
        projectId: id,
        userId: user.id,
        userName: user.name,
        message,
      },
    });
    return NextResponse.json({ message: created }, { status: 201 });
  } catch (error) {
    console.error("Team message error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Run database migration." },
      { status: 500 }
    );
  }
}
