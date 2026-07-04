import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import { DEFAULT_NODE_LAYOUT } from "./constants";
import { COMPANY_NAME, PRODUCT_NAME } from "./brand";
import type {
  GeneratedNode,
  GeneratedRoadmap,
  NodeCategory,
  TaskResource,
  TaskStep,
  ToolRecommendation,
} from "./types";

type Tier = "bootstrap" | "moderate" | "funded";

const SYSTEM_PROMPT = `You are ${PRODUCT_NAME}, an expert startup advisor by ${COMPANY_NAME}. Given a startup idea and a budget, produce a complete, budget-aware business roadmap as JSON.

Return ONLY valid JSON matching this schema:
{
  "name": "short startup name",
  "description": "1-2 sentence summary",
  "budgetNotes": "budget-specific advice",
  "nodes": [{
    "category": "idea|product|marketing|finance|legal|operations|team|launch",
    "title": "string",
    "description": "actionable paragraph",
    "tools": [{ "name": "string", "purpose": "string", "pricing": "string", "url": "https://..." }],
    "tasks": [{
      "title": "short imperative step name",
      "detail": "exact, concrete instructions on how to do this step",
      "tools": ["specific tool/software/website names to use for this step"],
      "resources": [{ "label": "website or software name", "url": "https://..." }],
      "estimatedTime": "e.g. 2-3 days"
    }],
    "estimatedCost": number,
    "posX": number,
    "posY": number
  }],
  "edges": [{ "sourceCategory": "category", "targetCategory": "category" }],
  "dailyReminders": [{ "title": "string", "message": "string", "time": "HH:mm", "days": [1,2,3,4,5] }]
}

CRITICAL RULES:
- Include ALL 8 categories.
- Each node MUST have 3-5 ordered tasks. Tasks must be in the exact order the founder should execute them.
- Every task must reference concrete tools, software, and websites (with real URLs) the founder should use.
- STRICT BUDGET ADHERENCE: only recommend tools whose realistic cost fits the TOTAL budget. For a bootstrap budget (<$5k) recommend ONLY free or freemium tools. For moderate ($5k-$25k) you may include affordable paid tools. For funded (>$25k) you may include premium/paid tools. Never recommend a tool the founder cannot afford.
- Keep estimatedCost per node within a sensible fraction of the total budget so the sum does not exceed it.`;

function budgetTier(budget?: number): Tier {
  if (!budget || budget < 5000) return "bootstrap";
  if (budget < 25000) return "moderate";
  return "funded";
}

function tool(
  name: string,
  purpose: string,
  pricing: string,
  url?: string
): ToolRecommendation {
  return { name, purpose, pricing, url };
}

function res(label: string, url: string): TaskResource {
  return { label, url };
}

function step(
  title: string,
  detail: string,
  tools: string[],
  resources: TaskResource[],
  estimatedTime: string
): TaskStep {
  return { title, detail, tools, resources, estimatedTime };
}

// Scales node cost estimates so the total stays roughly within budget.
function scaledCost(base: Record<Tier, number>, tier: Tier): number {
  return Math.round(base[tier]);
}

function buildNodes(prompt: string, tier: Tier, budgetLabel: string): GeneratedNode[] {
  const paid = tier !== "bootstrap";
  const funded = tier === "funded";

  return [
    {
      category: "idea",
      title: "Validate the Problem",
      description: `Confirm that people actually want "${prompt}". Talk to real potential customers before building anything.`,
      tools: [
        tool("Google Forms", "Free discovery surveys", "Free", "https://forms.google.com"),
        tool("Cal.com", "Schedule user interviews", "Free", "https://cal.com"),
        tool("Notion", "Organize research notes", "Free", "https://notion.so"),
        ...(paid
          ? [tool("Typeform", "Polished surveys", "$25/mo", "https://typeform.com")]
          : []),
      ],
      tasks: [
        step(
          "Write a one-page problem statement",
          "Clearly describe the problem, who has it, and how they solve it today. Keep it to a single page you can share.",
          ["Notion", "Google Docs"],
          [res("Notion", "https://notion.so"), res("Google Docs", "https://docs.google.com")],
          "1 day"
        ),
        step(
          "Recruit 10-15 interview candidates",
          "Find people in your target market. Post in relevant subreddits, Slack/Discord communities, and LinkedIn. Book 20-minute calls.",
          ["Reddit", "LinkedIn", "Cal.com"],
          [res("Reddit", "https://reddit.com"), res("Cal.com", "https://cal.com")],
          "3-5 days"
        ),
        step(
          "Run customer interviews",
          "Ask about their current pain, what they've tried, and what they'd pay. Do NOT pitch your idea — listen. Record and take notes.",
          ["Google Meet", "Notion"],
          [res("Google Meet", "https://meet.google.com")],
          "1 week"
        ),
        step(
          "Summarize top 3 validated insights",
          "Group your notes into themes. Decide: is this problem real, urgent, and worth paying to solve? Go / no-go.",
          ["Notion"],
          [res("Notion", "https://notion.so")],
          "1 day"
        ),
      ],
      estimatedCost: scaledCost({ bootstrap: 0, moderate: 50, funded: 300 }, tier),
      posX: DEFAULT_NODE_LAYOUT.idea.x,
      posY: DEFAULT_NODE_LAYOUT.idea.y,
    },
    {
      category: "product",
      title: "Build Your MVP",
      description: `Ship the smallest version of "${prompt}" that solves the core problem. One killer feature, nothing more.`,
      tools: [
        tool("Figma", "UI/UX design", "Free tier", "https://figma.com"),
        tool("Vercel", "Deploy web app", "Free hobby tier", "https://vercel.com"),
        tool("Supabase", "Database & auth", "Free tier", "https://supabase.com"),
        ...(paid
          ? [tool("Cursor", "AI-assisted coding", "$20/mo", "https://cursor.com")]
          : []),
        ...(funded
          ? [tool("Retool", "Internal tooling", "$50/user/mo", "https://retool.com")]
          : []),
      ],
      tasks: [
        step(
          "Define MVP scope (max 3 features)",
          "List every feature you imagine, then cut ruthlessly to the 1-3 that deliver the core value. Write user stories for each.",
          ["Notion", "Linear"],
          [res("Linear", "https://linear.app")],
          "2 days"
        ),
        step(
          "Design wireframes & user flow",
          "Sketch the key screens and how users move between them. Low-fidelity first, then a clickable prototype.",
          ["Figma"],
          [res("Figma", "https://figma.com")],
          "3-5 days"
        ),
        step(
          paid ? "Build the MVP" : "Build the MVP (no/low-code if needed)",
          paid
            ? "Develop the core feature. Use a modern stack and AI coding tools to move fast. Keep infrastructure minimal."
            : "If you can't code, use no-code builders to launch fast and cheap. Focus on function over polish.",
          paid ? ["Cursor", "Next.js", "Supabase"] : ["Bubble", "Softr", "Supabase"],
          paid
            ? [res("Next.js", "https://nextjs.org"), res("Supabase", "https://supabase.com")]
            : [res("Bubble", "https://bubble.io"), res("Softr", "https://softr.io")],
          "3-6 weeks"
        ),
        step(
          "Deploy v0.1 and test with 5 users",
          "Ship it publicly, even if rough. Watch 5 target users try it and note every point of confusion.",
          ["Vercel"],
          [res("Vercel", "https://vercel.com")],
          "3 days"
        ),
      ],
      estimatedCost: scaledCost({ bootstrap: 0, moderate: 2000, funded: 12000 }, tier),
      posX: DEFAULT_NODE_LAYOUT.product.x,
      posY: DEFAULT_NODE_LAYOUT.product.y,
    },
    {
      category: "marketing",
      title: "Go-to-Market Strategy",
      description: "Get your first 100 users. Pick 1-2 channels where your audience already hangs out and go deep.",
      tools: [
        tool("Buffer", "Social scheduling", "Free tier", "https://buffer.com"),
        tool("Mailchimp", "Email (free to 500)", "Free tier", "https://mailchimp.com"),
        tool("Google Analytics", "Traffic tracking", "Free", "https://analytics.google.com"),
        ...(paid
          ? [tool("Canva Pro", "Marketing creatives", "$13/mo", "https://canva.com")]
          : [tool("Canva", "Free creatives", "Free", "https://canva.com")]),
        ...(funded
          ? [tool("HubSpot", "CRM & automation", "From $20/mo", "https://hubspot.com")]
          : []),
      ],
      tasks: [
        step(
          "Define your ideal customer profile (ICP)",
          "Write exactly who your first customer is: role, where they hang out online, what triggers them to look for a solution.",
          ["Notion"],
          [res("Notion", "https://notion.so")],
          "1 day"
        ),
        step(
          "Build a landing page with a waitlist",
          "One clear headline, the problem, your solution, and an email capture. Launch it before the product is done.",
          paid ? ["Framer", "Mailchimp"] : ["Carrd", "Mailchimp"],
          paid
            ? [res("Framer", "https://framer.com"), res("Mailchimp", "https://mailchimp.com")]
            : [res("Carrd", "https://carrd.co"), res("Mailchimp", "https://mailchimp.com")],
          "2-3 days"
        ),
        step(
          "Launch in 3 relevant communities",
          "Share your story where your ICP already is — Reddit, Indie Hackers, niche Slack/Discord, LinkedIn. Give value, don't spam.",
          ["Reddit", "Indie Hackers", "LinkedIn"],
          [res("Indie Hackers", "https://indiehackers.com"), res("Reddit", "https://reddit.com")],
          "1 week"
        ),
        step(
          "Set up analytics & track signups",
          "Install analytics so you know which channel drives signups. Double down on what works.",
          ["Google Analytics"],
          [res("Google Analytics", "https://analytics.google.com")],
          "1 day"
        ),
      ],
      estimatedCost: scaledCost({ bootstrap: 0, moderate: 1500, funded: 6000 }, tier),
      posX: DEFAULT_NODE_LAYOUT.marketing.x,
      posY: DEFAULT_NODE_LAYOUT.marketing.y,
    },
    {
      category: "finance",
      title: "Financial Planning",
      description: `Set up money tracking for your ${budgetLabel} budget. Know your runway and unit economics from day one.`,
      tools: [
        tool("Wave", "Free accounting", "Free", "https://waveapps.com"),
        tool("Google Sheets", "Budget & runway model", "Free", "https://sheets.google.com"),
        tool("Stripe", "Accept payments", "2.9% + 30¢", "https://stripe.com"),
        ...(paid
          ? [tool("QuickBooks", "Full bookkeeping", "$30/mo", "https://quickbooks.intuit.com")]
          : []),
      ],
      tasks: [
        step(
          "Build a 12-month budget & runway model",
          "List every expected cost and any revenue by month. Calculate how long your budget lasts (runway). Keep it in one sheet.",
          ["Google Sheets"],
          [res("Google Sheets", "https://sheets.google.com")],
          "1-2 days"
        ),
        step(
          "Open a business bank account",
          "Separate business and personal money from day one. Compare free/low-fee startup-friendly banks.",
          paid ? ["Mercury", "Wise"] : ["Wise", "Local bank"],
          [res("Mercury", "https://mercury.com"), res("Wise", "https://wise.com")],
          "2-3 days"
        ),
        step(
          "Set up accounting & payments",
          "Connect a free accounting tool and set up Stripe so you can charge customers the moment you're ready.",
          ["Wave", "Stripe"],
          [res("Wave", "https://waveapps.com"), res("Stripe", "https://stripe.com")],
          "1 day"
        ),
        step(
          "Define your unit economics",
          "Work out what it costs to acquire a customer (CAC) and what they're worth (LTV). Make sure LTV > 3× CAC eventually.",
          ["Google Sheets"],
          [res("Google Sheets", "https://sheets.google.com")],
          "1 day"
        ),
      ],
      estimatedCost: scaledCost({ bootstrap: 0, moderate: 500, funded: 2500 }, tier),
      posX: DEFAULT_NODE_LAYOUT.finance.x,
      posY: DEFAULT_NODE_LAYOUT.finance.y,
    },
    {
      category: "legal",
      title: "Legal Foundations",
      description: "Protect yourself early. Register the business and get basic legal docs in place.",
      tools: [
        tool("LegalZoom", "LLC formation", "From $0 + state fees", "https://legalzoom.com"),
        tool("Termly", "Free policy generator", "Free tier", "https://termly.io"),
        tool("Google Domains / Namecheap", "Domain + trademark check", "~$12/yr", "https://namecheap.com"),
        ...(funded
          ? [tool("Stripe Atlas", "Delaware C-Corp setup", "$500 one-time", "https://stripe.com/atlas")]
          : []),
      ],
      tasks: [
        step(
          "Choose your business structure",
          funded
            ? "For raising VC, a Delaware C-Corp is standard. Otherwise an LLC is simpler and cheaper. Decide based on funding plans."
            : "An LLC is usually simplest and cheapest to start. You can convert later if you raise money.",
          funded ? ["Stripe Atlas"] : ["LegalZoom"],
          funded
            ? [res("Stripe Atlas", "https://stripe.com/atlas")]
            : [res("LegalZoom", "https://legalzoom.com")],
          "1-2 days"
        ),
        step(
          "Register the entity & secure your name",
          "File your formation, then buy your domain and do a quick trademark search to avoid naming conflicts.",
          ["LegalZoom", "Namecheap", "USPTO search"],
          [res("Namecheap", "https://namecheap.com"), res("USPTO", "https://uspto.gov")],
          "3-5 days"
        ),
        step(
          "Generate Terms of Service & Privacy Policy",
          "Use a free generator to create baseline legal pages. Essential before you collect any user data.",
          ["Termly"],
          [res("Termly", "https://termly.io")],
          "1 day"
        ),
      ],
      estimatedCost: scaledCost({ bootstrap: 150, moderate: 700, funded: 2500 }, tier),
      posX: DEFAULT_NODE_LAYOUT.legal.x,
      posY: DEFAULT_NODE_LAYOUT.legal.y,
    },
    {
      category: "operations",
      title: "Operations Setup",
      description: "Put in place the systems that let you move fast: project management, docs, and support.",
      tools: [
        tool("Linear", "Project management", "Free tier", "https://linear.app"),
        tool("Slack", "Team comms", "Free tier", "https://slack.com"),
        tool("Notion", "Docs & SOPs", "Free tier", "https://notion.so"),
        ...(paid
          ? [tool("Intercom", "Customer support", "From $39/mo", "https://intercom.com")]
          : [tool("Crisp", "Free live chat", "Free tier", "https://crisp.chat")]),
      ],
      tasks: [
        step(
          "Set up a project board with milestones",
          "Create a simple board with your roadmap milestones and weekly tasks so nothing falls through the cracks.",
          ["Linear"],
          [res("Linear", "https://linear.app")],
          "1 day"
        ),
        step(
          "Document your core processes (SOPs)",
          "Write short how-to docs for recurring work (onboarding, support, releases) so you can delegate later.",
          ["Notion"],
          [res("Notion", "https://notion.so")],
          "2 days"
        ),
        step(
          "Set up a customer support channel",
          "Add live chat or a support inbox so early users can reach you instantly. Fast response builds trust.",
          paid ? ["Intercom"] : ["Crisp"],
          paid ? [res("Intercom", "https://intercom.com")] : [res("Crisp", "https://crisp.chat")],
          "1 day"
        ),
      ],
      estimatedCost: scaledCost({ bootstrap: 0, moderate: 300, funded: 1500 }, tier),
      posX: DEFAULT_NODE_LAYOUT.operations.x,
      posY: DEFAULT_NODE_LAYOUT.operations.y,
    },
    {
      category: "team",
      title: "Team & Hiring",
      description: "Stay lean. Start solo or with a co-founder and only hire when the pain is real.",
      tools: [
        tool("LinkedIn", "Find people", "Free", "https://linkedin.com"),
        tool("YC Co-Founder Matching", "Find a co-founder", "Free", "https://ycombinator.com/cofounder-matching"),
        ...(paid
          ? [tool("Deel", "Pay contractors globally", "From $49/mo", "https://deel.com")]
          : [tool("Contra", "Hire freelancers commission-free", "Free", "https://contra.com")]),
      ],
      tasks: [
        step(
          "Clarify roles & co-founder agreement",
          "If you have a co-founder, agree on equity split, roles, and vesting in writing NOW to avoid disputes later.",
          ["YC Co-Founder Matching", "Google Docs"],
          [res("YC Co-Founder Matching", "https://ycombinator.com/cofounder-matching")],
          "2-3 days"
        ),
        step(
          "Define your first 3 hires (and when)",
          "List the roles that would most accelerate you, and the revenue/traction trigger that justifies each hire.",
          ["Notion"],
          [res("Notion", "https://notion.so")],
          "1 day"
        ),
        step(
          "Set up contractor onboarding",
          "Start with freelancers/contractors before full-time hires. Prepare a simple onboarding checklist and payment method.",
          paid ? ["Deel"] : ["Contra"],
          paid ? [res("Deel", "https://deel.com")] : [res("Contra", "https://contra.com")],
          "1 day"
        ),
      ],
      estimatedCost: scaledCost({ bootstrap: 0, moderate: 1000, funded: 8000 }, tier),
      posX: DEFAULT_NODE_LAYOUT.team.x,
      posY: DEFAULT_NODE_LAYOUT.team.y,
    },
    {
      category: "launch",
      title: "Launch & Growth",
      description: "Ship publicly, gather feedback, and iterate weekly. Measure what matters.",
      tools: [
        tool("Product Hunt", "Launch-day reach", "Free", "https://producthunt.com"),
        tool("PostHog", "Product analytics", "Free tier", "https://posthog.com"),
        tool("X (Twitter)", "Build in public", "Free", "https://x.com"),
        ...(funded
          ? [tool("Google Ads", "Paid acquisition tests", "Budget-based", "https://ads.google.com")]
          : []),
      ],
      tasks: [
        step(
          "Prepare a launch-day checklist",
          "Assets, copy, demo video, and a list of people/communities to notify. Line up early supporters to engage on day one.",
          ["Notion", "Canva"],
          [res("Canva", "https://canva.com")],
          "3-5 days"
        ),
        step(
          "Launch on Product Hunt & communities",
          "Post on Product Hunt and share across the channels where your ICP lives. Respond to every comment quickly.",
          ["Product Hunt", "X (Twitter)"],
          [res("Product Hunt", "https://producthunt.com"), res("X", "https://x.com")],
          "1 day"
        ),
        step(
          "Instrument analytics & set your north-star metric",
          "Track activation, retention, and one north-star metric. Review it every week and act on it.",
          ["PostHog"],
          [res("PostHog", "https://posthog.com")],
          "2 days"
        ),
        step(
          "Run a weekly growth review",
          "Every week, review metrics, talk to users, ship one improvement. Compounding small wins is how startups grow.",
          ["Notion", "PostHog"],
          [res("PostHog", "https://posthog.com")],
          "Ongoing"
        ),
      ],
      estimatedCost: scaledCost({ bootstrap: 0, moderate: 1000, funded: 5000 }, tier),
      posX: DEFAULT_NODE_LAYOUT.launch.x,
      posY: DEFAULT_NODE_LAYOUT.launch.y,
    },
  ];
}

function buildFallbackRoadmap(prompt: string, budget?: number): GeneratedRoadmap {
  const tier = budgetTier(budget);
  const name = prompt.split(" ").slice(0, 3).join(" ") || "My Startup";
  const budgetLabel = budget
    ? `$${budget.toLocaleString()}`
    : "bootstrap (no budget set yet)";

  const nodes = buildNodes(prompt, tier, budgetLabel);

  const edges: GeneratedRoadmap["edges"] = [
    { sourceCategory: "idea", targetCategory: "product" },
    { sourceCategory: "product", targetCategory: "marketing" },
    { sourceCategory: "idea", targetCategory: "finance" },
    { sourceCategory: "finance", targetCategory: "legal" },
    { sourceCategory: "product", targetCategory: "operations" },
    { sourceCategory: "operations", targetCategory: "team" },
    { sourceCategory: "marketing", targetCategory: "launch" },
    { sourceCategory: "team", targetCategory: "launch" },
  ];

  const budgetNotes =
    tier === "bootstrap"
      ? `With ${budgetLabel}, every tool suggested here is free or freemium. Validate manually, keep burn near zero, and only pay for tools once you have paying customers.`
      : tier === "moderate"
        ? `With ${budgetLabel}, invest in a solid MVP and initial marketing while keeping a 6-month runway buffer. Recommendations stay within affordable paid tiers.`
        : `With ${budgetLabel}, you can hire specialists early, run paid acquisition tests, and use premium tooling from the start — while still tracking runway carefully.`;

  return {
    name,
    description: `A budget-aware startup plan for: ${prompt}`,
    budgetNotes,
    nodes,
    edges,
    dailyReminders: [
      {
        title: "Daily standup",
        message: "Review your top 3 tasks for today and update progress on your roadmap.",
        time: "09:00",
        days: [1, 2, 3, 4, 5],
      },
      {
        title: "Customer touchpoint",
        message: "Talk to at least one potential customer or user today.",
        time: "14:00",
        days: [1, 2, 3, 4, 5],
      },
      {
        title: "Weekly review",
        message: "Review overall progress, update budget tracker, and plan next week.",
        time: "10:00",
        days: [5],
      },
    ],
  };
}

function normalizeRoadmap(
  raw: GeneratedRoadmap,
  prompt: string,
  budget?: number
): GeneratedRoadmap {
  const fallback = buildFallbackRoadmap(prompt, budget);
  const categories: NodeCategory[] = [
    "idea",
    "product",
    "marketing",
    "finance",
    "legal",
    "operations",
    "team",
    "launch",
  ];

  const nodes = categories.map((category) => {
    const fromAi = raw.nodes?.find((n) => n.category === category);
    const fromFallback = fallback.nodes.find((n) => n.category === category)!;
    const layout = DEFAULT_NODE_LAYOUT[category];

    const aiTasks = normalizeTasks(fromAi?.tasks);

    return {
      ...fromFallback,
      ...fromAi,
      category,
      posX: fromAi?.posX ?? layout.x,
      posY: fromAi?.posY ?? layout.y,
      tools: fromAi?.tools?.length ? fromAi.tools : fromFallback.tools,
      tasks: aiTasks.length ? aiTasks : fromFallback.tasks,
    };
  });

  return {
    name: raw.name || fallback.name,
    description: raw.description || fallback.description,
    budgetNotes: raw.budgetNotes || fallback.budgetNotes,
    nodes,
    edges: raw.edges?.length ? raw.edges : fallback.edges,
    dailyReminders: raw.dailyReminders?.length
      ? raw.dailyReminders
      : fallback.dailyReminders,
  };
}

// Guards against the model returning tasks as plain strings.
function normalizeTasks(tasks: unknown): TaskStep[] {
  if (!Array.isArray(tasks)) return [];
  return tasks
    .map((t): TaskStep | null => {
      if (typeof t === "string") {
        return { title: t, detail: "", tools: [], resources: [] };
      }
      if (t && typeof t === "object") {
        const obj = t as Partial<TaskStep>;
        if (!obj.title) return null;
        return {
          title: obj.title,
          detail: obj.detail ?? "",
          tools: Array.isArray(obj.tools) ? obj.tools : [],
          resources: Array.isArray(obj.resources) ? obj.resources : [],
          estimatedTime: obj.estimatedTime,
        };
      }
      return null;
    })
    .filter((t): t is TaskStep => t !== null);
}

/**
 * Keeps the plan within the user's budget: if the sum of estimated costs
 * exceeds the budget, scales each block's cost down proportionally so the
 * total lands at ~90% of budget (leaving a small buffer).
 */
function applyBudgetFit(
  roadmap: GeneratedRoadmap,
  budget?: number
): GeneratedRoadmap {
  if (!budget || budget <= 0) return roadmap;

  const total = roadmap.nodes.reduce((s, n) => s + (n.estimatedCost ?? 0), 0);
  if (total <= budget) return roadmap;

  const target = budget * 0.9;
  const factor = target / total;

  roadmap.nodes = roadmap.nodes.map((n) => ({
    ...n,
    estimatedCost:
      n.estimatedCost && n.estimatedCost > 0
        ? Math.max(0, Math.floor((n.estimatedCost * factor) / 5) * 5)
        : n.estimatedCost,
  }));

  roadmap.budgetNotes = `${roadmap.budgetNotes} Costs have been trimmed to fit your $${budget.toLocaleString()} budget by prioritizing free and low-cost tools — see the Financial plan for the full breakdown.`;

  return roadmap;
}

export async function generateRoadmap(
  prompt: string,
  budget?: number
): Promise<GeneratedRoadmap> {
  const client = getOpenAIClient();

  if (!client) {
    return applyBudgetFit(buildFallbackRoadmap(prompt, budget), budget);
  }

  try {
    const tier = budgetTier(budget);
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Startup idea: ${prompt}\nTotal budget: ${
            budget ? `$${budget}` : "not specified — assume bootstrap, free tools only"
          }\nBudget tier: ${tier}. Only recommend tools affordable within this budget.`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return applyBudgetFit(buildFallbackRoadmap(prompt, budget), budget);
    }

    const parsed = JSON.parse(content) as GeneratedRoadmap;
    return applyBudgetFit(normalizeRoadmap(parsed, prompt, budget), budget);
  } catch {
    return applyBudgetFit(buildFallbackRoadmap(prompt, budget), budget);
  }
}
