import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import {
  formatProjectContextForPrompt,
  loadProjectAiContext,
} from "@/lib/project-ai-context";

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
  source?: "ai" | "fallback";
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
  source?: "ai" | "fallback";
}

async function loadProjectContext(projectId: string) {
  const ctx = await loadProjectAiContext(projectId);
  if (!ctx) throw new Error("Project not found");
  return ctx;
}

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function generateValidatorReport(
  projectId: string
): Promise<ValidatorReport> {
  const ctx = await loadProjectContext(projectId);
  const client = getOpenAIClient();
  const contextText = formatProjectContextForPrompt(ctx);

  if (client) {
    try {
      const res = await client.chat.completions.create({
        model: OPENAI_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `You are a rigorous startup validator doing real market research for the specific startup described. Return JSON only with keys: overallScore (0-100), verdict, summary (3-4 sentences), dimensions (array of 8 items: {label, score, confidence, analysis} covering Demand, Competition, Moat, Scalability, Execution, Capital, Founder Fit, Timing), pros (5 strings), cons (5 strings), improvements (array of 5 {priority: High|Medium, action, impact}), tamSamSom ({tam, sam, som, notes}), risks (5 strings). Reference the actual product idea, target users, and market. No generic advice.`,
          },
          {
            role: "user",
            content: contextText,
          },
        ],
      });
      const raw = res.choices[0]?.message?.content;
      if (raw) {
        const parsed = parseJson<ValidatorReport>(raw);
        if (parsed?.overallScore != null && parsed.dimensions?.length) {
          return { ...parsed, source: "ai" };
        }
      }
    } catch (error) {
      console.error("OpenAI validator error:", error);
    }
  }

  return { ...fallbackValidator(ctx), source: "fallback" };
}

export async function generateCompetitorsReport(
  projectId: string
): Promise<CompetitorsReport> {
  const ctx = await loadProjectContext(projectId);
  const client = getOpenAIClient();
  const contextText = formatProjectContextForPrompt(ctx);

  if (client) {
    try {
      const res = await client.chat.completions.create({
        model: OPENAI_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `You are a competitive intelligence analyst. Research REAL competitor products/apps that compete with this specific startup idea. Return JSON only with keys: summary (2-3 sentences), competitors (array of 3-4 real or realistic named products with {name, funding, employees, pricing, traffic, strengths[], weaknesses[], moat}), beatStrategy (array of 3 {title, steps[3-5], timeline}), positioning, differentiation (5 strings), opportunities (4 strings), threats (4 strings). Name actual apps where possible (e.g. MyFitnessPal for calorie apps). Explain exactly where they fail and how to beat them.`,
          },
          {
            role: "user",
            content: contextText,
          },
        ],
      });
      const raw = res.choices[0]?.message?.content;
      if (raw) {
        const parsed = parseJson<CompetitorsReport>(raw);
        if (parsed?.competitors?.length) {
          return { ...parsed, source: "ai" };
        }
      }
    } catch (error) {
      console.error("OpenAI competitors error:", error);
    }
  }

  return { ...fallbackCompetitors(ctx), source: "fallback" };
}

function fallbackValidator(ctx: Awaited<ReturnType<typeof loadProjectContext>>): ValidatorReport {
  const idea = ctx.description ?? ctx.prompt;
  const score = Math.min(88, 52 + ctx.blocks.length * 3 + Math.floor(ctx.progress / 6));
  return {
    overallScore: score,
    verdict: score >= 72 ? "Promising — validate with real users" : "Early — prove demand first",
    summary: `${ctx.name} targets: ${idea.slice(0, 200)}. The wellness/tracking market is large but crowded. Your edge depends on a simpler daily workflow and AI-guided execution vs. generic trackers. Run 15 customer interviews before heavy build.`,
    dimensions: [
      { label: "Demand", score: 74, confidence: 70, analysis: `Users searching for "${ctx.name.toLowerCase()}" solutions exist; retention depends on habit loops and low friction logging.` },
      { label: "Competition", score: 58, confidence: 75, analysis: "MyFitnessPal, Lose It!, and Cronometer dominate. Differentiate on AI meal planning or founder-specific UX." },
      { label: "Moat", score: 48, confidence: 65, analysis: "Without proprietary data or community, moat is weak until you own a niche wedge." },
      { label: "Scalability", score: 76, confidence: 80, analysis: "Mobile-first SaaS scales globally once core logging loop is sticky." },
      { label: "Execution", score: Math.max(35, ctx.progress), confidence: 85, analysis: `Roadmap at ${ctx.progress}%. Ship MVP validation before marketing spend.` },
      { label: "Capital", score: ctx.budget && ctx.budget > 5000 ? 68 : 55, confidence: 72, analysis: ctx.budgetNotes ?? "Can bootstrap MVP with no-code + free tiers; paid ads later." },
      { label: "Founder Fit", score: 70, confidence: 60, analysis: "Success requires daily habits module usage — practice what you sell." },
      { label: "Timing", score: 77, confidence: 74, analysis: "Health apps post-COVID remain strong; AI-native entrants still have a window." },
    ],
    pros: [
      "Large addressable market for nutrition and fitness tracking",
      "Clear daily use case with measurable outcomes",
      "Can start with a focused MVP (logging + goals)",
      "Strong upsell path to coaching and meal plans",
      "Integrates naturally with your Founder OS workflow",
    ],
    cons: [
      "Incumbents have massive brand and database advantages",
      "User churn is high without habit formation",
      "App store discovery is expensive",
      "Privacy concerns around health data",
      "Feature parity expectations are high",
    ],
    improvements: [
      { priority: "High", action: "Interview 15 target users about current tracker pain points", impact: "Validates wedge before build" },
      { priority: "High", action: "Define one killer feature incumbents lack (e.g. AI photo meals)", impact: "Sharper positioning" },
      { priority: "High", action: "Complete MVP block on roadmap", impact: "Testable product in 4 weeks" },
      { priority: "Medium", action: "Run 2-week TikTok/Reddit organic test", impact: "Cheap demand signal" },
      { priority: "Medium", action: "Model unit economics at 1000 users", impact: "Avoid unprofitable growth" },
    ],
    tamSamSom: {
      tam: "$4.2B global diet & nutrition apps",
      sam: "$680M English-speaking mobile trackers",
      som: "$4–12M achievable in 24 months with niche focus",
      notes: `Estimates tailored to ${ctx.name}; refine with your target geography.`,
    },
    risks: [
      "Users abandon after 2 weeks without habit design",
      "Apple/Google health policy changes",
      "Incumbent copies AI features quickly",
      "Underestimating food database costs",
      "Building too many features before validation",
    ],
  };
}

function fallbackCompetitors(ctx: Awaited<ReturnType<typeof loadProjectContext>>): CompetitorsReport {
  const isCalorie =
    /calorie|nutrition|diet|food|fitness|health/i.test(ctx.prompt + ctx.name);

  if (isCalorie) {
    return {
      summary: `${ctx.name} enters the calorie/nutrition tracking space dominated by established apps with huge food databases. Win by narrowing to a underserved segment and delivering faster logging + AI coaching.`,
      competitors: [
        {
          name: "MyFitnessPal",
          funding: "Acquired (Under Armour → Francisco Partners)",
          employees: "200+",
          pricing: "$19.99/mo Premium",
          traffic: "~15M MAU",
          strengths: ["Largest food database", "Brand trust", "Barcode scan"],
          weaknesses: ["Cluttered UX", "Aggressive paywalls", "Slow innovation"],
          moat: "High (data network effects)",
        },
        {
          name: "Lose It!",
          funding: "$25M+ raised",
          employees: "50",
          pricing: "$39.99/yr Premium",
          traffic: "~3M MAU",
          strengths: ["Simple calorie budget", "Community challenges"],
          weaknesses: ["Weak AI features", "Dated design", "Limited meal planning"],
          moat: "Medium",
        },
        {
          name: "Cronometer",
          funding: "Bootstrapped",
          employees: "30",
          pricing: "$9.99/mo Gold",
          traffic: "~1M MAU",
          strengths: ["Micronutrient depth", "Accuracy-focused users"],
          weaknesses: ["Steep learning curve", "Not mass-market friendly"],
          moat: "Medium (niche accuracy)",
        },
      ],
      beatStrategy: [
        {
          title: "Win on AI-native logging",
          steps: [
            "Photo-based meal recognition with one-tap confirm",
            "Daily AI coach that adjusts targets from behavior",
            "Integrate with your Founder OS habits for consistency",
          ],
          timeline: "0–60 days",
        },
        {
          title: "Own a wedge segment",
          steps: [
            "Target busy founders who quit MFP due to complexity",
            "Marketing: 'Calorie tracking that takes 30 seconds'",
            "Partner with fitness micro-influencers",
          ],
          timeline: "30–90 days",
        },
        {
          title: "Undercut on price with more value",
          steps: [
            "Free tier: logging + 7-day insights",
            "Pro $9.99 with AI meal suggestions",
            "Annual plan with habit analytics bundle",
          ],
          timeline: "60–120 days",
        },
      ],
      positioning: `${ctx.name} — the calorie tracker built for founders who need speed, AI, and accountability — not another bloated fitness app.`,
      differentiation: [
        "30-second logging loop vs. 5-minute MFP flows",
        "Built-in founder habit tracker",
        "AI adjusts plan weekly from real behavior",
        "Clean, modern UI without ad clutter",
        "Roadmap tied to business milestones",
      ],
      opportunities: ["Corporate wellness pilots", "Creator-led diet programs", "GLP-1 companion tracking"],
      threats: ["MFP adds generative AI", "Apple Health improvements", "Free ChatGPT meal advice"],
    };
  }

  return {
    summary: `Competitive landscape for ${ctx.name}: identify 2–3 direct alternatives and win on speed, AI execution, and niche focus.`,
    competitors: [
      {
        name: "Incumbent A",
        funding: "Series A",
        employees: "40",
        pricing: "$29/mo",
        traffic: "100K/mo",
        strengths: ["Brand", "Integrations"],
        weaknesses: ["Generic UX", "No AI coach"],
        moat: "Medium",
      },
      {
        name: "Startup B",
        funding: "Seed",
        employees: "12",
        pricing: "Freemium",
        traffic: "30K/mo",
        strengths: ["Modern UI", "Low price"],
        weaknesses: ["Limited features", "Small team"],
        moat: "Low",
      },
      {
        name: "Spreadsheet + Notion",
        funding: "N/A",
        employees: "N/A",
        pricing: "Free",
        traffic: "N/A",
        strengths: ["Flexible", "Free"],
        weaknesses: ["No automation", "No validation"],
        moat: "None",
      },
    ],
    beatStrategy: [
      {
        title: "Ship faster with AI roadmap",
        steps: ["Launch MVP in 30 days", "Publish build-in-public", "Collect testimonials"],
        timeline: "0–90 days",
      },
    ],
    positioning: `${ctx.name} — AI-native Founder OS, not a static template.`,
    differentiation: ["Live canvas", "Validator + competitors built-in", "Budget-aware stack"],
    opportunities: ["Accelerator partnerships", "Vertical templates"],
    threats: ["Generic AI agents", "Free Notion templates"],
  };
}
