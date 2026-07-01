"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, Circle, ListChecks } from "lucide-react";
import { WORKFLOW_PHASES, CATEGORY_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { OrderedTaskBlocks } from "./OrderedTaskBlocks";
import type { WorkflowEdgeData, WorkflowNodeData } from "@/lib/types";
import type { NodeCategory } from "@/lib/types";

interface WorkflowSectionProps {
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onUpdateProgress: (progress: number, status: string, note?: string) => void;
  onAddNode: () => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
}

export function WorkflowSection({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onNodeMove,
  onUpdateProgress,
  onAddNode,
  onConnectNodes,
  onDeleteNode,
  onDeleteEdge,
}: WorkflowSectionProps) {
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const actionPlanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedNodeId && actionPlanRef.current) {
      actionPlanRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedNodeId]);
  const getPhaseStats = (categories: NodeCategory[]) => {
    const phaseNodes = nodes.filter((n) =>
      categories.includes(n.category as NodeCategory)
    );
    const completed = phaseNodes.filter((n) => n.status === "completed").length;
    const total = phaseNodes.length;
    const avgProgress =
      total > 0
        ? Math.round(phaseNodes.reduce((s, n) => s + n.progress, 0) / total)
        : 0;
    return { completed, total, avgProgress };
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-navy-900 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-400">
              Business workflow
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Startup Roadmap Map
            </h2>
            <p className="mt-1 max-w-xl text-sm text-white/60">
              Eight interconnected blocks covering every aspect of your business.
              Drag to reorganize, click any block to edit details and track progress.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-2xl font-bold text-white">{nodes.length}</span>
            <span className="text-xs leading-tight text-white/60">
              workflow
              <br />
              blocks
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Four phases
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {WORKFLOW_PHASES.map((phase, index) => {
            const stats = getPhaseStats(phase.categories);
            const isLast = index === WORKFLOW_PHASES.length - 1;

            return (
              <div key={phase.id} className="relative flex items-stretch">
                <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500">
                      {phase.step}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {stats.completed}/{stats.total} done
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-navy-900">{phase.label}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">{phase.description}</p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {phase.categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-navy-700"
                      >
                        {CATEGORY_CONFIG[cat].shortLabel}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                      <span>Phase progress</span>
                      <span className="font-semibold text-navy-700">{stats.avgProgress}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-navy-700 transition-all"
                        style={{ width: `${stats.avgProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {!isLast && (
                  <div className="hidden items-center px-2 xl:flex">
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Block index — click to open sub-tasks
          </p>
          <div className="flex flex-wrap gap-2">
            {nodes
              .slice()
              .sort(
                (a, b) =>
                  (CATEGORY_CONFIG[a.category as NodeCategory]?.order ?? 0) -
                  (CATEGORY_CONFIG[b.category as NodeCategory]?.order ?? 0)
              )
              .map((node) => {
                const config = CATEGORY_CONFIG[node.category as NodeCategory];
                const isSelected = node.id === selectedNodeId;
                const Icon =
                  node.status === "completed"
                    ? CheckCircle2
                    : Circle;

                return (
                  <button
                    key={node.id}
                    onClick={() =>
                      onSelectNode(isSelected ? null : node.id)
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                      isSelected
                        ? "border-navy-700 bg-navy-900 text-white"
                        : "border-slate-200 bg-white text-navy-800 hover:border-navy-400 hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3 w-3",
                        node.status === "completed"
                          ? "text-navy-400"
                          : node.status === "in_progress"
                            ? "text-navy-600"
                            : "text-slate-300"
                      )}
                    />
                    <span className="font-bold">{String(config?.order ?? 0).padStart(2, "0")}</span>
                    {config?.shortLabel}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <div className="bg-navy-950 p-4">
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onNodeMove={onNodeMove}
          onAddNode={onAddNode}
          onConnectNodes={onConnectNodes}
          onDeleteNode={onDeleteNode}
          onDeleteEdge={onDeleteEdge}
        />
      </div>

      {/* Ordered task blocks for the selected node */}
      <div
        ref={actionPlanRef}
        className="grid-texture scroll-mt-24 border-t border-slate-200 bg-slate-50 px-6 py-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-navy-600" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {selectedNode
              ? "Sub-tasks for this block — do these in order"
              : "Action plan — pick a block to expand its sub-tasks"}
          </p>
        </div>
        <OrderedTaskBlocks node={selectedNode} onUpdateProgress={onUpdateProgress} />
      </div>
    </section>
  );
}
