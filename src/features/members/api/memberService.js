import { apiClient } from "../../../shared/api/client";

export async function listMembers(organizationId) {
  const { data } = await apiClient.get(`/auth/organizations/${organizationId}/members`);
  return data?.data?.members ?? data?.members ?? data?.data ?? [];
}

export async function createMember(organizationId, input) {
  const { data } = await apiClient.post(`/auth/organizations/${organizationId}/members`, input);
  return data;
}

export async function updateMemberRole(organizationId, memberId, role) {
  const { data } = await apiClient.patch(
    `/auth/organizations/${organizationId}/members/${memberId}/role`,
    { role },
  );
  return data;
}

export async function deleteMember(organizationId, memberId) {
  const { data } = await apiClient.delete(`/auth/organizations/${organizationId}/members/${memberId}`);
  return data;
}
