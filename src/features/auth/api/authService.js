import { apiClient } from "../../../shared/api/client";

export async function registerOrganization(input) {
  const { data } = await apiClient.post("/auth/organizations", {
    organizationName: input.organizationName,
    admin: {
      name: input.name,
      email: input.email,
      password: input.password,
    },
  });

  return data;
}

export async function login(input) {
  const { data } = await apiClient.post("/auth/login", input);
  return data;
}

export async function getOrganization(organizationId) {
  const { data } = await apiClient.get(`/auth/organizations/${organizationId}`);
  return data?.data?.organization ?? data?.organization ?? data?.data ?? null;
}
