import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateCompetitorsReport } from "@/lib/company-research";
import { getProject } from "@/lib/projects";
import { requireProjectView } from "@/lib/project-access";
import { proFeatureError } from "@/lib/pro-features";
import { isProOrAbove } from "@/lib/usage-limits";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!isProOrAbove(user.plan)) {
    return NextResponse.json(
      { error: proFeatureError("Competitor Intelligence"), upgradeRequired: true },
      { status: 402 }
    );
  }

  const { id } = await params;
  try {
    await requireProjectView(user.id, id);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const report = await generateCompetitorsReport(id);
    return NextResponse.json({ report });
  } catch (error) {
    console.error("Competitors report error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
