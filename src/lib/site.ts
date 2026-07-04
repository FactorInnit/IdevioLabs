/** Production domain */
export const SITE_DOMAIN = "ideviolabs.com";

/** Canonical production URL (no trailing slash). */
export const SITE_URL = `https://${SITE_DOMAIN}`;

/** Ensure a base URL always includes a protocol and no trailing slash. */
export function normalizeSiteUrl(url: string): string {
  let value = url.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }
  return value;
}

/**
 * Origin of the current request (e.g. https://your-app.vercel.app).
 * Use this for auth redirects so users stay on the host they signed in from.
 */
export function getRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost ?? request.headers.get("host") ?? url.host)
    .split(",")[0]
    .trim();

  if (!host) return getSiteUrl();

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto =
    forwardedProto?.split(",")[0].trim() ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return normalizeSiteUrl(`${proto}://${host}`);
}

/**
 * Canonical origin for OAuth — strips www so Google redirect URI stays consistent.
 */
export function getOAuthOrigin(request: Request): string {
  const origin = getRequestOrigin(request);
  try {
    const url = new URL(origin);
    if (url.hostname === `www.${SITE_DOMAIN}`) {
      url.hostname = SITE_DOMAIN;
      return normalizeSiteUrl(url.origin);
    }
  } catch {
    // fall through
  }
  return origin;
}

/** Safe internal redirect path — blocks open redirects. */
export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

/**
 * Resolves the app base URL for Stripe, emails, etc.
 * Priority: NEXT_PUBLIC_APP_URL → production SITE_URL → VERCEL_URL → localhost
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (fromEnv) return normalizeSiteUrl(fromEnv);

  if (process.env.NODE_ENV === "production") {
    return SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return normalizeSiteUrl(`https://${process.env.VERCEL_URL}`);
  }

  return "http://localhost:3000";
}

export const SUPPORT_EMAIL = "helloideviolabs@gmail.com";
