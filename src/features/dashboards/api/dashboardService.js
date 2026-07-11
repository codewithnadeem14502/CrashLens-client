import { apiClient } from "../../../shared/api/client";

const unwrapData = (response) => response?.data?.data ?? response?.data ?? {};

const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null));

export async function listDashboards(params = {}) {
  const response = await apiClient.get("/dashboards", { params: cleanParams(params) });
  const data = unwrapData(response);

  return {
    dashboards: data.dashboards ?? [],
    pagination: data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export async function getDashboard(dashboardId) {
  const response = await apiClient.get(`/dashboards/${dashboardId}`);
  return unwrapData(response).dashboard ?? null;
}

export async function createDashboard(input) {
  const { data } = await apiClient.post("/dashboards", input);
  return data;
}

export async function updateDashboard(dashboardId, input) {
  const { data } = await apiClient.patch(`/dashboards/${dashboardId}`, input);
  return data;
}

export async function deleteDashboard(dashboardId) {
  const { data } = await apiClient.delete(`/dashboards/${dashboardId}`);
  return data;
}

// The generic query executor's preview endpoint - used both by the widget
// builder (previewing a widget before saving) and by the dashboard grid
// (fetching each widget's live value on view).
export async function executeQuery(query, thresholdType = "static") {
  const response = await apiClient.post("/query/execute", { query, thresholdType });
  return unwrapData(response);
}
