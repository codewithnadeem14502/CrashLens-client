import { apiClient } from "../../../shared/api/client";

export async function listIssues({
  page = 1,
  limit = 25,
  status,
  severity,
  projectId,
} = {}) {
  const { data } = await apiClient.get("/issues", {
    params: {
      page,
      limit,
      status,
      severity,
      projectId,
    },
  });

  return {
    issues: data?.data?.issues ?? data?.issues ?? data?.data ?? [],
    pagination: data?.data?.pagination ??
      data?.pagination ?? {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
  };
}

export async function getIssue(issueId) {
  const { data } = await apiClient.get(`/issues/${issueId}`);
  return data?.data?.issue ?? data?.issue ?? data?.data ?? null;
}

export async function getIssueEvents(issueId, { page = 1, limit = 5 } = {}) {
  const { data } = await apiClient.get(`/issues/${issueId}/events`, {
    params: {
      page,
      limit,
    },
  });

  return {
    events: data?.data?.events ?? data?.events ?? data?.data ?? [],
    pagination: data?.data?.pagination ??
      data?.pagination ?? {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
  };
}

export async function updateIssueStatus(issueId, status) {
  const { data } = await apiClient.patch(`/issues/${issueId}/status`, {
    status,
  });
  return data;
}
