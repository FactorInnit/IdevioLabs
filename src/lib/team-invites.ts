import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendTeamInviteEmail } from "@/lib/email";
import {
  getOwnerCollaboratorUsage,
  normalizeInviteEmail,
  requireProjectOwner,
  type MemberRole,
} from "@/lib/project-access";
import { getSiteUrl } from "@/lib/site";
import { PRODUCT_NAME } from "@/lib/brand";

const INVITE_TTL_DAYS = 14;

function createInviteToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function listProjectTeam(projectId: string, ownerId: string) {
  await requireProjectOwner(ownerId, projectId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      userId: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!project?.userId || !project.user) {
    throw new Error("NOT_FOUND");
  }

  const [members, invites, limits] = await Promise.all([
    prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.projectInvite.findMany({
      where: { projectId, status: "pending", expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
    getOwnerCollaboratorUsage(ownerId, projectId),
  ]);

  return {
    owner: {
      id: project.user.id,
      name: project.user.name,
      email: project.user.email,
      role: "owner" as const,
    },
    members: members.map((member) => ({
      id: member.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role as MemberRole,
      joinedAt: member.createdAt.toISOString(),
    })),
    invites: invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role as MemberRole,
      createdAt: invite.createdAt.toISOString(),
      expiresAt: invite.expiresAt.toISOString(),
    })),
    limits,
  };
}

export async function createProjectInvite(input: {
  projectId: string;
  ownerId: string;
  email: string;
  role: MemberRole;
}) {
  await requireProjectOwner(input.ownerId, input.projectId);

  const email = normalizeInviteEmail(input.email);
  if (!email.includes("@")) {
    throw new Error("INVALID_EMAIL");
  }

  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!project?.user) throw new Error("NOT_FOUND");

  if (normalizeInviteEmail(project.user.email) === email) {
    throw new Error("SELF_INVITE");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: input.projectId, userId: existingUser.id },
      },
    });
    if (existingMember) throw new Error("ALREADY_MEMBER");
  }

  const usage = await getOwnerCollaboratorUsage(input.ownerId, input.projectId);
  if (!usage.canInvite) throw new Error("PLAN_LIMIT");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);
  const token = createInviteToken();

  const invite = await prisma.projectInvite.upsert({
    where: { projectId_email: { projectId: input.projectId, email } },
    create: {
      projectId: input.projectId,
      email,
      role: input.role,
      token,
      invitedById: input.ownerId,
      status: "pending",
      expiresAt,
    },
    update: {
      role: input.role,
      token,
      invitedById: input.ownerId,
      status: "pending",
      expiresAt,
    },
  });

  const inviteUrl = `${getSiteUrl()}/invite/${invite.token}`;

  const emailSent = await sendTeamInviteEmail({
    to: email,
    inviteUrl,
    projectName: project.name,
    inviterName: project.user.name,
    role: input.role,
  });

  return {
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role as MemberRole,
      createdAt: invite.createdAt.toISOString(),
      expiresAt: invite.expiresAt.toISOString(),
    },
    inviteUrl,
    emailSent,
  };
}

export async function revokeProjectInvite(
  projectId: string,
  ownerId: string,
  inviteId: string
) {
  await requireProjectOwner(ownerId, projectId);

  const invite = await prisma.projectInvite.findFirst({
    where: { id: inviteId, projectId },
  });
  if (!invite) throw new Error("NOT_FOUND");

  await prisma.projectInvite.update({
    where: { id: inviteId },
    data: { status: "revoked" },
  });
}

export async function removeProjectMember(
  projectId: string,
  ownerId: string,
  memberId: string
) {
  await requireProjectOwner(ownerId, projectId);

  const member = await prisma.projectMember.findFirst({
    where: { id: memberId, projectId },
  });
  if (!member) throw new Error("NOT_FOUND");

  await prisma.projectMember.delete({ where: { id: memberId } });
}

export async function updateProjectMemberRole(
  projectId: string,
  ownerId: string,
  memberId: string,
  role: MemberRole
) {
  await requireProjectOwner(ownerId, projectId);

  const member = await prisma.projectMember.findFirst({
    where: { id: memberId, projectId },
  });
  if (!member) throw new Error("NOT_FOUND");

  return prisma.projectMember.update({
    where: { id: memberId },
    data: { role },
  });
}

export async function getInviteByToken(token: string) {
  const invite = await prisma.projectInvite.findUnique({
    where: { token },
    include: {
      project: { select: { id: true, name: true } },
      invitedBy: { select: { name: true, email: true } },
    },
  });

  if (!invite || invite.status !== "pending" || invite.expiresAt <= new Date()) {
    return null;
  }

  return invite;
}

export async function acceptProjectInvite(token: string, userId: string) {
  const invite = await getInviteByToken(token);
  if (!invite) throw new Error("INVALID_INVITE");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) throw new Error("NOT_FOUND");

  if (normalizeInviteEmail(user.email) !== invite.email) {
    throw new Error("EMAIL_MISMATCH");
  }

  const project = await prisma.project.findUnique({
    where: { id: invite.projectId },
    select: { userId: true },
  });
  if (!project?.userId) throw new Error("NOT_FOUND");

  if (project.userId === userId) {
    throw new Error("ALREADY_OWNER");
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: invite.projectId, userId } },
  });
  if (existingMember) {
    await prisma.projectInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    });
    return { projectId: invite.projectId, alreadyMember: true };
  }

  await prisma.$transaction([
    prisma.projectMember.create({
      data: {
        projectId: invite.projectId,
        userId,
        role: invite.role,
      },
    }),
    prisma.projectInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    }),
  ]);

  return { projectId: invite.projectId, alreadyMember: false };
}

export function inviteErrorMessage(code: string): string {
  switch (code) {
    case "INVALID_EMAIL":
      return "Enter a valid email address.";
    case "SELF_INVITE":
      return "You are already the owner of this workspace.";
    case "ALREADY_MEMBER":
      return "That person is already on the team.";
    case "PLAN_LIMIT":
      return `Your plan has reached its collaborator limit. Upgrade to invite more people to ${PRODUCT_NAME}.`;
    case "INVALID_INVITE":
      return "This invite link is invalid or has expired.";
    case "EMAIL_MISMATCH":
      return "Sign in with the same email address that received the invite.";
    case "ALREADY_OWNER":
      return "You already own this workspace.";
    case "EMAIL_FAILED":
      return "We could not send the invite email. Check RESEND_API_KEY on the server.";
    default:
      return "Something went wrong. Please try again.";
  }
}
