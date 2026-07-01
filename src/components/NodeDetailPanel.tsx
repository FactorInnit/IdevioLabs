"use client";

import { useEffect, useState } from "react";
import {
  Circle,
  ExternalLink,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { CATEGORY_CONFIG, getPhaseForCategory } from "@/lib/constants";
import { cn, formatCurrency, parseJson, parseTasks } from "@/lib/utils";
import type { NodeCategory, ToolRecommendation, WorkflowNodeData } from "@/lib/types";

interface NodeDetailPanelProps {
  node: WorkflowNodeData | null;
  onUpdate: (data: {
    status?: string;
    progress?: number;
    title?: string;
    description?: string;
    note?: string;
  }) => Promise<void>;
  onDelete?: () => void;
}

export function NodeDetailPanel({ node, onUpdate, onDelete }: NodeDetailPanelProps) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setDescription(node.description);
      setNote("");
    }
  }, [node]);

  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900">
          <Circle className="h-6 w-6 text-white/40" />
        </div>
        <h3 className="text-sm font-semibold text-navy-900">No block selected</h3>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
          Click a block on the workflow map or use the block index above the canvas
          to view tools, tasks, and update progress.
        </p>
      </div>
    );
  }

  const config = CATEGORY_CONFIG[node.category as NodeCategory] ?? CATEGORY_CONFIG.operations;
  const phase = getPhaseForCategory(node.category as NodeCategory);
  const tools = parseJson<ToolRecommendation[]>(node.tools, []);
  const tasks = parseTasks(node.tasks);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        title: title || node.title,
        description: description || node.description,
        note: note || undefined,
      });
      setNote("");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status: string, progress: number) => {
    setSaving(true);
    try {
      await onUpdate({
        status,
        progress,
        note: `Marked as ${status.replace("_", " ")}`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={cn("border-b border-white/10 px-5 py-4", config.headerBg)}>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-[11px] font-bold text-white">
            {String(config.order).padStart(2, "0")}
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
              {config.label}
              {phase ? ` · ${phase.label} phase` : ""}
            </p>
            <input
              value={title || node.title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-0.5 w-full bg-transparent text-lg font-semibold text-white outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <section>
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Overview
          </label>
          <textarea
            value={description || node.description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-navy-400 focus:bg-white"
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Progress
            </h4>
            <span className="text-lg font-bold text-navy-900">{node.progress}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={node.progress}
            onChange={(e) =>
              onUpdate({
                progress: Number(e.target.value),
                status:
                  Number(e.target.value) === 100
                    ? "completed"
                    : Number(e.target.value) > 0
                      ? "in_progress"
                      : "pending",
              })
            }
            className="w-full accent-navy-800"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setStatus("in_progress", Math.max(node.progress, 25))}
              className="rounded-lg border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800 transition hover:bg-navy-50"
            >
              Mark in progress
            </button>
            <button
              onClick={() => setStatus("completed", 100)}
              className="rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-800"
            >
              Mark complete
            </button>
          </div>
        </section>

        {node.estimatedCost != null && (
          <section className="rounded-xl border border-navy-200 bg-navy-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-600">
              Estimated budget
            </p>
            <p className="mt-1 text-xl font-bold text-navy-950">
              {formatCurrency(node.estimatedCost)}
            </p>
          </section>
        )}

        <section>
          <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Recommended tools ({tools.length})
          </h4>
          <div className="space-y-2">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-navy-950">{tool.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {tool.purpose}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold text-navy-600">
                      {tool.pricing}
                    </p>
                  </div>
                  {tool.url && (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-navy-300 hover:text-navy-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Action items ({tasks.length})
          </h4>
          <ul className="space-y-2">
            {tasks.map((task, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="font-semibold text-navy-950">{task.title}</span>
                  {task.detail && (
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                      {task.detail}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-slate-400">
            Full step-by-step plan with tools &amp; links is in the workflow section above.
          </p>
        </section>

        <section>
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Progress log
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you accomplish on this block?"
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-navy-400 focus:bg-white"
          />
        </section>
      </div>

      <div className="flex gap-2 border-t border-slate-200 bg-slate-50 p-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save changes
        </button>
        {onDelete && (
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Delete this block? This will also remove its connections."
                )
              ) {
                onDelete();
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
