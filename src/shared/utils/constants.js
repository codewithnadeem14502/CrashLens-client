import { AssignableMemberRoles, Roles } from "../../shared/auth/authEnums";

const roleLabels = Object.freeze({
  [Roles.ADMIN]: "Admin",
  [Roles.DEVELOPER]: "Developer",
  [Roles.VIEWER]: "Viewer",
});

function toRoleOption(role) {
  return {
    value: role,
    label: roleLabels[role] ?? role,
  };
}

export const memberRoleOptions = [...AssignableMemberRoles.map(toRoleOption)];

export const allRoleOptions = [toRoleOption(Roles.ADMIN), ...memberRoleOptions];

export const projectEnvironmentOptions = [
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "development", label: "Development" },
];

export const projectPlatformOptions = [
  { value: "node", label: "Node.js" },
  { value: "javascript", label: "JavaScript" },
];

export const projectStatusOptions = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];
