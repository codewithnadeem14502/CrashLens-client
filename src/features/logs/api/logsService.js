import { apiClient } from "../../../shared/api/client";

export async function listLogs({
  page = 1,
  limit = 25,
  projectId,
  level,
  search,
  traceId,
  dateFrom,
  dateTo,
  order,
} = {}) {
  const { data } = await apiClient.get("/logs", {
    params: {
      page,
      limit,
      projectId,
      level,
      search,
      traceId,
      dateFrom,
      dateTo,
      order,
    },
  });

  return {
    logs: data?.data?.logs ?? data?.logs ?? data?.data ?? [],
    pagination: data?.data?.pagination ??
      data?.pagination ?? {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
  };
}
