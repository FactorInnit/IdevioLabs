import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { acceptProjectInvite, inviteErrorMessage } from "@/lib/team-invites";
import { companyModuleHref } from "@/lib/founder-nav";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { token } = await params;

  try {
    const result = await acceptProjectInvite(token, user.id);
    return NextResponse.json({
      ok: true,
      projectId: result.projectId,
      redirect: companyModuleHref(result.projectId, "team"),
      alreadyMember: result.alreadyMember,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ error: inviteErrorMessage(code), code }, { status: 400 });
  }
}
