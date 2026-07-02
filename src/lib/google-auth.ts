import crypto from "crypto";
import { normalizeSiteUrl, sanitizeNextPath } from "@/lib/site";

const SECRET = process.env.AUTH_SECRET || "launchpad-dev-secret-change-me";

export interface OAuthState {
  next: string;
  origin: string;
}

export function getGoogleAuthUrl(next = "/dashboard", origin: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
  }

  const safeOrigin = normalizeSiteUrl(origin);
  const safeNext = sanitizeNextPath(next);
  const state = signState({ next: safeNext, origin: safeOrigin });
  const redirectUri = `${safeOrigin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function signState(payload: OAuthState): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyState(state: string): OAuthState | null {
  const idx = state.lastIndexOf(".");
  if (idx === -1) return null;
  const data = state.slice(0, idx);
  const sig = state.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString()) as Partial<OAuthState>;
    if (!parsed.origin) return null;
    return {
      next: sanitizeNextPath(parsed.next),
      origin: normalizeSiteUrl(parsed.origin),
    };
  } catch {
    return null;
  }
}

export async function exchangeGoogleCode(code: string, origin: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const safeOrigin = normalizeSiteUrl(origin);
  const redirectUri = `${safeOrigin}/api/auth/google/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    throw new Error(`Failed to exchange Google auth code: ${detail}`);
  }

  const tokens = (await tokenRes.json()) as { access_token: string };
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!profileRes.ok) {
    throw new Error("Failed to fetch Google profile.");
  }

  return (await profileRes.json()) as {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}
