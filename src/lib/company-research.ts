import OpenAI from "openai";
import { getProject } from "@/lib/projects";
import { parseNodeTasks } from "@/lib/project-utils";

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export interface ValidatorReport {
  overallScore: number;
  verdict: string;
  summary: string;
  dimensions: {
    label: string;
    score: number;
    confidence: number;
    analysis: string;
  }[];
  pros: string[];
  cons: string[];
  improvements: { priority: string; action: string; impact: string }[];
  tamSamSom: { tam: string; sam: string; som: string; notes: string };
  risks: string[];
}

export interface CompetitorsReport {
  summary: string;
  competitors: {
    name: string;
    funding: string;
    employees: string;
    pricing: string;
    traffic: string;
    strengths: string[];
    weaknesses: string[];
    moat: string;
  }[];
  beatStrategy: { title: string; steps: string[]; timeline: string }[];
  positioning: string;
  differentiation: string[];
  opportunities: string[];
  threats: string[];
}

async function loadProjectContext(projectId: string) {
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");

  const blocks = project.nodes.map((n) => ({
    category: n.category,
    title: n.title,
    description: n.description,
    progress: n.progress,
    tasks: parseNodeTasks(n.tasks).map((t) => t.title),
  }));

  return {
    name: project.name,
    prompt: project.prompt,
    description: project.description,
    budget: project.budget,
    budgetNotes: project.budgetNotes,
    progress: project.progress,
    blocks,
  };
}

export async function generateValidatorReport(
  projectId: string
): Promise<ValidatorReport> {
  const ctx = await loadProjectContext(projectId);
  const client = getClient();

  if (client) {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a rigorous startup validator. Return JSON only with keys: overallScore (0-100), verdict, summary, dimensions (array of {label, score, confidence, analysis}), pros (string[]), cons (string[]), improvements (array of {priority, action, impact}), tamSamSom ({tam, sam, som, notes}), risks (string[]). Be specific to the startup. No generic fluff.`,
        },
        {
          role: "user",
          content: JSON.stringify(ctx, null, 2),
        },
      ],
    });
    const raw = res.choices[0]?.message?.content;
    if (raw) return JSON.parse(raw) as ValidatorReport;
  }

  return fallbackValidator(ctx);
}

export async function generateCompetitorsReport(
  projectId: string
): Promise<CompetitorsReport> {
  const ctx = await loadProjectContext(projectId);
  const client = getClient();

  if (client) {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a competitive intelligence analyst. Return JSON only with keys: summary, competitors (array of {name, funding, employees, pricing, traffic, strengths[], weaknesses[], moat}), beatStrategy (array of {title, steps[], timeline}), positioning, differentiation (string[]), opportunities (string[]), threats (string[]). Research realistic competitors for this specific startup idea.`,
        },
        {
          role: "user",
          content: JSON.stringify(ctx, null, 2),
        },
      ],
    });
    const raw = res.choices[0]?.message?.content;
    if (raw) return JSON.parse(raw) as CompetitorsReport;
  }

  return fallbackCompetitors(ctx);
}

function fallbackValidator(ctx: Awaited<ReturnType<typeof loadProjectContext>>): ValidatorReport {
  const score = Math.min(92, 55 + ctx.blocks.length * 4 + Math.floor(ctx.progress / 5));
  return {
    overallScore: score,
    verdict: score >= 75 ? "Promising — refine execution" : "Early stage — validate further",
    summary: `${ctx.name} shows ${score >= 75 ? "strong" : "moderate"} potential in ${ctx.description ?? ctx.prompt.slice(0, 120)}. Focus on customer validation before scaling spend.`,
    dimensions: [
      { label: "Demand", score: score + 2, confidence: 78, analysis: "Problem-solution fit appears real for target users seeking a structured path." },
      { label: "Competition", score: score - 8, confidence: 72, analysis: "Crowded space — differentiation via AI-native workflow and budget-aware tooling is key." },
      { label: "Moat", score: score - 12, confidence: 65, analysis: "Moat builds through data, workflow lock-in, and founder execution speed." },
      { label: "Scalability", score: score - 3, confidence: 80, analysis: "Software-led model scales well once core workflow is proven." },
      { label: "Execution", score: ctx.progress, confidence: 85, analysis: `Current roadmap progress at ${ctx.progress}%. Ship MVP tasks in order.` },
      { label: "Capital", score: ctx.budget && ctx.budget > 10000 ? 75 : 58, confidence: 70, analysis: ctx.budgetNotes ?? "Bootstrap-friendly if you prioritize free tools first." },
      { label: "Founder Fit", score: 72, confidence: 68, analysis: "Success depends on consistent daily execution and customer interviews." },
      { label: "Timing", score: 80, confidence: 74, analysis: "AI-assisted planning tools are in high demand — window is open." },
    ],
    pros: [
      "Clear problem with structured roadmap reduces founder paralysis",
      "Budget-aware recommendations lower barrier to entry",
      "Modular blocks map to real startup phases",
    ],
    cons: [
      "Competitive landscape includes established planning tools",
      "Requires habit formation for daily progress",
      "Moat is weak until you have user data and integrations",
    ],
    improvements: [
      { priority: "High", action: "Interview 10 target customers this week", impact: "Validate demand before building features" },
      { priority: "High", action: "Complete MVP block tasks in order", impact: "Ship something testable in 2–4 weeks" },
      { priority: "Medium", action: "Define one wedge vs. incumbents", impact: "Sharper positioning in marketing" },
      { priority: "Medium", action: "Track unit economics early", impact: "Avoid scaling unprofitable motion" },
    ],
    tamSamSom: {
      tam: "$2.4B",
      sam: "$420M",
      som: "$28M",
      notes: "Estimates for AI-assisted SMB planning tools in English-speaking markets.",
    },
    risks: ["Competitor copycats", "Founder burnout without habits", "Budget overrun on tools"],
  };
}

function fallbackCompetitors(ctx: Awaited<ReturnType<typeof loadProjectContext>>): CompetitorsReport {
  return {
    summary: `Competitive landscape for ${ctx.name}: incumbents offer generic templates; your edge is AI execution, budget fit, and integrated founder OS.`,
    competitors: [
      {
        name: "Legacy Planner Co",
        funding: "$8M Seed",
        employees: "25",
        pricing: "$39/mo",
        traffic: "90K/mo",
        strengths: ["Brand recognition", "Template library"],
        weaknesses: ["No AI execution", "Static documents"],
        moat: "Low",
      },
      {
        name: "StartupDocs",
        funding: "Bootstrapped",
        employees: "6",
        pricing: "Freemium",
        traffic: "40K/mo",
        strengths: ["Free tier", "Simple UX"],
        weaknesses: ["No validation scores", "No finance integration"],
        moat: "Low",
      },
      {
        name: "VentureKit",
        funding: "$15M Series A",
        employees: "55",
        pricing: "$79/mo",
        traffic: "200K/mo",
        strengths: ["Enterprise sales", "Pitch deck focus"],
        weaknesses: ["Expensive", "Overkill for solo founders"],
        moat: "Medium",
      },
    ],
    beatStrategy: [
      {
        title: "Win on speed + AI execution",
        steps: [
          "Ship MVP in 30 days using your own roadmap",
          "Publish case studies of founders who launched faster",
          "Offer AI coach that changes the plan — not just chat",
        ],
        timeline: "0–90 days",
      },
      {
        title: "Undercut on price with more value",
        steps: [
          "Free tier with 1 company digital twin",
          "Pro at $19.99 with finance + validator included",
          "Content SEO targeting 'startup operating system'",
        ],
        timeline: "30–180 days",
      },
      {
        title: "Own a niche wedge",
        steps: [
          "Pick one vertical (e.g. health apps, SaaS)",
          "Pre-built blocks and competitor intel for that niche",
          "Partner with accelerators in that space",
        ],
        timeline: "60–120 days",
      },
    ],
    positioning: `${ctx.name} is the Founder OS — not a doc generator. Live model, finances, habits, and AI that executes.`,
    differentiation: [
      "Company Digital Twin updates when you change strategy",
      "Budget-matched tool stack per block",
      "Integrated validator + competitor intel",
    ],
    opportunities: ["Accelerator partnerships", "B2B wellness/employer channels", "API for coaches"],
    threats: ["Notion/Linear adding AI planners", "OpenAI generic agents", "Price pressure from free tools"],
  };
}
