import { apiClient } from "../../../shared/api/client";

export async function listProjects() {
  const { data } = await apiClient.get(`/projects`);
  return data?.data?.projects ?? data?.projects ?? [];
}

export async function createProject(input) {
  const { data } = await apiClient.post(`/projects`, input);
  return data;
}

export async function updateProject(projectId, input) {
  const { data } = await apiClient.patch(
    `/projects/${projectId}`,
    input,
  );
  return data;
}

export async function getProject(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}`);
  return data?.data?.project ?? data?.project ?? data?.data ?? null;
}

export async function deleteProject(projectId) {
  const { data } = await apiClient.delete(`/projects/${projectId}`);
  return data;
}

export async function getDSN(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/dsn`);
  return data?.data?.dsn ?? data?.dsn ?? "no-dsn";
}

export async function regenerateDSN(projectId) {
  const { data } = await apiClient.post(
    `/projects/${projectId}/regenerate-dsn`,
  );
  return data;
}
