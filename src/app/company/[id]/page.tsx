import { redirect, notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
import { CompanyWorkspace } from "@/components/founder/CompanyWorkspace";
import { getCurrentUser } from "@/lib/auth";
import { getProjectAccess } from "@/lib/project-access";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/company/${id}`)}`);
  }

  const project = await getProject(id);
  if (!project) notFound();

  const access = await getProjectAccess(user.id, id);
  if (!access.canView) notFound();

  return <CompanyWorkspace project={project} access={access} userId={user.id} userPlan={user.plan} />;
}
