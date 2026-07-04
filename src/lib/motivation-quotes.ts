export interface MotivationQuote {
  text: string;
  author: string;
  role: string;
  tags: string[];
}

export const MOTIVATION_CATEGORIES = [
  "random",
  "discipline",
  "focus",
  "leadership",
  "persistence",
  "entrepreneurship",
  "sales",
  "mindset",
  "grit",
  "execution",
] as const;

export type MotivationCategory = (typeof MOTIVATION_CATEGORIES)[number];

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    role: "16th U.S. President",
    tags: ["discipline", "focus", "mindset"],
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    role: "Philosopher",
    tags: ["discipline", "habits", "execution"],
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    role: "Founder, Disney",
    tags: ["execution", "entrepreneurship", "focus"],
  },
  {
    text: "Your most unhappy customers are your greatest source of learning.",
    author: "Bill Gates",
    role: "Co-founder, Microsoft",
    tags: ["entrepreneurship", "mindset", "sales"],
  },
  {
    text: "I knew that if I failed I wouldn't regret that, but I knew the one thing I might regret is not trying.",
    author: "Jeff Bezos",
    role: "Founder, Amazon",
    tags: ["persistence", "entrepreneurship", "grit"],
  },
  {
    text: "Don't worry about failure; you only have to be right once.",
    author: "Drew Houston",
    role: "CEO, Dropbox",
    tags: ["persistence", "mindset", "entrepreneurship"],
  },
  {
    text: "Chase the vision, not the money; the money will end up following you.",
    author: "Tony Hsieh",
    role: "CEO, Zappos",
    tags: ["entrepreneurship", "leadership", "mindset"],
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    role: "Management thinker",
    tags: ["leadership", "entrepreneurship", "execution"],
  },
  {
    text: "Done is better than perfect.",
    author: "Sheryl Sandberg",
    role: "Former COO, Meta",
    tags: ["execution", "focus", "discipline"],
  },
  {
    text: "If you are not embarrassed by the first version of your product, you've launched too late.",
    author: "Reid Hoffman",
    role: "Co-founder, LinkedIn",
    tags: ["execution", "entrepreneurship", "grit"],
  },
  {
    text: "Great things in business are never done by one person. They're done by a team of people.",
    author: "Steve Jobs",
    role: "Co-founder, Apple",
    tags: ["leadership", "entrepreneurship"],
  },
  {
    text: "Stay hungry. Stay foolish.",
    author: "Steve Jobs",
    role: "Co-founder, Apple",
    tags: ["mindset", "persistence", "grit"],
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    role: "Co-founder, Apple",
    tags: ["mindset", "focus", "discipline"],
  },
  {
    text: "Sales cures all.",
    author: "Mark Cuban",
    role: "Entrepreneur & investor",
    tags: ["sales", "entrepreneurship", "execution"],
  },
  {
    text: "It doesn't matter how many times you fail. You only have to be right once.",
    author: "Mark Cuban",
    role: "Entrepreneur & investor",
    tags: ["persistence", "grit", "sales"],
  },
  {
    text: "Leadership is not about being in charge. It is about taking care of those in your charge.",
    author: "Simon Sinek",
    role: "Author & speaker",
    tags: ["leadership", "mindset"],
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    role: "Prime Minister",
    tags: ["persistence", "grit", "leadership"],
  },
  {
    text: "The difference between successful people and really successful people is that really successful people say no to almost everything.",
    author: "Warren Buffett",
    role: "CEO, Berkshire Hathaway",
    tags: ["focus", "discipline", "leadership"],
  },
  {
    text: "Build something 100 people love, not something 1 million people kind of like.",
    author: "Paul Graham",
    role: "Co-founder, Y Combinator",
    tags: ["entrepreneurship", "focus", "sales"],
  },
  {
    text: "Make something people want.",
    author: "Paul Graham",
    role: "Co-founder, Y Combinator",
    tags: ["entrepreneurship", "execution", "sales"],
  },
  {
    text: "Do things that don't scale.",
    author: "Paul Graham",
    role: "Co-founder, Y Combinator",
    tags: ["execution", "sales", "entrepreneurship"],
  },
  {
    text: "There are no silver bullets for this business, only lead bullets.",
    author: "Ben Horowitz",
    role: "Co-founder, a16z",
    tags: ["grit", "execution", "persistence"],
  },
  {
    text: "Focus on signal over noise. Don't waste time on stuff that doesn't make the product better.",
    author: "Elon Musk",
    role: "CEO, Tesla & SpaceX",
    tags: ["focus", "execution", "discipline"],
  },
  {
    text: "When something is important enough, you do it even if the odds are not in your favor.",
    author: "Elon Musk",
    role: "CEO, Tesla & SpaceX",
    tags: ["persistence", "grit", "entrepreneurship"],
  },
  {
    text: "If you double your rate of learning, you double your rate of success.",
    author: "Brian Chesky",
    role: "CEO, Airbnb",
    tags: ["mindset", "execution", "entrepreneurship"],
  },
  {
    text: "It's not about ideas. It's about making ideas happen.",
    author: "Scott Belsky",
    role: "Co-founder, Behance",
    tags: ["execution", "discipline", "focus"],
  },
  {
    text: "Don't find customers for your products, find products for your customers.",
    author: "Seth Godin",
    role: "Author & marketer",
    tags: ["sales", "entrepreneurship", "focus"],
  },
  {
    text: "Energy and persistence conquer all things.",
    author: "Benjamin Franklin",
    role: "Founding father & inventor",
    tags: ["persistence", "grit", "discipline"],
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    role: "Sales trainer & author",
    tags: ["sales", "execution", "grit"],
  },
  {
    text: "People often say motivation doesn't last. Neither does bathing — that's why we recommend it daily.",
    author: "Zig Ziglar",
    role: "Sales trainer & author",
    tags: ["discipline", "mindset", "sales"],
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function normalizeMotivationCategory(input: string): string {
  return input.trim().toLowerCase() || "random";
}

export function filterQuotesByCategory(category: string): MotivationQuote[] {
  const normalized = normalizeMotivationCategory(category);
  if (normalized === "random") return MOTIVATION_QUOTES;

  const matches = MOTIVATION_QUOTES.filter((quote) =>
    quote.tags.some((tag) => tag.includes(normalized) || normalized.includes(tag))
  );

  return matches.length > 0 ? matches : MOTIVATION_QUOTES;
}

export function getDailyMotivationQuote(input: {
  userId: string;
  category: string;
  date?: string;
}): MotivationQuote & { category: string; date: string } {
  const date = input.date ?? new Date().toISOString().slice(0, 10);
  const category = normalizeMotivationCategory(input.category);
  const pool = filterQuotesByCategory(category);
  const index = hashString(`${input.userId}:${date}:${category}`) % pool.length;
  const quote = pool[index];

  return { ...quote, category, date };
}
