import OpenAI from "openai";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { ASSISTANT_NAME } from "@/lib/brand";
import {
  createEdge,
  createNodeForProject,
  deleteNode,
  getProject,
  updateNodeProgress,
} from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import type { NodeCategory, NodeStatus } from "@/lib/types";

export interface AssistantNodeRef {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
}

export interface AssistantContext {
  projectId?: string;
  name?: string;
  description?: string;
  budget?: number | null;
  progress?: number;
  selectedBlock?: string;
  nodes?: AssistantNodeRef[];
  prompt?: string;
  budgetNotes?: string | null;
  blockSummaries?: {
    title: string;
    category: string;
    progress: number;
    status: string;
    taskCount: number;
    description?: string;
  }[];
  strategyMode?: boolean;
}

export interface ActionResult {
  action: string;
  success: boolean;
  message: string;
  nodeId?: string;
}

const CATEGORIES: NodeCategory[] = [
  "idea",
  "product",
  "marketing",
  "finance",
  "legal",
  "operations",
  "team",
  "launch",
];

const CATEGORY_DEFAULTS: Record<
  NodeCategory,
  { title: string; description: string; estimatedCost: number }
> = {
  idea: {
    title: "Validate the Problem",
    description: "Confirm real demand before building anything.",
    estimatedCost: 0,
  },
  product: {
    title: "Build Your MVP",
    description: "Ship the smallest version that solves the core problem.",
    estimatedCost: 0,
  },
  marketing: {
    title: "Go-to-Market Strategy",
    description: "Plan how you'll reach and convert your first customers.",
    estimatedCost: 0,
  },
  finance: {
    title: "Financial Planning",
    description: "Set up budgeting, accounting, and financial tracking.",
    estimatedCost: 0,
  },
  legal: {
    title: "Legal Foundations",
    description: "Handle incorporation, contracts, and compliance basics.",
    estimatedCost: 0,
  },
  operations: {
    title: "Operations Setup",
    description: "Define how your business runs day to day.",
    estimatedCost: 0,
  },
  team: {
    title: "Team & Hiring",
    description: "Plan roles, equity, and early hires.",
    estimatedCost: 0,
  },
  launch: {
    title: "Launch & Growth",
    description: "Execute launch and track early growth metrics.",
    estimatedCost: 0,
  },
};

export const ASSISTANT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "add_block",
      description:
        "Add a new workflow block to the user's roadmap. Use when they ask to add/create a block (e.g. finance, marketing, legal).",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: CATEGORIES,
            description: "Block category",
          },
          title: { type: "string", description: "Block title" },
          description: { type: "string", description: "What this block covers" },
          estimatedCost: { type: "number", description: "Estimated cost in USD" },
        },
        required: ["category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_block",
      description:
        "Update an existing workflow block's title, description, status, progress, category, or cost.",
      parameters: {
        type: "object",
        properties: {
          blockRef: {
            type: "string",
            description:
              "Block to update — category name (finance), partial title, or exact id",
          },
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["pending", "in_progress", "completed"],
          },
          progress: { type: "number", description: "0-100" },
          category: { type: "string", enum: CATEGORIES },
          estimatedCost: { type: "number" },
        },
        required: ["blockRef"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_block",
      description: "Remove a workflow block from the roadmap.",
      parameters: {
        type: "object",
        properties: {
          blockRef: {
            type: "string",
            description: "Category, title keyword, or block id",
          },
        },
        required: ["blockRef"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "connect_blocks",
      description: "Connect two workflow blocks with an arrow on the map.",
      parameters: {
        type: "object",
        properties: {
          sourceRef: { type: "string", description: "Source block ref" },
          targetRef: { type: "string", description: "Target block ref" },
        },
        required: ["sourceRef", "targetRef"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_budget",
      description: "Set or change the project's total startup budget.",
      parameters: {
        type: "object",
        properties: {
          budget: { type: "number", description: "Budget in USD" },
          budgetNotes: { type: "string", description: "Optional budget guidance" },
        },
        required: ["budget"],
      },
    },
  },
];

function normalizeCategory(input: string): NodeCategory | null {
  const key = input.toLowerCase().trim();
  if (CATEGORIES.includes(key as NodeCategory)) return key as NodeCategory;

  for (const cat of CATEGORIES) {
    const config = CATEGORY_CONFIG[cat];
    if (
      config.label.toLowerCase().includes(key) ||
      config.shortLabel.toLowerCase() === key ||
      key.includes(cat)
    ) {
      return cat;
    }
  }
  return null;
}

function findNode(
  nodes: AssistantNodeRef[],
  ref: string
): AssistantNodeRef | undefined {
  const q = ref.toLowerCase().trim();
  const byId = nodes.find((n) => n.id === ref);
  if (byId) return byId;

  const byCategory = nodes.find((n) => n.category.toLowerCase() === q);
  if (byCategory) return byCategory;

  const cat = normalizeCategory(ref);
  if (cat) {
    const match = nodes.find((n) => n.category === cat);
    if (match) return match;
  }

  return nodes.find(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      q.includes(n.title.toLowerCase()) ||
      CATEGORY_CONFIG[n.category as NodeCategory]?.shortLabel.toLowerCase() === q
  );
}

async function loadNodes(projectId: string): Promise<AssistantNodeRef[]> {
  const project = await getProject(projectId);
  if (!project) return [];
  return project.nodes.map((n) => ({
    id: n.id,
    title: n.title,
    category: n.category,
    status: n.status,
    progress: n.progress,
  }));
}

export async function executeAssistantAction(
  projectId: string,
  name: string,
  args: Record<string, unknown>,
  nodes: AssistantNodeRef[]
): Promise<ActionResult> {
  try {
    switch (name) {
      case "add_block": {
        const category = normalizeCategory(String(args.category ?? ""));
        if (!category) {
          return {
            action: name,
            success: false,
            message: "Invalid block category.",
          };
        }
        const defaults = CATEGORY_DEFAULTS[category];
        const node = await createNodeForProject(projectId, {
          category,
          title: String(args.title ?? defaults.title),
          description: String(args.description ?? defaults.description),
          estimatedCost:
            typeof args.estimatedCost === "number"
              ? args.estimatedCost
              : defaults.estimatedCost,
        });
        return {
          action: name,
          success: true,
          message: `Added ${CATEGORY_CONFIG[category].shortLabel} block "${node.title}".`,
          nodeId: node.id,
        };
      }

      case "update_block": {
        const ref = String(args.blockRef ?? "");
        const node = findNode(nodes, ref);
        if (!node) {
          return {
            action: name,
            success: false,
            message: `Couldn't find a block matching "${ref}".`,
          };
        }
        const status = args.status as NodeStatus | undefined;
        await updateNodeProgress(node.id, {
          title: args.title ? String(args.title) : undefined,
          description: args.description ? String(args.description) : undefined,
          status,
          progress:
            typeof args.progress === "number" ? args.progress : undefined,
          note: `Updated by ${ASSISTANT_NAME}`,
        });
        if (args.category || args.estimatedCost !== undefined) {
          await prisma.workflowNode.update({
            where: { id: node.id },
            data: {
              category: args.category
                ? normalizeCategory(String(args.category)) ?? node.category
                : undefined,
              estimatedCost:
                typeof args.estimatedCost === "number"
                  ? args.estimatedCost
                  : undefined,
            },
          });
        }
        return {
          action: name,
          success: true,
          message: `Updated "${node.title}".`,
          nodeId: node.id,
        };
      }

      case "delete_block": {
        const ref = String(args.blockRef ?? "");
        const node = findNode(nodes, ref);
        if (!node) {
          return {
            action: name,
            success: false,
            message: `Couldn't find a block matching "${ref}".`,
          };
        }
        await deleteNode(node.id);
        return {
          action: name,
          success: true,
          message: `Removed "${node.title}".`,
        };
      }

      case "connect_blocks": {
        const source = findNode(nodes, String(args.sourceRef ?? ""));
        const target = findNode(nodes, String(args.targetRef ?? ""));
        if (!source || !target) {
          return {
            action: name,
            success: false,
            message: "Couldn't find one or both blocks to connect.",
          };
        }
        await createEdge(projectId, source.id, target.id);
        return {
          action: name,
          success: true,
          message: `Connected "${source.title}" → "${target.title}".`,
        };
      }

      case "update_budget": {
        const budget = Number(args.budget);
        if (!Number.isFinite(budget) || budget < 0) {
          return {
            action: name,
            success: false,
            message: "Invalid budget amount.",
          };
        }
        await prisma.project.update({
          where: { id: projectId },
          data: {
            budget,
            budgetNotes: args.budgetNotes
              ? String(args.budgetNotes)
              : `Budget set to $${budget.toLocaleString()} by ${ASSISTANT_NAME}.`,
          },
        });
        return {
          action: name,
          success: true,
          message: `Set project budget to $${budget.toLocaleString()}.`,
        };
      }

      default:
        return { action: name, success: false, message: "Unknown action." };
    }
  } catch (error) {
    console.error(error);
    return {
      action: name,
      success: false,
      message: `Failed to run ${name}.`,
    };
  }
}

export async function executeToolCalls(
  projectId: string,
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
): Promise<{ results: ActionResult[]; selectNodeId?: string }> {
  let nodes = await loadNodes(projectId);
  const results: ActionResult[] = [];
  let selectNodeId: string | undefined;

  for (const call of toolCalls) {
    if (call.type !== "function") continue;
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
    } catch {
      results.push({
        action: call.function.name,
        success: false,
        message: "Invalid tool arguments.",
      });
      continue;
    }
    const result = await executeAssistantAction(
      projectId,
      call.function.name,
      args,
      nodes
    );
    results.push(result);
    if (result.nodeId) selectNodeId = result.nodeId;
    nodes = await loadNodes(projectId);
  }

  return { results, selectNodeId };
}

/** Rule-based action detection when OpenAI is unavailable. */
export function detectFallbackActions(
  message: string
): { name: string; args: Record<string, unknown> }[] {
  const m = message.toLowerCase();
  const actions: { name: string; args: Record<string, unknown> }[] = [];

  const addMatch =
    m.match(/add\s+(?:a\s+)?(?:new\s+)?(\w+)\s+block/) ||
    m.match(/create\s+(?:a\s+)?(?:new\s+)?(\w+)\s+block/) ||
    m.match(/add\s+(?:a\s+)?(\w+)\s+(?:block|section)/);
  if (addMatch) {
    const cat = normalizeCategory(addMatch[1]);
    if (cat) actions.push({ name: "add_block", args: { category: cat } });
  }

  if (m.includes("delete") && m.includes("block")) {
    for (const cat of CATEGORIES) {
      if (m.includes(cat)) {
        actions.push({ name: "delete_block", args: { blockRef: cat } });
        break;
      }
    }
  }

  const budgetMatch = m.match(
    /(?:set|change|update)\s+(?:my\s+)?budget\s+(?:to\s+)?\$?(\d+)/
  );
  if (budgetMatch) {
    actions.push({
      name: "update_budget",
      args: { budget: Number(budgetMatch[1]) },
    });
  }

  if (
    (m.includes("mark") || m.includes("complete")) &&
    (m.includes("done") || m.includes("complete"))
  ) {
    for (const cat of CATEGORIES) {
      if (m.includes(cat)) {
        actions.push({
          name: "update_block",
          args: { blockRef: cat, status: "completed", progress: 100 },
        });
        break;
      }
    }
  }

  return actions;
}

export function formatActionReply(
  results: ActionResult[],
  userMessage: string
): string {
  if (results.length === 0) return "";

  const ok = results.filter((r) => r.success);
  const fail = results.filter((r) => !r.success);

  if (ok.length === 0) {
    return `I tried to help but couldn't make that change: ${fail.map((f) => f.message).join(" ")}`;
  }

  const lines = ok.map((r) => `✓ ${r.message}`);
  const failLine =
    fail.length > 0
      ? `\n\nCouldn't complete: ${fail.map((f) => f.message).join(" ")}`
      : "";

  return `Done — I updated your roadmap:\n${lines.join("\n")}${failLine}\n\nYou should see the changes on your workflow map now. Anything else you'd like me to adjust?`;
}

export function buildNodesSummary(nodes: AssistantNodeRef[]): string {
  if (nodes.length === 0) return "No blocks yet.";
  return nodes
    .map(
      (n) =>
        `- [${n.id.slice(0, 8)}] ${CATEGORY_CONFIG[n.category as NodeCategory]?.shortLabel ?? n.category}: "${n.title}" (${n.status}, ${n.progress}%)`
    )
    .join("\n");
}
