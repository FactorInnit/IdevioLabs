import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
import { CompanyWorkspace } from "@/components/founder/CompanyWorkspace";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <CompanyWorkspace project={project} />;
}
