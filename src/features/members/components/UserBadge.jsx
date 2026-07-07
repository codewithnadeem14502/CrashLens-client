import * as Avatar from "@radix-ui/react-avatar";
import { getInitials } from "../../../shared/utils/strings";
import { getProject } from "../../projects/api/projectService";
import { useEffect, useState } from "react";

export function UserBadge({ session }) {
  const name = session.user?.name ?? "User";

  return (
    <div className="user-badge">
      <Avatar.Root className="avatar">
        <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
      </Avatar.Root>
      <div>
        <strong>{name}</strong>
      </div>
    </div>
  );
}
