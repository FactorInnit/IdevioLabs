/** Production domain for Idevio Labs */
export const SITE_DOMAIN = "idevolabs.com";

/** Canonical production URL (no trailing slash). */
export const SITE_URL = `https://${SITE_DOMAIN}`;

/**
 * Resolves the app base URL for OAuth redirects, Stripe, emails, etc.
 * Priority: NEXT_PUBLIC_APP_URL → VERCEL_URL → production SITE_URL → localhost
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "production") {
    return SITE_URL;
  }

  return "http://localhost:3000";
}

export const SUPPORT_EMAIL = `hello@${SITE_DOMAIN}`;
