import OpenAI from "openai";

/** Default model for coach, validator, competitors, and roadmap generation. */
export const OPENAI_MODEL = "gpt-4o-mini";

const PLACEHOLDER_PREFIXES = ["sk-your", "sk-proj-your", "your-api-key"];
const PLACEHOLDER_EXACT = new Set([
  "your-api-key-here",
  "sk-proj-...",
  "sk-...",
  "sk-your-key-here",
]);

function stripEnvQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function normalizeApiKey(): string | null {
  const raw = process.env.OPENAI_API_KEY;
  if (!raw) return null;

  const key = stripEnvQuotes(raw);
  if (!key) return null;

  const lower = key.toLowerCase();
  if (PLACEHOLDER_EXACT.has(lower)) return null;
  if (PLACEHOLDER_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return null;
  }

  // OpenAI secret keys start with sk- (legacy or project-scoped)
  if (!key.startsWith("sk-") || key.length < 20) {
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

export function formatOpenAIError(error: unknown): {
  code: string;
  message: string;
} {
  const err = error as {
    status?: number;
    code?: string;
    message?: string;
    error?: { message?: string; code?: string };
  };

  const status = err.status;
  const apiMessage = err.error?.message ?? err.message ?? "";
  const lower = apiMessage.toLowerCase();

  if (
    status === 401 ||
    err.code === "invalid_api_key" ||
    lower.includes("incorrect api key") ||
    lower.includes("invalid api key")
  ) {
    return {
      code: "invalid_key",
      message:
        "OpenAI rejected your API key. Regenerate it at platform.openai.com/api-keys, paste it in Vercel without quotes, then redeploy.",
    };
  }

  if (
    status === 429 ||
    lower.includes("quota") ||
    lower.includes("billing") ||
    lower.includes("insufficient")
  ) {
    return {
      code: "quota",
      message:
        "OpenAI quota or billing issue. Add a payment method at platform.openai.com/account/billing.",
    };
  }

  if (status === 403) {
    return {
      code: "forbidden",
      message:
        "OpenAI denied access to this model. Confirm your account has API access and billing enabled.",
    };
  }

  return {
    code: "api_error",
    message:
      apiMessage.slice(0, 160) ||
      "OpenAI request failed. Check your key and billing, then try again.",
  };
}

/** Lightweight live check — confirms the key works with the configured model. */
let verifyCache: {
  at: number;
  result: Awaited<ReturnType<typeof verifyOpenAIConnectionUncached>>;
} | null = null;

const VERIFY_CACHE_MS = 10 * 60 * 1000;

async function verifyOpenAIConnectionUncached(): Promise<{
  ok: boolean;
  configured: boolean;
  code?: string;
  message?: string;
}> {
  const configured = isOpenAIConfigured();
  if (!configured) {
    return {
      ok: false,
      configured: false,
      code: "missing",
      message:
        "OPENAI_API_KEY is missing or still a placeholder. Add your key in Vercel (no quotes) and redeploy.",
    };
  }

  const client = getOpenAIClient();
  if (!client) {
    return {
      ok: false,
      configured: false,
      code: "invalid_format",
      message:
        "OPENAI_API_KEY looks invalid. Use a key from platform.openai.com/api-keys — paste only the key, no quotes.",
    };
  }

  try {
    await client.chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 1,
      messages: [{ role: "user", content: "ping" }],
    });
    return { ok: true, configured: true };
  } catch (error) {
    const formatted = formatOpenAIError(error);
    console.error("OpenAI verify error:", error);
    return {
      ok: false,
      configured: true,
      code: formatted.code,
      message: formatted.message,
    };
  }
}

export async function verifyOpenAIConnection(): Promise<{
  ok: boolean;
  configured: boolean;
  code?: string;
  message?: string;
}> {
  if (verifyCache && Date.now() - verifyCache.at < VERIFY_CACHE_MS) {
    return verifyCache.result;
  }

  const result = await verifyOpenAIConnectionUncached();
  verifyCache = { at: Date.now(), result };
  return result;
}
