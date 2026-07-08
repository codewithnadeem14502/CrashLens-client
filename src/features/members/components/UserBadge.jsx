import * as Avatar from "@radix-ui/react-avatar";
import { getInitials } from "../../../shared/utils/strings";
import { getProject } from "../../projects/api/projectService";
import { useEffect, useState } from "react";
import { Roles } from "../../../shared/auth/authEnums";

export function UserBadge({ session }) {
  const name = session.user?.name ?? "User";
  const role = session.role ?? Roles.VIEWER;
  return (
    <div className="user-badge">
      <Avatar.Root className="avatar">
        <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
      </Avatar.Root>
      <div>
        <strong>Name: {name}</strong>
        <h3>Role: {role}</h3>
      </div>
    </div>
  );
}
