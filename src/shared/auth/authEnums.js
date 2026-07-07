export const NodeEnv = Object.freeze({
  PRODUCTION: "production",
  DEVELOPMENT: "development",
});

export const Roles = Object.freeze({
  ADMIN: "admin",
  DEVELOPER: "developer",
  VIEWER: "viewer",
});

export const Permissions = Object.freeze({
  ORGANIZATION_VIEW: "organization:view",
  PROJECT_CREATE: "project:create",
  PROJECT_VIEW: "project:view",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",
  MEMBER_VIEW: "member:view",
  MEMBER_INVITE: "member:invite",
  MEMBER_ROLE_UPDATE: "member:role:update",
  MEMBER_REMOVE: "member:remove",
  INTEGRATION_MANAGE: "integration:manage",
  ISSUE_VIEW: "issue:view",
  ISSUE_UPDATE: "issue:update",
});

export const RolePermissions = Object.freeze({
  [Roles.ADMIN]: Object.freeze([
    Permissions.ORGANIZATION_VIEW,
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_VIEW,
    Permissions.PROJECT_UPDATE,
    Permissions.PROJECT_DELETE,
    Permissions.MEMBER_VIEW,
    Permissions.MEMBER_INVITE,
    Permissions.MEMBER_ROLE_UPDATE,
    Permissions.MEMBER_REMOVE,
    Permissions.ISSUE_VIEW,
    Permissions.ISSUE_UPDATE,
  ]),
  [Roles.DEVELOPER]: Object.freeze([
    Permissions.ORGANIZATION_VIEW,
    Permissions.PROJECT_VIEW,
    Permissions.MEMBER_VIEW,
    Permissions.ISSUE_VIEW,
    Permissions.ISSUE_UPDATE,
  ]),
  [Roles.VIEWER]: Object.freeze([
    Permissions.ORGANIZATION_VIEW,
    Permissions.PROJECT_VIEW,
    Permissions.ISSUE_VIEW,
  ]),
});

export const AssignableMemberRoles = Object.freeze([
  Roles.DEVELOPER,
  Roles.VIEWER,
]);
