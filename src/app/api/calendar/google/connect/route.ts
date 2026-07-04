import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { getGoogleCalendarAuthUrl } from "@/lib/google-calendar";
import { companyModuleHref } from "@/lib/founder-nav";
import { getOAuthOrigin } from "@/lib/site";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId required." }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  try {
    const origin = getOAuthOrigin(request);
    const returnPath = companyModuleHref(projectId, "calendar");
    const url = getGoogleCalendarAuthUrl(projectId, returnPath, origin);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Google Calendar connect error:", error);
    return NextResponse.json(
      { error: "Google Calendar is not configured." },
      { status: 500 }
    );
  }
}
