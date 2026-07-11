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

// No-auth endpoint - the DSN-style credential here is knowledge of the
// account's own email, not a bearer token. Matches the gateway's public
// auth allowlist (PATCH /v1/auth/update-password) and auth-service's Joi
// schema, which accepts exactly { email, newPassword } and nothing else.
export async function updatePassword(input) {
  const { data } = await apiClient.patch("/auth/update-password", {
    email: input.email,
    newPassword: input.newPassword,
  });
  return data;
}

export async function getOrganization(organizationId) {
  const { data } = await apiClient.get(`/auth/organizations/${organizationId}`);
  return data?.data?.organization ?? data?.organization ?? data?.data ?? null;
}
