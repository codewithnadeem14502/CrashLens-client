import { Roles } from "./authEnums";

export function hasPermission(session, permission) {
  return session?.role === Roles.ADMIN || session?.permissions?.includes(permission);
}
