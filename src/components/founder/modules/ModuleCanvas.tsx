"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GlassCard } from "../GlassCard";

const CANVAS_MODULES = [
  "Business Model",
  "Customer Personas",
  "Revenue",
  "Competitors",
  "MVP",
  "Tech Stack",
  "Hiring",
  "Marketing",
  "Fundraising",
  "Execution",
] as const;

const MODULE_Y_GAP = 120;

function buildCanvasNodes(): Node[] {
  return CANVAS_MODULES.map((label, i) => ({
    id: `mod-${i}`,
    type: "default",
    position: { x: 280, y: i * MODULE_Y_GAP },
    data: {
      label: (
        <div className="px-2 py-1 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Module {i + 1}
          </p>
          <p className="font-display text-sm font-bold text-navy-900">{label}</p>
        </div>
      ),
    },
    style: {
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.6)",
      borderRadius: 16,
      padding: 12,
      minWidth: 180,
      boxShadow: "0 8px 32px rgba(8,26,58,0.08)",
    },
  }));
}

function buildCanvasEdges(): Edge[] {
  return CANVAS_MODULES.slice(0, -1).map((_, i) => ({
    id: `e-${i}`,
    source: `mod-${i}`,
    target: `mod-${i + 1}`,
    animated: true,
    style: { stroke: "#4a78b4", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#4a78b4" },
  }));
}

export function ModuleCanvas() {
  const initialNodes = useMemo(() => buildCanvasNodes(), []);
  const initialEdges = useMemo(() => buildCanvasEdges(), []);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <GlassCard className="h-[calc(100vh-12rem)] overflow-hidden p-0" hover={false}>
      <div className="border-b border-navy-900/5 px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Company Digital Twin
        </p>
        <p className="font-display text-sm font-semibold text-navy-900">
          Live startup model — drag modules, connect the stack
        </p>
      </div>
      <div className="h-[calc(100%-3.5rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.4}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} color="rgba(8,26,58,0.04)" />
          <Controls />
          <MiniMap
            nodeColor="#081a3a"
            maskColor="rgba(248,250,252,0.8)"
            className="!rounded-xl"
          />
        </ReactFlow>
      </div>
    </GlassCard>
  );
}
