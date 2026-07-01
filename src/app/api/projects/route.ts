import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { canCreateProject } from "@/lib/plan-limits";
import { createProjectFromPrompt, listProjects } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import type { PlanId } from "@/lib/plans";

export async function GET() {
  const userId = await getCurrentUserId();
  const projects = await listProjects(userId);
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Sign in to create a startup roadmap.",
          code: "auth_required",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    const planId = (user.plan as PlanId) || "free";
    const limit = await canCreateProject(userId, planId);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: limit.message,
          code: "plan_limit",
          count: limit.count,
          max: limit.max,
          planId,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prompt, budget } = body as { prompt?: string; budget?: number };

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Please describe your startup idea." },
        { status: 400 }
      );
    }

    const project = await createProjectFromPrompt(
      prompt.trim(),
      typeof budget === "number" ? budget : undefined,
      userId
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create project." },
      { status: 500 }
    );
  }
}
