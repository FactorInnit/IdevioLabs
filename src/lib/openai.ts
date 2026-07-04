import OpenAI from "openai";

/** Default model for coach, validator, competitors, and roadmap generation. */
export const OPENAI_MODEL = "gpt-4o-mini";

const PLACEHOLDER_PREFIXES = ["sk-your", "sk-proj-your", "your-api-key"];

function normalizeApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const lower = key.toLowerCase();
  if (
    lower === "your-api-key-here" ||
    PLACEHOLDER_PREFIXES.some((prefix) => lower.startsWith(prefix))
  ) {
    return null;
  }
  return key;
}

/** True when a real OpenAI API key is configured (local `.env` or Vercel env). */
export function isOpenAIConfigured(): boolean {
  return normalizeApiKey() != null;
}

/** Shared OpenAI client — returns null when the key is missing or still a placeholder. */
export function getOpenAIClient(): OpenAI | null {
  const key = normalizeApiKey();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}
