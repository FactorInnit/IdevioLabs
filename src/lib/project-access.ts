import { prisma } from "@/lib/prisma";
import { getPlan, type PlanId } from "@/lib/plans";

export type MemberRole = "editor" | "viewer";
export type ProjectRole = "owner" | MemberRole;

export interface ProjectAccess {
  role: ProjectRole | null;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
}

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isMemberRole(value: string): value is MemberRole {
  return value === "editor" || value === "viewer";
}

export async function getProjectAccess(
  userId: string,
  projectId: string
): Promise<ProjectAccess> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project) {
    return { role: null, canView: false, canEdit: false, isOwner: false };
  }

  if (project.userId === userId) {
    return { role: "owner", canView: true, canEdit: true, isOwner: true };
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });

  if (!membership) {
    return { role: null, canView: false, canEdit: false, isOwner: false };
  }

  const role = isMemberRole(membership.role) ? membership.role : "viewer";
  return {
    role,
    canView: true,
    canEdit: role === "editor",
    isOwner: false,
  };
}

export async function requireProjectView(userId: string, projectId: string) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.canView) {
    throw new Error("FORBIDDEN");
  }
  return access;
}

export async function requireProjectEdit(userId: string, projectId: string) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.canEdit) {
    throw new Error("FORBIDDEN");
  }
  return access;
}

export async function requireProjectOwner(userId: string, projectId: string) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.isOwner) {
    throw new Error("FORBIDDEN");
  }
  return access;
}

export function getCollaboratorLimit(planId: PlanId): number {
  return getPlan(planId).maxCollaborators;
}

export async function countProjectCollaboratorSlots(projectId: string): Promise<number> {
  const [members, pendingInvites] = await Promise.all([
    prisma.projectMember.count({ where: { projectId } }),
    prisma.projectInvite.count({
      where: { projectId, status: "pending", expiresAt: { gt: new Date() } },
    }),
  ]);
  return members + pendingInvites;
}

export async function getOwnerCollaboratorUsage(ownerId: string, projectId: string) {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { plan: true },
  });
  const planId = (owner?.plan as PlanId) || "free";
  const max = getCollaboratorLimit(planId);
  const used = await countProjectCollaboratorSlots(projectId);

  return {
    planId,
    max,
    used,
    remaining: max === Infinity ? Infinity : Math.max(0, max - used),
    canInvite: max === Infinity || used < max,
  };
}

export async function teamTablesReady(): Promise<boolean> {
  try {
    await prisma.$queryRawUnsafe('SELECT 1 FROM "ProjectMember" LIMIT 1');
    await prisma.$queryRawUnsafe('SELECT 1 FROM "ProjectInvite" LIMIT 1');
    return true;
  } catch {
    return false;
  }
}
