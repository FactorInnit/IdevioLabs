import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import {
  getGoogleCalendarStatus,
  listUserGoogleCalendarEvents,
} from "@/lib/google-calendar-user";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (projectId) {
    const project = await getProject(projectId);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
  }

  const status = await getGoogleCalendarStatus(user.id);
  if (!status.connected) {
    return NextResponse.json({ connected: false, events: [] });
  }

  const now = new Date();
  const timeMin =
    from ??
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const timeMax =
    to ??
    new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59).toISOString();

  const events = await listUserGoogleCalendarEvents(user.id, timeMin, timeMax);

  return NextResponse.json({
    connected: true,
    email: status.email,
    events,
  });
}
