const visionKey = (projectId: string) => `idevio-vision-${projectId}`;

export function loadCompanyVision(projectId: string): string {
  try {
    return localStorage.getItem(visionKey(projectId)) ?? "";
  } catch {
    return "";
  }
}

export function saveCompanyVision(projectId: string, vision: string) {
  try {
    localStorage.setItem(visionKey(projectId), vision.trim());
  } catch {
    // ignore
  }
}

export function defaultVisionHint(name: string, description?: string | null): string {
  if (description && description.length < 120) {
    return description;
  }
  return `Our vision: make ${name} the default choice for people who deserve something better.`;
}
