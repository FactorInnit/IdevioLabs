"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Loader2,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { NodeDetailPanel } from "@/components/NodeDetailPanel";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { ReminderPanel } from "@/components/ReminderPanel";
import { AssistantPanel } from "@/components/AssistantPanel";
import { CollaboratorPanel } from "@/components/CollaboratorPanel";
import { FinancialBreakdown } from "@/components/FinancialBreakdown";
import { WorkflowSection } from "@/components/workflow/WorkflowSection";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { NodeCategory, ProjectWithRelations } from "@/lib/types";

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      setProject(await res.json());
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const selectedNode =
    project?.nodes.find((n) => n.id === selectedNodeId) ?? null;

  const updateNode = async (data: {
    status?: string;
    progress?: number;
    title?: string;
    description?: string;
    note?: string;
  }) => {
    if (!selectedNodeId) return;

    await fetch(`/api/nodes/${selectedNodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    await loadProject();
  };

  const handleNodeMove = async (id: string, x: number, y: number) => {
    await fetch(`/api/nodes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posX: x, posY: y }),
    });
  };

  const handleTaskProgress = async (
    progress: number,
    status: string,
    note?: string
  ) => {
    if (!selectedNodeId) return;
    await fetch(`/api/nodes/${selectedNodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress, status, note }),
    });
    await loadProject();
  };

  const handleAddNode = async () => {
    const res = await fetch(`/api/projects/${projectId}/nodes`, {
      method: "POST",
    });
    if (res.ok) {
      const node = await res.json();
      await loadProject();
      setSelectedNodeId(node.id);
    }
  };

  const handleConnectNodes = async (sourceId: string, targetId: string) => {
    await fetch(`/api/projects/${projectId}/edges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId, targetId }),
    });
    await loadProject();
  };

  const handleDeleteNode = async (id: string) => {
    await fetch(`/api/nodes/${id}`, { method: "DELETE" });
    if (selectedNodeId === id) setSelectedNodeId(null);
    await loadProject();
  };

  const handleDeleteEdge = async (id: string) => {
    await fetch(`/api/edges/${id}`, { method: "DELETE" });
    await loadProject();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
        <p className="text-navy-800">Project not found.</p>
        <Link href="/dashboard" className="mt-4 text-navy-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const totalEstimatedCost = project.nodes.reduce(
    (sum, n) => sum + (n.estimatedCost ?? 0),
    0
  );
  const completedBlocks = project.nodes.filter(
    (n) => n.status === "completed"
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-6 py-5">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-navy-700"
          >
            <ArrowLeft className="h-4 w-4" />
            All startups
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-navy-950">
                {project.name}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                {project.description}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label="Overall progress"
              value={`${project.progress}%`}
              sub={`${completedBlocks} of ${project.nodes.length} blocks complete`}
            />
            {project.budget != null && (
              <StatCard
                icon={Wallet}
                label="Your budget"
                value={formatCurrency(project.budget)}
                sub="Starting capital"
              />
            )}
            <StatCard
              icon={DollarSign}
              label="Estimated cost"
              value={formatCurrency(totalEstimatedCost)}
              sub="Total across all blocks"
            />
            <StatCard
              icon={Target}
              label="Active blocks"
              value={String(
                project.nodes.filter((n) => n.status === "in_progress").length
              )}
              sub="Currently in progress"
            />
          </div>

          {project.budgetNotes && (
            <div className="mt-4 rounded-xl border border-navy-200 bg-navy-50 px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-600">
                Budget guidance
              </p>
              <p className="mt-1 text-sm leading-relaxed text-navy-900">
                {project.budgetNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-6 py-6 lg:flex-row">
        <main className="min-w-0 flex-1 space-y-6">
          <WorkflowSection
            nodes={project.nodes}
            edges={project.edges}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onNodeMove={handleNodeMove}
            onUpdateProgress={handleTaskProgress}
            onAddNode={handleAddNode}
            onConnectNodes={handleConnectNodes}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
          />

          <div>
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Block details
              </p>
              <h3 className="text-lg font-semibold text-navy-950">
                Selected workflow block
              </h3>
            </div>
            <NodeDetailPanel
              node={selectedNode}
              onUpdate={updateNode}
              onDelete={
                selectedNode
                  ? () => handleDeleteNode(selectedNode.id)
                  : undefined
              }
            />
          </div>

          <FinancialBreakdown budget={project.budget} nodes={project.nodes} />

          <div className="grid gap-6 sm:grid-cols-2">
            <ProgressTimeline
              logs={project.progressLogs}
              overallProgress={project.progress}
            />
            <ReminderPanel
              projectId={project.id}
              reminders={project.reminders}
              onRefresh={loadProject}
            />
          </div>

          <CollaboratorPanel projectId={project.id} />
        </main>

        {/* Persistent AI assistant — always on the side */}
        <aside className="w-full shrink-0 lg:w-[380px]">
          <div className="h-[560px] transition-all duration-300 lg:sticky lg:top-[88px] lg:h-[calc(100vh-108px)]">
            <AssistantPanel
              context={{
                projectId: project.id,
                name: project.name,
                description: project.description ?? undefined,
                budget: project.budget,
                progress: project.progress,
                selectedBlock: selectedNode
                  ? CATEGORY_CONFIG[selectedNode.category as NodeCategory]?.label
                  : undefined,
                nodes: project.nodes.map((n) => ({
                  id: n.id,
                  title: n.title,
                  category: n.category,
                  status: n.status,
                  progress: n.progress,
                })),
              }}
              onProjectChange={loadProject}
              onSelectNode={setSelectedNodeId}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-navy-950">{value}</p>
          <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  );
}
