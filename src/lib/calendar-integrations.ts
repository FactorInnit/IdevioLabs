export interface CalendlySettings {
  url: string;
}

function calendlyKey(projectId: string) {
  return `idevio-calendly-${projectId}`;
}

export function normalizeCalendlyUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  try {
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    const url = new URL(withProto);
    if (!url.hostname.endsWith("calendly.com")) return null;
    return `${url.origin}${url.pathname}`.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function loadCalendlySettings(projectId: string): CalendlySettings | null {
  try {
    const raw = localStorage.getItem(calendlyKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CalendlySettings;
    const url = normalizeCalendlyUrl(parsed.url);
    return url ? { url } : null;
  } catch {
    return null;
  }
}

export function saveCalendlySettings(projectId: string, url: string): CalendlySettings | null {
  const normalized = normalizeCalendlyUrl(url);
  if (!normalized) return null;
  const settings = { url: normalized };
  localStorage.setItem(calendlyKey(projectId), JSON.stringify(settings));
  return settings;
}

export function clearCalendlySettings(projectId: string) {
  localStorage.removeItem(calendlyKey(projectId));
}
