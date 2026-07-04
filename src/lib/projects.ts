import { prisma } from "@/lib/prisma";
import { generateRoadmap } from "@/lib/ai";
import { calculateProjectProgress } from "@/lib/utils";
import type { GeneratedRoadmap, NodeCategory } from "@/lib/types";

export async function createProjectFromPrompt(
  prompt: string,
  budget?: number,
  userId?: string | null
) {
  const roadmap = await generateRoadmap(prompt, budget);
  return saveRoadmap(roadmap, prompt, budget, userId);
}

async function saveRoadmap(
  roadmap: GeneratedRoadmap,
  prompt: string,
  budget?: number,
  userId?: string | null
) {
  const categoryToId = new Map<NodeCategory, string>();

  const project = await prisma.project.create({
    data: {
      userId: userId ?? null,
      name: roadmap.name,
      prompt,
      description: roadmap.description,
      budget: budget ?? null,
      budgetNotes: roadmap.budgetNotes,
      nodes: {
        create: roadmap.nodes.map((node) => ({
          category: node.category,
          title: node.title,
          description: node.description,
          tools: JSON.stringify(node.tools),
          tasks: JSON.stringify(node.tasks),
          estimatedCost: node.estimatedCost ?? null,
          posX: node.posX,
          posY: node.posY,
        })),
      },
      reminders: {
        create: roadmap.dailyReminders.map((reminder) => ({
          title: reminder.title,
          message: reminder.message,
          time: reminder.time,
          days: JSON.stringify(reminder.days),
        })),
      },
    },
    include: {
      nodes: true,
      edges: true,
      reminders: true,
      progressLogs: true,
    },
  });

  for (const node of project.nodes) {
    categoryToId.set(node.category as NodeCategory, node.id);
  }

  const edgeData = roadmap.edges
    .map((edge) => {
      const sourceId = categoryToId.get(edge.sourceCategory);
      const targetId = categoryToId.get(edge.targetCategory);
      if (!sourceId || !targetId) return null;
      return {
        projectId: project.id,
        sourceId,
        targetId,
      };
    })
    .filter(Boolean) as { projectId: string; sourceId: string; targetId: string }[];

  if (edgeData.length > 0) {
    await prisma.workflowEdge.createMany({ data: edgeData });
  }

  return prisma.project.findUniqueOrThrow({
    where: { id: project.id },
    include: {
      nodes: true,
      edges: true,
      reminders: true,
      progressLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function updateNodeProgress(
  nodeId: string,
  data: {
    status?: string;
    progress?: number;
    title?: string;
    description?: string;
    note?: string;
    category?: string;
    assigneeUserId?: string | null;
    assigneeName?: string;
    assigneeEmail?: string;
  }
) {
  const existing = await prisma.workflowNode.findUnique({ where: { id: nodeId } });

  const node = await prisma.workflowNode.update({
    where: { id: nodeId },
    data: {
      status: data.status,
      progress: data.progress,
      title: data.title,
      description: data.description,
      category: data.category,
      ...(data.note !== undefined ? { note: data.note } : {}),
      ...(data.assigneeUserId !== undefined ? { assigneeUserId: data.assigneeUserId } : {}),
      ...(data.assigneeName !== undefined ? { assigneeName: data.assigneeName } : {}),
      ...(data.assigneeEmail !== undefined ? { assigneeEmail: data.assigneeEmail } : {}),
    },
  });

  if (
    data.progress !== undefined &&
    existing &&
    data.progress !== existing.progress
  ) {
    await prisma.progressLog.create({
      data: {
        projectId: node.projectId,
        nodeId: node.id,
        note: `${node.title}: ${existing.progress}% → ${data.progress}%`,
      },
    });
  } else if (data.note && (data.progress !== undefined || data.status !== undefined)) {
    await prisma.progressLog.create({
      data: {
        projectId: node.projectId,
        nodeId: node.id,
        note: data.note,
      },
    });
  }

  const nodes = await prisma.workflowNode.findMany({
    where: { projectId: node.projectId },
  });

  const overallProgress = calculateProjectProgress(nodes);

  await prisma.project.update({
    where: { id: node.projectId },
    data: { progress: overallProgress },
  });

  return node;
}

export async function updateNodePosition(
  nodeId: string,
  posX: number,
  posY: number
) {
  return prisma.workflowNode.update({
    where: { id: nodeId },
    data: { posX, posY },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      nodes: true,
      edges: true,
      reminders: true,
      members: {
        select: {
          id: true,
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      progressLogs: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
}

export async function listProjects(userId?: string | null) {
  if (!userId) {
    return prisma.project.findMany({
      where: { userId: null },
      orderBy: { updatedAt: "desc" },
      include: {
        nodes: true,
        _count: { select: { reminders: true } },
      },
    });
  }

  return prisma.project.findMany({
    where: {
      OR: [{ userId }, { members: { some: { userId } } }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      nodes: true,
      _count: { select: { reminders: true } },
    },
  });
}

export async function createNodeForProject(
  projectId: string,
  options?: {
    category?: NodeCategory;
    title?: string;
    description?: string;
    estimatedCost?: number | null;
    tasks?: { title: string; detail?: string }[];
  }
) {
  const count = await prisma.workflowNode.count({ where: { projectId } });
  const category = options?.category ?? "operations";
  const defaultTasks = options?.tasks?.length
    ? options.tasks.map((t) => ({
        title: t.title,
        detail: t.detail ?? "",
        tools: [] as string[],
        estimatedTime: "",
      }))
    : [];
  const node = await prisma.workflowNode.create({
    data: {
      projectId,
      category,
      title: options?.title ?? "New block",
      description:
        options?.description ??
        "Describe what this step of your roadmap involves.",
      tools: JSON.stringify([]),
      tasks: JSON.stringify(defaultTasks),
      status: "pending",
      progress: 0,
      posX: 120 + (count % 4) * 340,
      posY: 120 + Math.floor(count / 4) * 300,
      estimatedCost: options?.estimatedCost ?? null,
    },
  });
  return node;
}

/** @deprecated Use createNodeForProject */
export async function createBlankNode(projectId: string) {
  return createNodeForProject(projectId);
}

export async function deleteNode(nodeId: string) {
  const node = await prisma.workflowNode.findUnique({ where: { id: nodeId } });
  if (!node) return null;
  await prisma.workflowEdge.deleteMany({
    where: {
      projectId: node.projectId,
      OR: [{ sourceId: nodeId }, { targetId: nodeId }],
    },
  });
  await prisma.workflowNode.delete({ where: { id: nodeId } });

  const nodes = await prisma.workflowNode.findMany({
    where: { projectId: node.projectId },
  });
  await prisma.project.update({
    where: { id: node.projectId },
    data: { progress: calculateProjectProgress(nodes) },
  });
  return node;
}

export async function createEdge(
  projectId: string,
  sourceId: string,
  targetId: string
) {
  const existing = await prisma.workflowEdge.findFirst({
    where: { projectId, sourceId, targetId },
  });
  if (existing) return existing;
  return prisma.workflowEdge.create({
    data: { projectId, sourceId, targetId },
  });
}

export async function deleteEdge(edgeId: string) {
  return prisma.workflowEdge.delete({ where: { id: edgeId } });
}

export async function deleteProject(projectId: string) {
  return prisma.project.delete({ where: { id: projectId } });
}
