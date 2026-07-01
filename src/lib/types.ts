export type NodeCategory =
  | "idea"
  | "product"
  | "marketing"
  | "finance"
  | "legal"
  | "operations"
  | "team"
  | "launch";

export type NodeStatus = "pending" | "in_progress" | "completed";

export interface ToolRecommendation {
  name: string;
  purpose: string;
  pricing: string;
  url?: string;
}

export interface TaskResource {
  label: string;
  url: string;
}

export interface TaskStep {
  title: string;
  detail: string;
  tools: string[];
  resources: TaskResource[];
  estimatedTime?: string;
}

export interface GeneratedNode {
  category: NodeCategory;
  title: string;
  description: string;
  tools: ToolRecommendation[];
  tasks: TaskStep[];
  estimatedCost?: number;
  posX: number;
  posY: number;
}

export interface GeneratedEdge {
  sourceCategory: NodeCategory;
  targetCategory: NodeCategory;
}

export interface GeneratedRoadmap {
  name: string;
  description: string;
  budgetNotes: string;
  nodes: GeneratedNode[];
  edges: GeneratedEdge[];
  dailyReminders: {
    title: string;
    message: string;
    time: string;
    days: number[];
  }[];
}

export interface ProjectWithRelations {
  id: string;
  name: string;
  prompt: string;
  description: string | null;
  budget: number | null;
  budgetNotes: string | null;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  reminders: ReminderData[];
  progressLogs: ProgressLogData[];
}

export interface WorkflowNodeData {
  id: string;
  projectId: string;
  category: string;
  title: string;
  description: string;
  tools: string;
  tasks: string;
  status: string;
  progress: number;
  posX: number;
  posY: number;
  estimatedCost: number | null;
}

export interface WorkflowEdgeData {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
}

export interface ReminderData {
  id: string;
  projectId: string;
  title: string;
  message: string;
  time: string;
  days: string;
  enabled: boolean;
}

export interface ProgressLogData {
  id: string;
  projectId: string;
  nodeId: string | null;
  note: string;
  createdAt: string;
}
