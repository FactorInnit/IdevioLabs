export interface NewsletterBrief {
  title: string;
  summary: string;
  tag: "Funding" | "AI" | "Markets" | "Policy" | "Product" | "Leadership";
}

export interface NewsletterEdition {
  id: string;
  weekLabel: string;
  published: string;
  headline: string;
  ceoLetter: {
    title: string;
    body: string;
  };
  founderPlaybook: {
    title: string;
    items: string[];
  };
  worldBriefs: NewsletterBrief[];
  quote: {
    text: string;
    author: string;
    role: string;
  };
  readMinutes: number;
  coverImage: string;
  sectionImage: string;
}

export const FOUNDER_NEWSLETTERS: NewsletterEdition[] = [
  {
    id: "2026-w27",
    weekLabel: "Week of June 30, 2026",
    published: "2026-06-30",
    headline: "Ship weekly, not perfectly — the new founder default",
    ceoLetter: {
      title: "From the CEO desk",
      body:
        "The founders winning right now aren't waiting for perfect product-market fit slides. They're shipping in public, measuring retention weekly, and treating every customer conversation as strategy input. Your job this week: pick one metric that proves someone cares — activation, repeat usage, or a paid pilot — and move it by Friday. Everything else is noise until that number moves.",
    },
    founderPlaybook: {
      title: "This week's CEO checklist",
      items: [
        "Block 90 minutes for a solo CEO review — wins, blockers, one decision only you can make.",
        "Talk to 3 users without pitching. Ask what almost made them churn.",
        "Update your runway sheet and kill one tool subscription you haven't used in 30 days.",
        "Publish one build-in-public update — traction or lesson, not a launch announcement.",
        "Assign one roadmap block to 'done' or explicitly defer it with a reason.",
      ],
    },
    worldBriefs: [
      {
        title: "AI-native startups compress go-to-market timelines",
        summary:
          "Teams using AI for support, onboarding, and ops are reaching first revenue 40–60% faster than peers still hiring linear headcount. The moat is workflow integration, not the model.",
        tag: "AI",
      },
      {
        title: "Seed rounds favor traction over TAM slides",
        summary:
          "Investors are prioritizing retention curves, payback period, and founder velocity over market-size theater. Warm intros still matter — but proof beats narrative.",
        tag: "Funding",
      },
      {
        title: "SMB buyers expect instant time-to-value",
        summary:
          "Self-serve onboarding and clear ROI within 7 days are becoming table stakes. Founders who hide pricing or require sales calls lose to faster alternatives.",
        tag: "Product",
      },
      {
        title: "Remote-first teams double down on async rituals",
        summary:
          "Weekly written updates, decision logs, and Loom-style demos are replacing standing meetings at high-performing startups. Clarity scales better than presence.",
        tag: "Leadership",
      },
    ],
    quote: {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      role: "Founder, Disney",
    },
    readMinutes: 6,
    coverImage: "/images/hero-3d.png",
    sectionImage: "/images/showcase-3d.png",
  },
  {
    id: "2026-w26",
    weekLabel: "Week of June 23, 2026",
    published: "2026-06-23",
    headline: "Runway is a strategy — treat it like one",
    ceoLetter: {
      title: "From the CEO desk",
      body:
        "Cash is oxygen, but runway is a plan. Founders who survive downturns map scenarios: base, stretch, and break-glass. This week, model what happens if growth is flat for 90 days. If that scenario is uncomfortable, you have a prioritization problem — not a fundraising problem yet.",
    },
    founderPlaybook: {
      title: "Finance & focus",
      items: [
        "Update your 13-week cash view — inflows, outflows, and one discretionary cut.",
        "Re-price or re-package one offer based on what customers actually buy.",
        "Review competitor pricing pages — note one gap you can own.",
        "Schedule a 30-minute legal/compliance check if you're handling user data.",
        "Celebrate one shipped milestone with your team — momentum is a resource.",
      ],
    },
    worldBriefs: [
      {
        title: "Enterprise pilots extend but convert slower",
        summary:
          "B2B cycles are lengthening; founders are winning with paid pilots and success criteria documented upfront instead of free POCs.",
        tag: "Markets",
      },
      {
        title: "EU AI Act compliance becomes a sales feature",
        summary:
          "Startups documenting data lineage and human-in-the-loop controls are closing EU deals faster than those treating compliance as a later problem.",
        tag: "Policy",
      },
      {
        title: "Vertical SaaS beats horizontal tools in crowded categories",
        summary:
          "Niche workflows — dental, logistics, creator ops — continue to outperform generic project tools on retention and willingness to pay.",
        tag: "Product",
      },
    ],
    quote: {
      text: "Risk more than others think is safe. Dream more than others think is practical.",
      author: "Howard Schultz",
      role: "Former CEO, Starbucks",
    },
    readMinutes: 5,
    coverImage: "/images/showcase-3d.png",
    sectionImage: "/images/hero-3d.png",
  },
  {
    id: "2026-w25",
    weekLabel: "Week of June 16, 2026",
    published: "2026-06-16",
    headline: "Your unfair advantage is speed of learning",
    ceoLetter: {
      title: "From the CEO desk",
      body:
        "Big companies can out-spend you. They can't out-learn you if you tighten your feedback loop. The highest-leverage habit: ship something small every week, write down what you learned, and change one assumption. Compound learning beats compound headcount.",
    },
    founderPlaybook: {
      title: "Learning loop",
      items: [
        "Run one experiment with a clear hypothesis and success metric.",
        "Interview a user who signed up but didn't activate — find the friction.",
        "Rewrite your homepage hero for clarity, not cleverness.",
        "Share your roadmap change log with your team — transparency builds trust.",
        "Protect 2 hours of deep work daily — no Slack, no email.",
      ],
    },
    worldBriefs: [
      {
        title: "Community-led growth returns for technical products",
        summary:
          "Discord, Slack communities, and open changelogs are driving qualified leads for dev tools and founder OS products alike.",
        tag: "Product",
      },
      {
        title: "Angel checks cluster around repeat founders",
        summary:
          "First-time founders are closing smaller rounds faster via accelerators and revenue-based paths while repeat founders raise larger pre-seeds on reputation.",
        tag: "Funding",
      },
      {
        title: "Burnout drives silent churn on small teams",
        summary:
          "Founders reporting weekly CEO rituals and enforced time-off see lower co-founder conflict and fewer missed deadlines.",
        tag: "Leadership",
      },
    ],
    quote: {
      text: "Move fast and break things — unless you are breaking stuff, you are not moving fast enough.",
      author: "Mark Zuckerberg",
      role: "CEO, Meta",
    },
    readMinutes: 5,
    coverImage: "/images/prompt-bg.png",
    sectionImage: "/images/hero-3d.png",
  },
];

export function getFeaturedNewsletter(): NewsletterEdition {
  return FOUNDER_NEWSLETTERS[0];
}

export function getNewsletterArchive(): NewsletterEdition[] {
  return FOUNDER_NEWSLETTERS;
}

export const NEWSLETTER_TAG_COLORS: Record<NewsletterBrief["tag"], string> = {
  Funding: "bg-emerald-100 text-emerald-800",
  AI: "bg-violet-100 text-violet-800",
  Markets: "bg-blue-100 text-blue-800",
  Policy: "bg-rose-100 text-rose-800",
  Product: "bg-amber-100 text-amber-800",
  Leadership: "bg-navy-100 text-navy-800",
};
