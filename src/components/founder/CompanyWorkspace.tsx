"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FounderShell } from "@/components/founder/FounderShell";
import { FounderCoachPanel } from "@/components/founder/FounderCoachPanel";
import { CanvasWorkspace } from "@/components/founder/modules/CanvasWorkspace";
import { ValidatorModule } from "@/components/founder/modules/ValidatorModule";
import { CompetitorsModule } from "@/components/founder/modules/CompetitorsModule";
import { FinanceDashboardModule } from "@/components/founder/modules/FinanceDashboardModule";
import { RoadmapModule } from "@/components/founder/modules/RoadmapModule";
import { HabitsModule } from "@/components/founder/modules/HabitsModule";
import { CalendarModule } from "@/components/founder/modules/CalendarModule";
import { TeamModule } from "@/components/founder/modules/TeamModule";
import { RiskAnalysisModule } from "@/components/founder/modules/RiskAnalysisModule";
import { HealthScorePanel } from "@/components/founder/CompanyCard";
import { GlassCard } from "@/components/founder/GlassCard";
import type { FounderModuleId } from "@/lib/founder-nav";
import type { getProject } from "@/lib/projects";
import type { ProjectAccess } from "@/lib/project-access";
import { cn } from "@/lib/utils";

export type CompanyProject = NonNullable<Awaited<ReturnType<typeof getProject>>>;

const IMPLEMENTED_MODULES = new Set<FounderModuleId>([
  "workspace",
  "validator",
  "competitors",
  "finance",
  "dashboard",
  "roadmap",
  "habits",
  "calendar",
  "team",
]);

const WIDE_MODULES = new Set<FounderModuleId>(["workspace", "roadmap"]);

function CompanyWorkspaceContent({
  project,
  access,
}: {
  project: CompanyProject;
  access: ProjectAccess;
}) {
  const params = useSearchParams();
  const rawModule = params.get("module");
  const module: FounderModuleId =
    rawModule === "market" || rawModule === "tasks"
      ? rawModule === "market"
        ? "validator"
        : "roadmap"
      : (rawModule as FounderModuleId) || "workspace";

  const projectMeta = {
    id: project.id,
    name: project.name,
    description: project.description,
    progress: project.progress,
    budget: project.budget,
    updatedAt:
      project.updatedAt instanceof Date
        ? project.updatedAt.toISOString()
        : String(project.updatedAt),
    nodes: project.nodes.map((n) => ({ progress: n.progress, category: n.category })),
  };

  const coachContext = useMemo(
    () => ({
      projectId: project.id,
      name: project.name,
      description: project.description ?? undefined,
      budget: project.budget,
      progress: project.progress,
      nodes: project.nodes.map((n) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        status: n.status,
        progress: n.progress,
      })),
    }),
    [project]
  );

  return (
    <FounderShell companyId={project.id} companyName={project.name}>
      <div className="flex min-h-screen">
        <div className="min-w-0 flex-1 pr-[392px]">
          <div
            className={cn(
              "mx-auto px-8 py-10",
              WIDE_MODULES.has(module) ? "max-w-[1600px]" : "max-w-6xl"
            )}
          >
            <header className="mb-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                {project.name}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900">
                {moduleTitle(module)}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                {moduleDescription(module)}
              </p>
            </header>

            {!access.canEdit && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                View-only access — you can explore this workspace and use team chat, but edits are
                disabled.
              </div>
            )}

            {module === "workspace" && <CanvasWorkspace project={project} />}
            {module === "validator" && <ValidatorModule projectId={project.id} />}
            {module === "competitors" && <CompetitorsModule projectId={project.id} />}
            {module === "finance" && (
              <FinanceDashboardModule
                project={{
                  budget: project.budget,
                  budgetNotes: project.budgetNotes,
                  nodes: project.nodes,
                }}
              />
            )}
            {module === "dashboard" && (
              <div className="space-y-8">
                <HealthScorePanel {...projectMeta} />
                <FinanceDashboardModule
                  project={{
                    budget: project.budget,
                    budgetNotes: project.budgetNotes,
                    nodes: project.nodes,
                  }}
                />
                <RiskAnalysisModule />
              </div>
            )}
            {module === "roadmap" && <RoadmapModule project={project} />}
            {module === "habits" && (
              <HabitsModule projectId={project.id} projectName={project.name} />
            )}
            {module === "calendar" && (
              <CalendarModule projectId={project.id} projectName={project.name} />
            )}
            {module === "team" && (
              <TeamModule
                projectId={project.id}
                projectName={project.name}
                isOwner={access.isOwner}
              />
            )}
            {!IMPLEMENTED_MODULES.has(module) && <ComingSoonModule module={module} />}
          </div>
        </div>

        <FounderCoachPanel context={coachContext} />
      </div>
    </FounderShell>
  );
}

function moduleTitle(module: FounderModuleId): string {
  const titles: Record<string, string> = {
    workspace: "Company Canvas",
    validator: "Startup Validator",
    competitors: "Competitor Intelligence",
    finance: "Financial Dashboard",
    dashboard: "Company Overview",
    roadmap: "Execution Roadmap",
    habits: "Daily Habits & Planner",
    calendar: "Startup Calendar",
    team: "Team Workspace",
    chat: "AI Founder Coach",
    customers: "Customer Personas",
    pitch: "Pitch Deck",
    documents: "Documents",
    settings: "Settings",
  };
  return titles[module] ?? "Workspace";
}

function moduleDescription(module: FounderModuleId): string {
  const desc: Record<string, string> = {
    workspace:
      "Your startup mind map — drag blocks between sections on one canvas, customize colors, and add notes.",
    finance: "Budget breakdown, recommended tools, cost per block, and revenue projections.",
    roadmap:
      "Visual execution map with sequence, progress sliders, and a kanban board view.",
    habits:
      "Track habits, plan your week with time blocks, add notes, and see consistency on a calendar.",
    calendar: "Schedule meetings, sync Google Calendar, and embed Calendly booking.",
    validator: "In-depth AI report with radar charts, pros/cons, risks, and improvement actions.",
    competitors: "Where competitors fail, how to beat them, and one-click add to your roadmap.",
    team: "Chat with co-founders and teammates working on this startup.",
    dashboard: "Health score, finances, and risks at a glance.",
  };
  return desc[module] ?? "Part of your Company Digital Twin — updates as you build.";
}

function ComingSoonModule({ module }: { module: string }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-24 text-center" hover={false}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        Coming soon
      </p>
      <h2 className="mt-2 font-display text-xl font-bold capitalize text-navy-900">
        {module.replace(/-/g, " ")}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Connects to your Company Digital Twin — changes here update everywhere.
      </p>
    </GlassCard>
  );
}

export function CompanyWorkspace({
  project,
  access,
}: {
  project: CompanyProject;
  access: ProjectAccess;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center founder-bg">
          <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
        </div>
      }
    >
      <CompanyWorkspaceContent project={project} access={access} />
    </Suspense>
  );
}
