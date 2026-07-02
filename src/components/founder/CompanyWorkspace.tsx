"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FounderShell } from "@/components/founder/FounderShell";
import { FounderCoachPanel } from "@/components/founder/FounderCoachPanel";
import { ModuleCanvas } from "@/components/founder/modules/ModuleCanvas";
import { ValidatorModule } from "@/components/founder/modules/ValidatorModule";
import { CompetitorsModule } from "@/components/founder/modules/CompetitorsModule";
import { FinanceDashboardModule } from "@/components/founder/modules/FinanceDashboardModule";
import { RoadmapModule } from "@/components/founder/modules/RoadmapModule";
import { HabitsModule } from "@/components/founder/modules/HabitsModule";
import { RiskAnalysisModule } from "@/components/founder/modules/RiskAnalysisModule";
import { HealthScorePanel } from "@/components/founder/CompanyCard";
import { GlassCard } from "@/components/founder/GlassCard";
import type { FounderModuleId } from "@/lib/founder-nav";
import type { getProject } from "@/lib/projects";

export type CompanyProject = NonNullable<Awaited<ReturnType<typeof getProject>>>;

function CompanyWorkspaceContent({ project }: { project: CompanyProject }) {
  const params = useSearchParams();
  const module = (params.get("module") as FounderModuleId) || "workspace";

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
          <div className="mx-auto max-w-6xl px-8 py-10">
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

            {module === "workspace" && <ModuleCanvas />}
            {module === "validator" && <ValidatorModule project={projectMeta} />}
            {module === "competitors" && <CompetitorsModule />}
            {module === "finance" && (
              <FinanceDashboardModule
                project={{
                  budget: project.budget,
                  budgetNotes: project.budgetNotes,
                  nodes: project.nodes,
                }}
              />
            )}
            {module === "market" && <MarketModule />}
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
            {(module === "roadmap" || module === "tasks") && (
              <RoadmapModule project={project} />
            )}
            {module === "habits" && (
              <HabitsModule projectId={project.id} projectName={project.name} />
            )}
            {![
              "workspace",
              "validator",
              "competitors",
              "finance",
              "market",
              "dashboard",
              "roadmap",
              "tasks",
              "habits",
            ].includes(module) && <ComingSoonModule module={module} />}
          </div>
        </div>

        <FounderCoachPanel context={coachContext} />
      </div>
    </FounderShell>
  );
}

function moduleTitle(module: FounderModuleId): string {
  const titles: Record<string, string> = {
    workspace: "Company Digital Twin",
    validator: "Startup Validator",
    market: "Market Research",
    competitors: "Competitor Intelligence",
    finance: "Financial Dashboard",
    dashboard: "Company Overview",
    roadmap: "AI Roadmap",
    tasks: "Task Board",
    habits: "Daily Habits & Tracker",
    chat: "AI Founder Coach",
    customers: "Customer Personas",
    pitch: "Pitch Deck",
    documents: "Documents",
    calendar: "Calendar",
    settings: "Settings",
  };
  return titles[module] ?? "Workspace";
}

function moduleDescription(module: FounderModuleId): string {
  const desc: Record<string, string> = {
    workspace:
      "Your live startup model — every module connects. Drag blocks, see the full stack.",
    finance:
      "Budget breakdown, recommended tools, cost per block, and revenue projections.",
    roadmap:
      "Phased execution board with tasks, progress, and costs — Now, Next, Later, Done.",
    habits:
      "Daily founder rituals that keep you shipping. Track streaks and completion.",
    validator: "Confidence-weighted scores across market, moat, timing, and more.",
    dashboard: "Health score, finances, and risks at a glance.",
  };
  return desc[module] ?? "Part of your Company Digital Twin — updates as you build.";
}

function MarketModule() {
  const markets = [
    { country: "United States", tam: "$2.1B", growth: "+18%", size: 100 },
    { country: "United Kingdom", tam: "$420M", growth: "+14%", size: 65 },
    { country: "Germany", tam: "$380M", growth: "+12%", size: 58 },
    { country: "India", tam: "$890M", growth: "+24%", size: 82 },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {markets.map((m) => (
        <GlassCard key={m.country} className="p-6" hover={false}>
          <h3 className="font-display text-lg font-bold text-navy-900">{m.country}</h3>
          <div className="mt-4 flex items-end gap-4">
            <div
              className="rounded-t-xl bg-gradient-to-t from-navy-800 to-navy-400"
              style={{ width: 40, height: m.size }}
            />
            <div>
              <p className="font-display text-xl font-bold text-navy-900">{m.tam}</p>
              <p className="text-sm font-medium text-emerald-600">{m.growth} YoY</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
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

export function CompanyWorkspace({ project }: { project: CompanyProject }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center founder-bg">
          <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
        </div>
      }
    >
      <CompanyWorkspaceContent project={project} />
    </Suspense>
  );
}
