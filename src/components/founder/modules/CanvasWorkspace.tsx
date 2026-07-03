"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  MessageSquare,
  Palette,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { parseNodeTasks } from "@/lib/project-utils";
import {
  BLOCK_COLORS,
  getBlockColor,
  loadCanvasMeta,
  saveCanvasMeta,
  type BlockColorId,
  type CanvasMeta,
} from "@/lib/canvas-meta";
import { cn } from "@/lib/utils";
import type { NodeCategory } from "@/lib/types";
import type { CompanyProject } from "../CompanyWorkspace";

const SECTIONS: NodeCategory[] = [
  "idea",
  "product",
  "marketing",
  "finance",
  "legal",
  "operations",
  "team",
  "launch",
];

export function CanvasWorkspace({ project }: { project: CompanyProject }) {
  const router = useRouter();
  const [meta, setMeta] = useState<CanvasMeta>({ colors: {}, comments: {}, sectionOrder: {} });
  const [dragId, setDragId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState<NodeCategory | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMeta(loadCanvasMeta(project.id));
  }, [project.id]);

  const persistMeta = useCallback(
    (next: CanvasMeta) => {
      setMeta(next);
      saveCanvasMeta(project.id, next);
    },
    [project.id]
  );

  const nodesBySection = useMemo(() => {
    const map: Record<NodeCategory, CompanyProject["nodes"]> = {} as Record<
      NodeCategory,
      CompanyProject["nodes"]
    >;
    for (const cat of SECTIONS) {
      const nodes = project.nodes.filter((n) => n.category === cat);
      const order = meta.sectionOrder[cat];
      if (order?.length) {
        map[cat] = [...nodes].sort(
          (a, b) => (order.indexOf(a.id) ?? 999) - (order.indexOf(b.id) ?? 999)
        );
      } else {
        map[cat] = nodes;
      }
    }
    return map;
  }, [project.nodes, meta.sectionOrder]);

  const selected = project.nodes.find((n) => n.id === selectedId);

  const moveToSection = async (nodeId: string, category: NodeCategory) => {
    await fetch(`/api/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    router.refresh();
  };

  const onSectionDrop = (cat: NodeCategory) => {
    if (!dragId) return;
    moveToSection(dragId, cat);
    setDragId(null);
  };

  const addBlock = async (category: NodeCategory) => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${project.id}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        title: newTitle.trim(),
        description: "Custom canvas block — add tasks and notes as you go.",
      }),
    });
    setNewTitle("");
    setShowAdd(null);
    setSaving(false);
    router.refresh();
  };

  const deleteBlock = async (nodeId: string) => {
    if (!confirm("Remove this block from your canvas?")) return;
    await fetch(`/api/nodes/${nodeId}`, { method: "DELETE" });
    setSelectedId(null);
    router.refresh();
  };

  const setColor = (nodeId: string, colorId: BlockColorId) => {
    persistMeta({ ...meta, colors: { ...meta.colors, [nodeId]: colorId } });
  };

  const setComment = (nodeId: string, comment: string) => {
    persistMeta({ ...meta, comments: { ...meta.comments, [nodeId]: comment } });
  };

  const saveCommentToServer = async (nodeId: string, comment: string) => {
    if (!comment.trim()) return;
    await fetch(`/api/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: comment }),
    });
  };

  return (
    <div className="space-y-4">
      <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4" hover={false}>
        <p className="text-sm text-slate-600">
          Your startup canvas — <strong className="text-navy-900">drag blocks</strong> between
          sections, click to customize colors &amp; add notes.
        </p>
        <span className="rounded-full bg-navy-900/8 px-3 py-1 text-xs font-semibold text-navy-800">
          {project.nodes.length} blocks
        </span>
      </GlassCard>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {SECTIONS.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const nodes = nodesBySection[cat] ?? [];
            return (
              <div
                key={cat}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onSectionDrop(cat)}
                className="flex w-[280px] shrink-0 flex-col rounded-2xl border border-navy-900/8 bg-white/60 shadow-sm"
              >
                <div
                  className="rounded-t-2xl px-4 py-3"
                  style={{ backgroundColor: config.minimap }}
                >
                  <h3 className="font-display text-sm font-bold text-white">{config.label}</h3>
                  <p className="text-[10px] text-white/70">
                    {nodes.length} block{nodes.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex min-h-[320px] flex-1 flex-col gap-3 p-3">
                  {nodes.map((node) => {
                    const color = getBlockColor(meta.colors[node.id]);
                    const tasks = parseNodeTasks(node.tasks);
                    const comment = meta.comments[node.id];
                    return (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={() => setDragId(node.id)}
                        onDragEnd={() => setDragId(null)}
                        onClick={() => setSelectedId(node.id)}
                        className={cn(
                          "cursor-grab rounded-xl border-2 p-4 shadow-md transition active:cursor-grabbing",
                          dragId === node.id && "opacity-40",
                          selectedId === node.id && "ring-2 ring-navy-700 ring-offset-2"
                        )}
                        style={{
                          borderColor: color.bg,
                          backgroundColor: color.light,
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-bold leading-snug text-navy-900">
                              {node.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                              {node.description}
                            </p>
                            <div className="mt-3">
                              <div className="mb-1 flex justify-between text-[10px] font-semibold text-navy-700">
                                <span>Progress</span>
                                <span>{node.progress}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/80">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${node.progress}%`,
                                    backgroundColor: color.bg,
                                  }}
                                />
                              </div>
                            </div>
                            {tasks.length > 0 && (
                              <p className="mt-2 text-[10px] font-medium text-slate-500">
                                {tasks.length} tasks
                              </p>
                            )}
                            {comment && (
                              <p className="mt-2 flex items-center gap-1 text-[10px] text-navy-600">
                                <MessageSquare className="h-3 w-3" />
                                Note added
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {showAdd === cat ? (
                    <div className="rounded-xl border border-dashed border-navy-300 bg-white p-3">
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Block title…"
                        className="w-full rounded-lg border px-2 py-1.5 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && addBlock(cat)}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => addBlock(cat)}
                          disabled={saving}
                          className="rounded-lg bg-navy-900 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAdd(null);
                            setNewTitle("");
                          }}
                          className="text-xs text-slate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAdd(cat)}
                      className="flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-navy-900/15 py-3 text-xs font-semibold text-navy-600 transition hover:border-navy-400 hover:bg-navy-900/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add block
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/40 p-4 sm:items-center">
          <GlassCard className="max-h-[85vh] w-full max-w-lg overflow-y-auto p-6" hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-navy-500">
                  {CATEGORY_CONFIG[selected.category as NodeCategory]?.label}
                </p>
                <h3 className="font-display text-xl font-bold text-navy-900">{selected.title}</h3>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-lg p-1 hover:bg-navy-900/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-600">{selected.description}</p>

            <div className="mt-5">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-navy-800">
                <Palette className="h-4 w-4" />
                Block color
              </p>
              <div className="flex flex-wrap gap-2">
                {BLOCK_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(selected.id, c.id)}
                    className={cn(
                      "h-8 w-8 rounded-lg border-2 transition",
                      meta.colors[selected.id] === c.id
                        ? "border-navy-900 scale-110"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: c.bg }}
                    aria-label={c.id}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-navy-800">
                <MessageSquare className="h-4 w-4" />
                Your notes &amp; comments
              </p>
              <textarea
                value={meta.comments[selected.id] ?? ""}
                onChange={(e) => setComment(selected.id, e.target.value)}
                onBlur={(e) => saveCommentToServer(selected.id, e.target.value)}
                placeholder="Add context, decisions, or reminders for this block…"
                rows={4}
                className="w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
              />
            </div>

            {parseNodeTasks(selected.tasks).length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold text-navy-800">Tasks in this block</p>
                <ol className="space-y-2">
                  {parseNodeTasks(selected.tasks).map((t, i) => (
                    <li
                      key={i}
                      className="rounded-lg bg-navy-900/5 px-3 py-2 text-sm text-slate-700"
                    >
                      <span className="font-bold text-navy-800">{i + 1}.</span> {t.title}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <button
              onClick={() => deleteBlock(selected.id)}
              className="mt-6 flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline"
            >
              <Trash2 className="h-4 w-4" />
              Remove block
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
