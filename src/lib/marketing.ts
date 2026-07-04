export const PLATFORM_STATS = [
  { value: "12,400+", label: "Founders onboarded" },
  { value: "8,200+", label: "Roadmaps generated" },
  { value: "940+", label: "Businesses launched" },
  { value: "4.9/5", label: "Average rating" },
] as const;

export const TRUSTED_BY = [
  "Nova Ventures",
  "Birch Capital",
  "Atlas Labs",
  "Northline",
  "Summit Co.",
  "Horizon AI",
] as const;

export const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Founder, FreshRoute",
    avatar: "SC",
    rating: 5,
    quote:
      "Idevio turned my messy idea into a clear 8-step plan in minutes. The tool recommendations alone saved me weeks of research.",
  },
  {
    name: "Marcus Webb",
    role: "CEO, Stackline",
    avatar: "MW",
    rating: 5,
    quote:
      "We used the workflow map to pitch investors. Having finance, legal, and launch blocks laid out visually made us look prepared on day one.",
  },
  {
    name: "Priya Sharma",
    role: "Solo founder",
    avatar: "PS",
    rating: 5,
    quote:
      "The daily reminders kept me accountable. I went from idea to MVP in 6 weeks by following the roadmap block by block.",
  },
  {
    name: "James Okonkwo",
    role: "Co-founder, PayLoop",
    avatar: "JO",
    rating: 5,
    quote:
      "Budget-aware suggestions were spot on. As a bootstrap founder, every tool recommendation actually fit what I could afford.",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe your vision",
    text: "Tell Idevio what you want to build and optionally set your starting budget.",
  },
  {
    step: "02",
    title: "Get your roadmap",
    text: "AI generates an 8-block workflow with tools, tasks, and cost estimates tailored to you.",
  },
  {
    step: "03",
    title: "Execute & track",
    text: "Update progress, get daily reminders, and watch your startup take shape phase by phase.",
  },
] as const;

export const AI_TRAINING_SOURCES = [
  {
    label: "10,000+ CEOs & founders",
    detail: "Operator playbooks, launch patterns, and real-world decision frameworks",
  },
  {
    label: "Y Combinator resources",
    detail: "Startup School, partner essays, and canonical early-stage advice",
  },
  {
    label: "Top accelerator playbooks",
    detail: "Seed-stage fundraising, GTM, and product-market fit frameworks",
  },
  {
    label: "Investor & operator content",
    detail: "First Round Review, a16z, and leading founder communities",
  },
] as const;
