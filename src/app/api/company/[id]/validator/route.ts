import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireProjectView } from "@/lib/project-access";
import { generateValidatorReport } from "@/lib/company-research";
import { getProject } from "@/lib/projects";
import {
  checkValidatorUsage,
  incrementValidatorUsage,
} from "@/lib/usage-limits";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    await requireProjectView(user.id, id);
  } catch {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const usage = await checkValidatorUsage(user.id, user.plan);
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: `Free plan includes ${usage.limit} validator run per month. Upgrade to Pro for unlimited deep research.`,
        upgradeRequired: true,
        usage,
      },
      { status: 402 }
    );
  }

  try {
    const report = await generateValidatorReport(id);
    await incrementValidatorUsage(user.id, user.plan);
    return NextResponse.json({ report, usage: { remaining: usage.remaining - 1 } });
  } catch (error) {
    console.error("Validator report error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
