"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type Connection,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LayoutGrid, Layers, MousePointerClick, Move, Plus } from "lucide-react";
import { StartupNode, type StartupFlowNode } from "./StartupNode";
import { CATEGORY_CONFIG, gridPosition } from "@/lib/constants";
import type { WorkflowEdgeData, WorkflowNodeData } from "@/lib/types";
import type { NodeCategory } from "@/lib/types";

const nodeTypes: NodeTypes = {
  startup: StartupNode,
};

interface WorkflowCanvasProps {
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onAddNode: () => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
}

function toFlowNodes(
  dbNodes: WorkflowNodeData[],
  selectedNodeId: string | null,
  onSelectNode: (id: string | null) => void
): StartupFlowNode[] {
  return dbNodes.map((node) => ({
    id: node.id,
    type: "startup",
    position: { x: node.posX, y: node.posY },
    data: {
      category: node.category as NodeCategory,
      title: node.title,
      description: node.description,
      tools: node.tools,
      tasks: node.tasks,
      status: node.status,
      progress: node.progress,
      estimatedCost: node.estimatedCost,
      onSelect: (id: string) =>
        onSelectNode(id === selectedNodeId ? null : id),
    },
    selected: node.id === selectedNodeId,
  }));
}

function CanvasInner({
  nodes: dbNodes,
  edges: dbEdges,
  selectedNodeId,
  onSelectNode,
  onNodeMove,
  onAddNode,
  onConnectNodes,
  onDeleteNode,
  onDeleteEdge,
}: WorkflowCanvasProps) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<StartupFlowNode>(
    toFlowNodes(dbNodes, selectedNodeId, onSelectNode)
  );
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>(
    dbEdges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      animated: true,
      style: { stroke: "#5a7ab8", strokeWidth: 2 },
    }))
  );

  // Keep local flow state in sync with server data.
  useEffect(() => {
    setRfNodes(toFlowNodes(dbNodes, selectedNodeId, onSelectNode));
  }, [dbNodes, selectedNodeId, onSelectNode, setRfNodes]);

  useEffect(() => {
    setRfEdges(
      dbEdges.map((edge) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        animated: true,
        style: { stroke: "#5a7ab8", strokeWidth: 2 },
      }))
    );
  }, [dbEdges, setRfEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      setRfEdges((eds) => addEdge({ ...connection, animated: true }, eds));
      onConnectNodes(connection.source, connection.target);
    },
    [onConnectNodes, setRfEdges]
  );

  const onNodeDragStop = useCallback(
    (_event: unknown, node: StartupFlowNode) => {
      onNodeMove(node.id, node.position.x, node.position.y);
    },
    [onNodeMove]
  );

  const onNodesDelete = useCallback(
    (deleted: { id: string }[]) => {
      deleted.forEach((n) => onDeleteNode(n.id));
    },
    [onDeleteNode]
  );

  const onEdgesDelete = useCallback(
    (deleted: { id: string }[]) => {
      deleted.forEach((e) => onDeleteEdge(e.id));
    },
    [onDeleteEdge]
  );

  const autoArrange = useCallback(() => {
    const sorted = [...dbNodes].sort(
      (a, b) =>
        (CATEGORY_CONFIG[a.category as NodeCategory]?.order ?? 99) -
        (CATEGORY_CONFIG[b.category as NodeCategory]?.order ?? 99)
    );
    const positions = new Map<string, { x: number; y: number }>();
    sorted.forEach((n, i) => positions.set(n.id, gridPosition(i)));

    setRfNodes((nodes) =>
      nodes.map((n) => {
        const pos = positions.get(n.id);
        return pos ? { ...n, position: pos } : n;
      })
    );
    positions.forEach((pos, nodeId) => onNodeMove(nodeId, pos.x, pos.y));
  }, [dbNodes, onNodeMove, setRfNodes]);

  const completedCount = dbNodes.filter((n) => n.status === "completed").length;
  const activeCount = dbNodes.filter((n) => n.status === "in_progress").length;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-navy-700/50 bg-navy-950"
      style={{ height: 720 }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        deleteKeyCode={["Delete"]}
        nodesDraggable
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={28}
          size={1}
          color="rgba(90,122,184,0.12)"
        />
        <Background
          id="dots"
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.5}
          color="rgba(90,122,184,0.28)"
        />
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap
          position="bottom-left"
          pannable
          zoomable
          nodeColor={(node) => {
            const category = (node.data as StartupFlowNode["data"]).category;
            return CATEGORY_CONFIG[category]?.minimap ?? "#3b5998";
          }}
          maskColor="rgba(4, 8, 16, 0.85)"
          style={{ background: "#0a1628" }}
        />

        <Panel position="top-left" className="!m-4">
          <div className="rounded-lg border border-white/10 bg-navy-900/90 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-navy-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
                Canvas legend
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/60">
              <span>{completedCount} complete</span>
              <span>·</span>
              <span>{activeCount} in progress</span>
              <span>·</span>
              <span>{dbNodes.length - completedCount - activeCount} pending</span>
            </div>
          </div>
        </Panel>

        <Panel position="top-right" className="!m-4">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={autoArrange}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-navy-900/90 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-navy-800"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Auto-arrange
              </button>
              <button
                onClick={onAddNode}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-navy-900 shadow-lg transition hover:bg-white/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add block
              </button>
            </div>
            <div className="rounded-lg border border-white/10 bg-navy-900/90 px-3 py-2 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[10px] text-white/60">
                <span className="flex items-center gap-1">
                  <Move className="h-3 w-3" /> Drag to move
                </span>
                <span className="text-white/20">|</span>
                <span className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" /> Click to edit
                </span>
                <span className="text-white/20">|</span>
                <span>Drag dot → dot to connect</span>
                <span className="text-white/20">|</span>
                <span>Select + Delete to remove</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
