"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  MessageSquare,
  Palette,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { CanvasBlockNode, type CanvasBlockNodeData } from "./CanvasBlockNode";
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

const nodeTypes = { canvasBlock: CanvasBlockNode };

const CATEGORY_ORDER: NodeCategory[] = [
  "idea",
  "product",
  "marketing",
  "finance",
  "legal",
  "operations",
  "team",
  "launch",
];

const sequenceKey = (projectId: string) => `idevio-canvas-seq-${projectId}`;

function defaultSequence(nodes: CompanyProject["nodes"]): string[] {
  return [...nodes].sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category as NodeCategory);
    const cb = CATEGORY_ORDER.indexOf(b.category as NodeCategory);
    if (ca !== cb) return ca - cb;
    return a.createdAt > b.createdAt ? 1 : -1;
  }).map((n) => n.id);
}

function mindMapPosition(index: number, total: number) {
  const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(total))));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const xOffset = row % 2 === 1 ? 140 : 0;
  return { x: col * 320 + xOffset, y: row * 200 };
}

export function CanvasWorkspace({ project }: { project: CompanyProject }) {
  const router = useRouter();
  const [meta, setMeta] = useState<CanvasMeta>({ colors: {}, comments: {}, sectionOrder: {} });
  const [sequence, setSequence] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<NodeCategory>("product");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMeta(loadCanvasMeta(project.id));
    try {
      const raw = localStorage.getItem(sequenceKey(project.id));
      if (raw) setSequence(JSON.parse(raw));
      else setSequence(defaultSequence(project.nodes));
    } catch {
      setSequence(defaultSequence(project.nodes));
    }
  }, [project.id, project.nodes]);

  const persistMeta = useCallback(
    (next: CanvasMeta) => {
      setMeta(next);
      saveCanvasMeta(project.id, next);
    },
    [project.id]
  );

  const orderedNodes = useMemo(() => {
    const ids = sequence.length ? sequence : defaultSequence(project.nodes);
    return ids
      .map((id) => project.nodes.find((n) => n.id === id))
      .filter(Boolean) as CompanyProject["nodes"];
  }, [project.nodes, sequence]);

  const flowNodes: Node[] = useMemo(() => {
    return orderedNodes.map((node, index) => {
      const color = getBlockColor(meta.colors[node.id]);
      const tasks = parseNodeTasks(node.tasks);
      const pos =
        node.posX > 0 || node.posY > 0
          ? { x: node.posX, y: node.posY }
          : mindMapPosition(index, orderedNodes.length);

      return {
        id: node.id,
        type: "canvasBlock",
        position: pos,
        data: {
          title: node.title,
          description: node.description,
          progress: node.progress,
          category: node.category as NodeCategory,
          taskCount: tasks.length,
          borderColor: color.bg,
          bgColor: color.light,
          step: index + 1,
          hasNote: Boolean(meta.comments[node.id]),
        } satisfies CanvasBlockNodeData,
      };
    });
  }, [orderedNodes, meta]);

  const flowEdges: Edge[] = useMemo(() => {
    const styled = (id: string, source: string, target: string, dashed = false): Edge => ({
      id,
      source,
      target,
      animated: !dashed,
      style: {
        stroke: dashed ? "#94a3b8" : "#4a78b4",
        strokeWidth: 2,
        strokeDasharray: dashed ? "6 4" : undefined,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: dashed ? "#94a3b8" : "#4a78b4" },
    });

    if (project.edges.length > 0) {
      return project.edges.map((e) => styled(e.id, e.sourceId, e.targetId));
    }

    return orderedNodes.slice(0, -1).map((node, i) =>
      styled(`seq-${node.id}`, node.id, orderedNodes[i + 1].id, true)
    );
  }, [project.edges, orderedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const selected = project.nodes.find((n) => n.id === selectedId);

  const onNodeDragStop: OnNodeDrag = useCallback(
    async (_event, node) => {
      await fetch(`/api/nodes/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posX: node.position.x, posY: node.position.y }),
      });
    },
    []
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedId(node.id);
  }, []);

  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const optimistic: Edge = {
        id: `temp-${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        animated: true,
        style: { stroke: "#4a78b4", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#4a78b4" },
      };
      setEdges((current) => addEdge(optimistic, current));

      const res = await fetch(`/api/projects/${project.id}/edges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: connection.source,
          targetId: connection.target,
        }),
      });

      if (!res.ok) {
        setEdges((current) => current.filter((edge) => edge.id !== optimistic.id));
        return;
      }

      router.refresh();
    },
    [project.id, router, setEdges]
  );

  const onEdgesDelete = useCallback(
    async (deleted: Edge[]) => {
      await Promise.all(
        deleted
          .filter((edge) => !edge.id.startsWith("seq-") && !edge.id.startsWith("temp-"))
          .map((edge) => fetch(`/api/edges/${edge.id}`, { method: "DELETE" }))
      );
      router.refresh();
    },
    [router]
  );

  const addBlock = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${project.id}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newCategory,
        title: newTitle.trim(),
        description: "Custom canvas block — add tasks and notes as you go.",
      }),
    });
    setNewTitle("");
    setShowAdd(false);
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

  const updateProgress = async (nodeId: string, progress: number) => {
    await fetch(`/api/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress,
        status: progress >= 100 ? "completed" : progress > 0 ? "in_progress" : "pending",
      }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4" hover={false}>
        <p className="text-sm text-slate-600">
          Your startup mind map — drag blocks between sections on the canvas, click to edit, and
          add colors &amp; notes.{" "}
          <strong className="text-navy-900">
            Drag from one block&apos;s dot to another to connect them.
          </strong>{" "}
          Select a line and press Delete to remove it.
        </p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-navy-900/8 px-3 py-1 text-xs font-semibold text-navy-800">
            {project.nodes.length} blocks
          </span>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 rounded-xl bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add block
          </button>
        </div>
      </GlassCard>

      {showAdd && (
        <GlassCard className="p-4" hover={false}>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as NodeCategory)}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_CONFIG[c].label}
                </option>
              ))}
            </select>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Block title…"
              className="rounded-xl border px-3 py-2 text-sm sm:col-span-2"
              onKeyDown={(e) => e.key === "Enter" && addBlock()}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={addBlock}
              disabled={saving}
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

      <GlassCard className="h-[calc(100vh-14rem)] overflow-hidden p-0" hover={false}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          nodesConnectable
          edgesReconnectable
          deleteKeyCode={["Backspace", "Delete"]}
          connectionLineStyle={{ stroke: "#4a78b4", strokeWidth: 2 }}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.25}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} color="rgba(8,26,58,0.05)" />
          <Controls />
          <MiniMap
            nodeColor="#081a3a"
            maskColor="rgba(248,250,252,0.85)"
            className="!rounded-xl"
          />
        </ReactFlow>
      </GlassCard>

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

            <div className="mt-4">
              <label className="text-xs font-semibold text-navy-800">Progress</label>
              <input
                type="range"
                min={0}
                max={100}
                value={selected.progress}
                onChange={(e) => updateProgress(selected.id, Number(e.target.value))}
                className="mt-1 w-full accent-navy-800"
              />
            </div>

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
                Notes &amp; comments
              </p>
              <textarea
                value={meta.comments[selected.id] ?? ""}
                onChange={(e) => setComment(selected.id, e.target.value)}
                onBlur={(e) => saveCommentToServer(selected.id, e.target.value)}
                placeholder="Decisions, context, reminders…"
                rows={4}
                className="w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
              />
            </div>

            {parseNodeTasks(selected.tasks).length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold text-navy-800">Tasks</p>
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
