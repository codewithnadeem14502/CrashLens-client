const STORAGE_PREFIX = "crashlens.selectedProjectId.";

export function loadProjectFilter(organizationId) {
  if (!organizationId) return "all";

  try {
    return localStorage.getItem(STORAGE_PREFIX + organizationId) ?? "all";
  } catch {
    return "all";
  }
}

export function saveProjectFilter(organizationId, projectId) {
  if (!organizationId) return;

  try {
    localStorage.setItem(STORAGE_PREFIX + organizationId, projectId);
  } catch {
    // Storage unavailable (private mode, quota) - selection just won't persist.
  }
}
