import { apiClient } from "../../../shared/api/client";

const unwrapData = (response) => response?.data?.data ?? response?.data ?? {};

export async function listPerformanceEndpoints(params = {}) {
  const response = await apiClient.get("/issues/performance/endpoints", {
    params: cleanParams(params),
  });
  const data = unwrapData(response);

  return {
    endpoints: data.endpoints ?? [],
    sampledTransactions: data.sampledTransactions ?? 0,
    defaultWindowDays: data.defaultWindowDays ?? 14,
  };
}

export async function getEndpointPerformance(endpointId, params = {}) {
  const response = await apiClient.get(
    `/issues/performance/endpoints/${endpointId}`,
    {
      params: cleanParams(params),
    },
  );

  return unwrapData(response);
}

export async function getEndpointTrends(endpointId, params = {}) {
  const response = await apiClient.get(
    `/issues/performance/endpoints/${endpointId}/trends`,
    {
      params: cleanParams(params),
    },
  );

  return unwrapData(response);
}

export async function getTrace(traceId, params = {}) {
  const response = await apiClient.get(`/issues/performance/traces/${traceId}`, {
    params: cleanParams(params),
  });

  return unwrapData(response);
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
}
