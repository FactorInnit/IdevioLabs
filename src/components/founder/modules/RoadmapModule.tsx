"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Map,
  Plus,
  Trash2,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { CATEGORY_CONFIG, WORKFLOW_PHASES } from "@/lib/constants";
import { parseNodeTasks } from "@/lib/project-utils";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NodeCategory } from "@/lib/types";
import type { CompanyProject } from "../CompanyWorkspace";

type ColumnId = "now" | "next" | "later" | "done";
type ViewMode = "map" | "board";

const COLUMNS: { id: ColumnId; label: string; sub: string }[] = [
  { id: "now", label: "Now", sub: "In progress" },
  { id: "next", label: "Next", sub: "Up next" },
  { id: "later", label: "Later", sub: "Queued" },
  { id: "done", label: "Completed", sub: "Shipped" },
];

function columnForNode(node: CompanyProject["nodes"][0]): ColumnId {
  if (node.status === "completed" || node.progress >= 100) return "done";
  if (node.status === "in_progress" || node.progress > 0) return "now";
  return "next";
}

const columnKey = (id: string) => `idevio-roadmap-col-${id}`;
const sequenceKey = (id: string) => `idevio-roadmap-seq-${id}`;

export function RoadmapModule({ project }: { project: CompanyProject }) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("map");
  const [overrides, setOverrides] = useState<Record<string, ColumnId>>({});
  const [sequence, setSequence] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<NodeCategory>("product");

  useEffect(() => {
    try {
      const colRaw = localStorage.getItem(columnKey(project.id));
      if (colRaw) setOverrides(JSON.parse(colRaw));
      const seqRaw = localStorage.getItem(sequenceKey(project.id));
      if (seqRaw) setSequence(JSON.parse(seqRaw));
    } catch {
      // ignore
    }
  }, [project.id]);

  const orderedNodes = useMemo(() => {
    if (sequence.length === 0) return project.nodes;
    return [...project.nodes].sort(
      (a, b) => (sequence.indexOf(a.id) ?? 999) - (sequence.indexOf(b.id) ?? 999)
    );
  }, [project.nodes, sequence]);

  const overallProgress =
    project.nodes.length > 0
      ? Math.round(
          project.nodes.reduce((s, n) => s + n.progress, 0) / project.nodes.length
        )
      : 0;

  const getColumn = (node: CompanyProject["nodes"][0]) =>
    overrides[node.id] ?? columnForNode(node);

  const persistSeq = (ids: string[]) => {
    setSequence(ids);
    localStorage.setItem(sequenceKey(project.id), JSON.stringify(ids));
  };

  const persistOverrides = (next: Record<string, ColumnId>) => {
    setOverrides(next);
    localStorage.setItem(columnKey(project.id), JSON.stringify(next));
  };

  const moveInSequence = (index: number, dir: -1 | 1) => {
    const ids = orderedNodes.map((n) => n.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    persistSeq(ids);
  };

  const moveToColumn = useCallback(
    async (nodeId: string, col: ColumnId) => {
      persistOverrides({ ...overrides, [nodeId]: col });
      setSaving(nodeId);
      const node = project.nodes.find((n) => n.id === nodeId);
      const progress =
        col === "done" ? 100 : col === "now" ? Math.max(10, node?.progress ?? 10) : 0;
      const status = col === "done" ? "completed" : col === "now" ? "in_progress" : "pending";
      await fetch(`/api/nodes/${nodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, progress }),
      });
      setSaving(null);
      router.refresh();
    },
    [overrides, project.nodes, router]
  );

  const updateProgress = async (nodeId: string, progress: number) => {
    setSaving(nodeId);
    await fetch(`/api/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress,
        status: progress >= 100 ? "completed" : progress > 0 ? "in_progress" : "pending",
      }),
    });
    setSaving(null);
    router.refresh();
  };

  const addBlock = async () => {
    if (!newTitle.trim()) return;
    setSaving("new");
    await fetch(`/api/projects/${project.id}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newCategory,
        title: newTitle.trim(),
        description: "Custom roadmap milestone.",
      }),
    });
    setNewTitle("");
    setShowAdd(false);
    setSaving(null);
    router.refresh();
  };

  const deleteBlock = async (nodeId: string) => {
    if (!confirm("Delete this milestone?")) return;
    setSaving(nodeId);
    await fetch(`/api/nodes/${nodeId}`, { method: "DELETE" });
    setSaving(null);
    router.refresh();
  };

  const grouped = COLUMNS.map((col) => ({
    ...col,
    items: project.nodes.filter((n) => getColumn(n) === col.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <GlassCard className="flex flex-1 flex-wrap items-center gap-6 p-5" hover={false}>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Overall progress</p>
            <p className="font-display text-3xl font-bold text-navy-900">{overallProgress}%</p>
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="h-3 overflow-hidden rounded-full bg-navy-900/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-navy-800 to-emerald-500 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {project.nodes.length} milestones · {project.nodes.filter((n) => n.progress >= 100).length} complete
            </p>
          </div>
        </GlassCard>
        <div className="flex gap-2">
          <button
            onClick={() => setView("map")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold",
              view === "map" ? "bg-navy-900 text-white" : "border text-navy-700"
            )}
          >
            <Map className="mr-1 inline h-4 w-4" />
            Sequence map
          </button>
          <button
            onClick={() => setView("board")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold",
              view === "board" ? "bg-navy-900 text-white" : "border text-navy-700"
            )}
          >
            Board
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {showAdd && (
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display font-bold text-navy-900">New milestone</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as NodeCategory)}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              {(Object.keys(CATEGORY_CONFIG) as NodeCategory[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_CONFIG[c].label}
                </option>
              ))}
            </select>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Milestone title"
              className="rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={addBlock}
              disabled={saving === "new"}
              className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Create
            </button>
            <button onClick={() => setShowAdd(false)} className="text-sm text-slate-500">
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        {WORKFLOW_PHASES.map((phase) => {
          const phaseNodes = project.nodes.filter((n) =>
            phase.categories.includes(n.category as NodeCategory)
          );
          const avg =
            phaseNodes.length > 0
              ? Math.round(phaseNodes.reduce((s, n) => s + n.progress, 0) / phaseNodes.length)
              : 0;
          return (
            <GlassCard key={phase.id} className="p-4" hover={false}>
              <p className="text-[10px] font-bold text-navy-400">{phase.step}</p>
              <p className="font-semibold text-navy-900">{phase.label}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-900/8">
                <div className="h-full rounded-full bg-navy-600" style={{ width: `${avg}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{avg}% · {phaseNodes.length} blocks</p>
            </GlassCard>
          );
        })}
      </div>

      {view === "map" ? (
        <GlassCard className="overflow-x-auto p-6" hover={false}>
          <p className="mb-6 text-sm text-slate-600">
            Your execution sequence — reorder with arrows. Each milestone shows live progress.
          </p>
          <div className="flex min-w-max items-start gap-2 pb-4">
            {orderedNodes.map((node, index) => {
              const cat = CATEGORY_CONFIG[node.category as NodeCategory];
              const tasks = parseNodeTasks(node.tasks);
              return (
                <div key={node.id} className="flex items-center">
                  <div className="w-[220px] rounded-2xl border-2 border-navy-900/10 bg-white p-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: cat?.minimap ?? "#081a3a" }}
                      >
                        {index + 1}
                      </span>
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => moveInSequence(index, -1)}
                          className="rounded p-0.5 hover:bg-navy-900/5"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveInSequence(index, 1)}
                          className="rounded p-0.5 hover:bg-navy-900/5"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteBlock(node.id)}
                          className="rounded p-0.5 text-slate-300 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase text-navy-500">
                      {cat?.shortLabel}
                    </p>
                    <p className="font-display font-bold text-navy-900">{node.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{node.description}</p>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] font-semibold">
                        <span>{node.progress}%</span>
                        <span className="text-slate-400">{tasks.length} tasks</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={node.progress}
                        onChange={(e) => updateProgress(node.id, Number(e.target.value))}
                        className="w-full accent-navy-800"
                      />
                    </div>
                    {node.estimatedCost != null && node.estimatedCost > 0 && (
                      <p className="mt-2 text-[10px] text-emerald-700">
                        {formatCurrency(node.estimatedCost)}
                      </p>
                    )}
                  </div>
                  {index < orderedNodes.length - 1 && (
                    <ArrowRight className="mx-1 h-6 w-6 shrink-0 text-navy-300" />
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {grouped.map((col) => (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  moveToColumn(dragId, col.id);
                  setDragId(null);
                }
              }}
              className="min-h-[200px] rounded-2xl border-2 border-dashed border-navy-900/10 bg-navy-900/2 p-3"
            >
              <h3 className="font-display text-sm font-bold text-navy-900">{col.label}</h3>
              <p className="mb-3 text-[10px] text-slate-400">
                {col.sub} · {col.items.length}
              </p>
              <div className="space-y-2">
                {col.items.map((node) => {
                  const cat = CATEGORY_CONFIG[node.category as NodeCategory];
                  return (
                    <div
                      key={node.id}
                      draggable
                      onDragStart={() => setDragId(node.id)}
                      onDragEnd={() => setDragId(null)}
                      className={cn(
                        "cursor-grab rounded-xl border bg-white p-3 shadow-sm active:cursor-grabbing",
                        dragId === node.id && "opacity-50"
                      )}
                    >
                      <div className="flex gap-2">
                        <GripVertical className="h-4 w-4 text-slate-300" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-navy-500">
                            {cat?.shortLabel}
                          </span>
                          <p className="text-sm font-semibold text-navy-900">{node.title}</p>
                          <div className="mt-2 h-1.5 rounded-full bg-navy-900/8">
                            <div
                              className="h-full rounded-full bg-navy-600"
                              style={{ width: `${node.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
