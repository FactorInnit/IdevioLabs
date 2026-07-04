import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { getGoogleCalendarAuthUrl } from "@/lib/google-calendar";
import { calendarColumnsReady } from "@/lib/google-calendar-user";
import { companyModuleHref } from "@/lib/founder-nav";
import { getOAuthOrigin, getRequestOrigin } from "@/lib/site";

function calendarRedirect(request: Request, projectId: string, error?: string) {
  const origin = getRequestOrigin(request);
  const url = new URL(companyModuleHref(projectId, "calendar"), origin);
  if (error) url.searchParams.set("calendar_error", error);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.redirect(
      new URL("/dashboard?calendar_error=missing_project", getRequestOrigin(request))
    );
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      const login = new URL("/login", getRequestOrigin(request));
      login.searchParams.set("next", companyModuleHref(projectId, "calendar"));
      return NextResponse.redirect(login);
    }

    const project = await getProject(projectId);
    if (!project || project.userId !== user.id) {
      return calendarRedirect(request, projectId, "project_not_found");
    }

    if (!process.env.GOOGLE_CLIENT_ID?.trim()) {
      return calendarRedirect(request, projectId, "not_configured");
    }

    if (!(await calendarColumnsReady())) {
      return calendarRedirect(request, projectId, "db_setup");
    }

    const origin = getOAuthOrigin(request);
    const returnPath = companyModuleHref(projectId, "calendar");
    const url = getGoogleCalendarAuthUrl(projectId, returnPath, origin);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Google Calendar connect error:", error);
    const code = isMissingCalendarColumnError(error) ? "db_setup" : "connect_failed";
    return calendarRedirect(request, projectId, code);
  }
}

function isMissingCalendarColumnError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /no such column|Unknown column|column.*does not exist/i.test(message);
}
