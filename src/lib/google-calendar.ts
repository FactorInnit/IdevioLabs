import crypto from "crypto";
import { normalizeSiteUrl, sanitizeNextPath } from "@/lib/site";

const SECRET = process.env.AUTH_SECRET || "launchpad-dev-secret-change-me";

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
].join(" ");

export interface CalendarOAuthState {
  projectId: string;
  origin: string;
  next: string;
}

function signState(payload: CalendarOAuthState): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyCalendarState(state: string): CalendarOAuthState | null {
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
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString()) as Partial<CalendarOAuthState>;
    if (!parsed.origin || !parsed.projectId) return null;
    return {
      projectId: parsed.projectId,
      origin: normalizeSiteUrl(parsed.origin),
      next: sanitizeNextPath(parsed.next),
    };
  } catch {
    return null;
  }
}

export function getGoogleCalendarAuthUrl(
  projectId: string,
  returnPath: string,
  origin: string
): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
  }

  const safeOrigin = normalizeSiteUrl(origin);
  const redirectUri = `${safeOrigin}/api/calendar/google/callback`;
  const state = signState({
    projectId,
    origin: safeOrigin,
    next: sanitizeNextPath(returnPath),
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: CALENDAR_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCalendarCode(code: string, origin: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const safeOrigin = normalizeSiteUrl(origin);
  const redirectUri = `${safeOrigin}/api/calendar/google/callback`;

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
    throw new Error(`Failed to exchange Google Calendar code: ${detail}`);
  }

  return (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };
}

export async function refreshGoogleCalendarAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    throw new Error(`Failed to refresh Google Calendar token: ${detail}`);
  }

  return (await tokenRes.json()) as { access_token: string; expires_in: number };
}

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  notes?: string;
  externalUrl?: string;
}

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Google Calendar API error: ${detail}`);
  }

  const data = (await res.json()) as {
    items?: {
      id: string;
      summary?: string;
      description?: string;
      htmlLink?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }[];
  };

  return (data.items ?? []).map((item) => {
    const startRaw = item.start?.dateTime ?? item.start?.date ?? "";
    const endRaw = item.end?.dateTime ?? item.end?.date ?? "";
    const start = startRaw ? new Date(startRaw) : new Date();
    const end = endRaw ? new Date(endRaw) : start;

    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const hasTime = Boolean(item.start?.dateTime);

    return {
      id: `google-${item.id}`,
      title: item.summary ?? "Google Calendar event",
      date,
      time: hasTime
        ? `${pad(start.getHours())}:${pad(start.getMinutes())}`
        : undefined,
      endTime: hasTime ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : undefined,
      notes: item.description,
      externalUrl: item.htmlLink,
    };
  });
}
