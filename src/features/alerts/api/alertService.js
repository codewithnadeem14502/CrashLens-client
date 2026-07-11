import { apiClient } from "../../../shared/api/client";

const unwrapData = (response) => response?.data?.data ?? response?.data ?? {};

const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null));

export async function listAlertRules(params = {}) {
  const response = await apiClient.get("/alerts/rules", { params: cleanParams(params) });
  const data = unwrapData(response);

  return {
    rules: data.rules ?? [],
    pagination: data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export async function getAlertRule(ruleId) {
  const response = await apiClient.get(`/alerts/rules/${ruleId}`);
  return unwrapData(response).rule ?? null;
}

export async function createAlertRule(input) {
  const { data } = await apiClient.post("/alerts/rules", input);
  return data;
}

export async function updateAlertRule(ruleId, input) {
  const { data } = await apiClient.patch(`/alerts/rules/${ruleId}`, input);
  return data;
}

export async function deleteAlertRule(ruleId) {
  const { data } = await apiClient.delete(`/alerts/rules/${ruleId}`);
  return data;
}

export async function listAlertEvents(ruleId, params = {}) {
  const response = await apiClient.get(`/alerts/rules/${ruleId}/events`, { params: cleanParams(params) });
  const data = unwrapData(response);

  return {
    events: data.events ?? [],
    pagination: data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}
