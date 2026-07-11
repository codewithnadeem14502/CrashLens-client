import { apiClient } from "../../../shared/api/client";

const unwrapData = (response) => response?.data?.data ?? response?.data ?? {};

export async function listUptimeMonitors(params = {}) {
  const response = await apiClient.get("/uptime-monitors", { params: cleanParams(params) });
  const data = unwrapData(response);

  return {
    uptimeMonitors: data.uptimeMonitors ?? [],
    pagination: data.pagination ?? { page: 1, limit: 25, total: 0, totalPages: 1 },
  };
}

export async function getUptimeMonitor(uptimeMonitorId) {
  const response = await apiClient.get(`/uptime-monitors/${uptimeMonitorId}`);
  return unwrapData(response).uptimeMonitor ?? null;
}

export async function createUptimeMonitor(input) {
  const { data } = await apiClient.post("/uptime-monitors", input);
  return data;
}

export async function updateUptimeMonitor(uptimeMonitorId, input) {
  const { data } = await apiClient.patch(`/uptime-monitors/${uptimeMonitorId}`, input);
  return data;
}

export async function deleteUptimeMonitor(uptimeMonitorId) {
  const { data } = await apiClient.delete(`/uptime-monitors/${uptimeMonitorId}`);
  return data;
}

export async function listUptimeChecks(uptimeMonitorId, params = {}) {
  const response = await apiClient.get(`/uptime-monitors/${uptimeMonitorId}/checks`, {
    params: cleanParams(params),
  });
  const data = unwrapData(response);

  return {
    checks: data.checks ?? [],
    pagination: data.pagination ?? { page: 1, limit: 25, total: 0, totalPages: 1 },
  };
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
}
