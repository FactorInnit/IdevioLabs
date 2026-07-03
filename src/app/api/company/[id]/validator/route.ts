import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateValidatorReport } from "@/lib/company-research";
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
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const report = await generateValidatorReport(id);
    return NextResponse.json({ report });
  } catch (error) {
    console.error("Validator report error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
