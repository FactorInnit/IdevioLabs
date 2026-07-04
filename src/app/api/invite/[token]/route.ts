import { NextResponse } from "next/server";
import { getInviteByToken } from "@/lib/team-invites";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found or expired." }, { status: 404 });
  }

  return NextResponse.json({
    projectId: invite.project.id,
    projectName: invite.project.name,
    email: invite.email,
    role: invite.role,
    inviterName: invite.invitedBy.name,
    expiresAt: invite.expiresAt.toISOString(),
  });
}
