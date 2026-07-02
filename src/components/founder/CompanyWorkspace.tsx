"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FounderShell } from "@/components/founder/FounderShell";
import { ModuleCanvas } from "@/components/founder/modules/ModuleCanvas";
import { ValidatorModule } from "@/components/founder/modules/ValidatorModule";
import { CompetitorsModule } from "@/components/founder/modules/CompetitorsModule";
import { RevenueSimulator } from "@/components/founder/modules/RevenueSimulator";
import { RiskAnalysisModule } from "@/components/founder/modules/RiskAnalysisModule";
import { HealthScorePanel } from "@/components/founder/CompanyCard";
import { GlassCard } from "@/components/founder/GlassCard";
import { AssistantPanel } from "@/components/AssistantPanel";
import { AICoachFab } from "@/components/founder/AICoachFab";
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

  return (
    <FounderShell companyId={project.id} companyName={project.name}>
      <div className="px-8 py-8">
        <header className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {project.name}
          </p>
          <h1 className="font-display text-3xl font-bold text-navy-900">
            {moduleTitle(module)}
          </h1>
        </header>

        {module === "workspace" && <ModuleCanvas />}
        {module === "validator" && <ValidatorModule project={projectMeta} />}
        {module === "competitors" && <CompetitorsModule />}
        {module === "finance" && <RevenueSimulator />}
        {module === "market" && <MarketModule />}
        {module === "dashboard" && (
          <div className="space-y-6">
            <HealthScorePanel {...projectMeta} />
            <RiskAnalysisModule />
          </div>
        )}
        {(module === "roadmap" || module === "tasks") && (
          <KanbanModule project={project} />
        )}
        {module === "chat" && (
          <GlassCard className="h-[calc(100vh-12rem)] overflow-hidden p-0" hover={false}>
            <div className="h-full min-h-[480px]">
              <AssistantPanel
                context={{
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
                }}
              />
            </div>
          </GlassCard>
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
          "chat",
        ].includes(module) && (
          <ComingSoonModule module={module} />
        )}
      </div>
      {module !== "chat" && <AICoachFab companyId={project.id} />}
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
    chat: "AI Founder Coach",
    customers: "Customer Personas",
    pitch: "Pitch Deck",
    documents: "Documents",
    calendar: "Calendar",
    settings: "Settings",
  };
  return titles[module] ?? "Workspace";
}

function MarketModule() {
  const markets = [
    { country: "United States", tam: "$2.1B", growth: "+18%", size: 100 },
    { country: "United Kingdom", tam: "$420M", growth: "+14%", size: 65 },
    { country: "Germany", tam: "$380M", growth: "+12%", size: 58 },
    { country: "India", tam: "$890M", growth: "+24%", size: 82 },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {markets.map((m) => (
        <GlassCard key={m.country} className="p-5">
          <h3 className="font-display font-bold text-navy-900">{m.country}</h3>
          <div className="mt-3 flex items-end gap-4">
            <div
              className="rounded-t-lg bg-gradient-to-t from-navy-800 to-navy-400 transition-all duration-700"
              style={{ width: 32, height: m.size }}
            />
            <div>
              <p className="text-sm font-semibold text-navy-900">{m.tam}</p>
              <p className="text-xs text-emerald-600">{m.growth} YoY</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function KanbanModule({ project }: { project: CompanyProject }) {
  const columns = [
    { id: "now", label: "Now", items: project.nodes.slice(0, 2) },
    { id: "next", label: "Next", items: project.nodes.slice(2, 5) },
    { id: "later", label: "Later", items: project.nodes.slice(5) },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((col) => (
        <GlassCard key={col.id} className="p-4" hover={false}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {col.label}
          </h3>
          <div className="space-y-2">
            {col.items.length === 0 ? (
              <p className="text-xs text-slate-400">No items</p>
            ) : (
              col.items.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-navy-900/5 bg-white/60 p-3 text-sm font-medium text-navy-900"
                >
                  {n.title}
                  <div className="mt-2 h-1 rounded-full bg-navy-900/8">
                    <div
                      className="h-full rounded-full bg-navy-600"
                      style={{ width: `${n.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function ComingSoonModule({ module }: { module: string }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        Coming soon
      </p>
      <h2 className="mt-2 font-display text-xl font-bold capitalize text-navy-900">
        {module.replace(/-/g, " ")}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        This module connects to your Company Digital Twin and updates automatically.
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
