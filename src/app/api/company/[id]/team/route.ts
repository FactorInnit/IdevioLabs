import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getProjectAccess,
  isMemberRole,
  requireProjectView,
  teamTablesReady,
} from "@/lib/project-access";
import {
  createProjectInvite,
  inviteErrorMessage,
  listProjectTeam,
  removeProjectMember,
  revokeProjectInvite,
  updateProjectMemberRole,
} from "@/lib/team-invites";
import { prisma } from "@/lib/prisma";
import { getProject } from "@/lib/projects";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const access = await getProjectAccess(user.id, id);
  if (!access.canView) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!(await teamTablesReady())) {
    return NextResponse.json({
      messages: [],
      dbReady: false,
      access: {
        role: access.role,
        canManageTeam: access.isOwner,
        canInvite: false,
      },
    });
  }

  try {
    const messages = await prisma.teamMessage.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    if (access.isOwner) {
      const team = await listProjectTeam(id, user.id);
      return NextResponse.json({
        messages,
        dbReady: true,
        ...team,
        access: {
          role: "owner",
          canManageTeam: true,
          canInvite: team.limits.canInvite,
        },
      });
    }

    return NextResponse.json({
      messages,
      dbReady: true,
      access: {
        role: access.role,
        canManageTeam: false,
        canInvite: false,
      },
    });
  } catch (error) {
    console.error("Team load error:", error);
    return NextResponse.json({ messages: [], dbReady: true });
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

  try {
    await requireProjectView(user.id, id);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json();
  const action = String(body.action ?? "message");

  if (action === "invite") {
    if (!(await teamTablesReady())) {
      return NextResponse.json(
        { error: "Team invites require a database update. Run the team migration in Turso." },
        { status: 503 }
      );
    }

    const email = String(body.email ?? "");
    const role = String(body.role ?? "editor");
    if (!isMemberRole(role)) {
      return NextResponse.json({ error: "Choose editor or viewer access." }, { status: 400 });
    }

    try {
      const result = await createProjectInvite({
        projectId: id,
        ownerId: user.id,
        email,
        role,
      });
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN";
      if (code === "FORBIDDEN") {
        return NextResponse.json({ error: "Only the workspace owner can invite teammates." }, { status: 403 });
      }
      return NextResponse.json({ error: inviteErrorMessage(code), code }, { status: 400 });
    }
  }

  if (action === "revoke_invite") {
    try {
      await revokeProjectInvite(id, user.id, String(body.inviteId ?? ""));
      return NextResponse.json({ ok: true });
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN";
      if (code === "FORBIDDEN") {
        return NextResponse.json({ error: "Only the workspace owner can manage invites." }, { status: 403 });
      }
      return NextResponse.json({ error: inviteErrorMessage(code) }, { status: 400 });
    }
  }

  if (action === "remove_member") {
    try {
      await removeProjectMember(id, user.id, String(body.memberId ?? ""));
      return NextResponse.json({ ok: true });
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN";
      if (code === "FORBIDDEN") {
        return NextResponse.json({ error: "Only the workspace owner can remove teammates." }, { status: 403 });
      }
      return NextResponse.json({ error: inviteErrorMessage(code) }, { status: 400 });
    }
  }

  if (action === "update_role") {
    const role = String(body.role ?? "");
    if (!isMemberRole(role)) {
      return NextResponse.json({ error: "Choose editor or viewer access." }, { status: 400 });
    }

    try {
      await updateProjectMemberRole(id, user.id, String(body.memberId ?? ""), role);
      return NextResponse.json({ ok: true });
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN";
      if (code === "FORBIDDEN") {
        return NextResponse.json({ error: "Only the workspace owner can change roles." }, { status: 403 });
      }
      return NextResponse.json({ error: inviteErrorMessage(code) }, { status: 400 });
    }
  }

  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message required." }, { status: 400 });
  }

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
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
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
