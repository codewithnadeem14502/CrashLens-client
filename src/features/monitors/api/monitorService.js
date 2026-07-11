import { apiClient } from "../../../shared/api/client";

const unwrapData = (response) => response?.data?.data ?? response?.data ?? {};

export async function listMonitors(params = {}) {
  const response = await apiClient.get("/monitors", { params: cleanParams(params) });
  const data = unwrapData(response);

  return {
    monitors: data.monitors ?? [],
    pagination: data.pagination ?? { page: 1, limit: 25, total: 0, totalPages: 1 },
  };
}

export async function getMonitor(monitorId) {
  const response = await apiClient.get(`/monitors/${monitorId}`);
  return unwrapData(response).monitor ?? null;
}

export async function createMonitor(input) {
  const { data } = await apiClient.post("/monitors", input);
  return data;
}

export async function updateMonitor(monitorId, input) {
  const { data } = await apiClient.patch(`/monitors/${monitorId}`, input);
  return data;
}

export async function deleteMonitor(monitorId) {
  const { data } = await apiClient.delete(`/monitors/${monitorId}`);
  return data;
}

export async function regenerateCheckToken(monitorId) {
  const { data } = await apiClient.post(`/monitors/${monitorId}/regenerate-token`);
  return data;
}

export async function listCheckIns(monitorId, params = {}) {
  const response = await apiClient.get(`/monitors/${monitorId}/checkins`, {
    params: cleanParams(params),
  });
  const data = unwrapData(response);

  return {
    checkIns: data.checkIns ?? [],
    pagination: data.pagination ?? { page: 1, limit: 25, total: 0, totalPages: 1 },
  };
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
}
