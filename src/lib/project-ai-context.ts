import { getProject } from "@/lib/projects";
import { parseNodeTasks } from "@/lib/project-utils";

export interface ProjectAiContext {
  name: string;
  prompt: string;
  description: string | null;
  budget: number | null;
  budgetNotes: string | null;
  progress: number;
  logoUrl: string | null;
  teamSize: number;
  blocks: {
    id: string;
    category: string;
    title: string;
    description: string | null;
    progress: number;
    status: string;
    tasks: string[];
    pendingTasks: string[];
  }[];
  recentProgress: { note: string; blockTitle?: string; createdAt: string }[];
  reminders: { title: string; message: string; time: string }[];
  pendingTasks: { block: string; title: string }[];
}

export async function loadProjectAiContext(
  projectId: string
): Promise<ProjectAiContext | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const nodeById = new Map(project.nodes.map((n) => [n.id, n.title]));

  const blocks = project.nodes.map((n) => {
    const tasks = parseNodeTasks(n.tasks);
    return {
      id: n.id,
      category: n.category,
      title: n.title,
      description: n.description,
      progress: n.progress,
      status: n.status,
      tasks: tasks.map((t) => t.title),
      pendingTasks: tasks
        .filter((t) => n.progress < 100)
        .slice(0, 5)
        .map((t) => t.title),
    };
  });

  const pendingTasks = blocks.flatMap((b) =>
    b.pendingTasks.map((title) => ({ block: b.title, title }))
  );

  return {
    name: project.name,
    prompt: project.prompt,
    description: project.description,
    budget: project.budget,
    budgetNotes: project.budgetNotes,
    progress: project.progress,
    logoUrl: project.logoUrl,
    teamSize: 1 + project.members.length,
    blocks,
    pendingTasks,
    recentProgress: project.progressLogs.slice(0, 8).map((log) => ({
      note: log.note,
      blockTitle: log.nodeId ? nodeById.get(log.nodeId) : undefined,
      createdAt:
        log.createdAt instanceof Date
          ? log.createdAt.toISOString()
          : String(log.createdAt),
    })),
    reminders: project.reminders.slice(0, 6).map((r) => ({
      title: r.title,
      message: r.message,
      time: r.time,
    })),
  };
}

export function formatProjectContextForPrompt(ctx: ProjectAiContext): string {
  const lines = [
    `Company: ${ctx.name}`,
    `Idea: ${ctx.description ?? ctx.prompt}`,
    `Original prompt: ${ctx.prompt}`,
    `Budget: ${ctx.budget != null ? `$${ctx.budget.toLocaleString()}` : "not set"}`,
    `Budget notes: ${ctx.budgetNotes ?? "none"}`,
    `Overall progress: ${ctx.progress}%`,
    `Team size: ${ctx.teamSize}`,
  ];

  if (ctx.blocks.length) {
    lines.push(
      "",
      "Roadmap blocks:",
      ...ctx.blocks.map(
        (b) =>
          `- ${b.category}: "${b.title}" (${b.status}, ${b.progress}%)` +
          (b.description ? ` — ${b.description.slice(0, 120)}` : "") +
          (b.tasks.length ? ` · tasks: ${b.tasks.slice(0, 4).join(", ")}` : "")
      )
    );
  }

  if (ctx.pendingTasks.length) {
    lines.push(
      "",
      "Open tasks:",
      ...ctx.pendingTasks.map((t) => `- [${t.block}] ${t.title}`)
    );
  }

  if (ctx.recentProgress.length) {
    lines.push(
      "",
      "Recent progress:",
      ...ctx.recentProgress.map(
        (p) =>
          `- ${p.note.slice(0, 100)}${p.blockTitle ? ` (${p.blockTitle})` : ""}`
      )
    );
  }

  if (ctx.reminders.length) {
    lines.push(
      "",
      "Active reminders:",
      ...ctx.reminders.map((r) => `- ${r.title} @ ${r.time}: ${r.message.slice(0, 80)}`)
    );
  }

  return lines.join("\n");
}
