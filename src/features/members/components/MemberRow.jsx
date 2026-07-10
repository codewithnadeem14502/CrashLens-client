import * as Avatar from "@radix-ui/react-avatar";
import { Roles } from "../../../shared/auth/authEnums";
import { RoleSelect } from "../../../shared/ui/RoleSelect";
import { getInitials } from "../../../shared/utils/strings";
import {
  allRoleOptions,
  memberRoleOptions,
} from "../../../shared/utils/constants";
import { getMemberId, getMemberUser } from "../utils/memberFormatters";
import { DeleteMemberButton } from "./DeleteMemberButton";

export function MemberRow({
  member,
  onRoleChange,
  onDelete,
  canEdit,
  canDelete,
}) {
  const memberId = getMemberId(member);
  const user = getMemberUser(member);
  const name = member.name ?? user.name ?? "Team member";
  const email = member.email ?? user.email ?? "No email";
  const role = member.role ?? Roles.VIEWER;
  const status = member.status ?? user.status ?? "active";
  const statusClassName = String(status).toLowerCase().replace(/\s+/g, "-");
  const createdAt = member.createdAt ?? user.createdAt ?? member.joinedAt;
  const isAdminMember = role === Roles.ADMIN;

  return (
    <tr className="member-table-row">
      <td className="member-name-cell">
        <Avatar.Root className="avatar">
          <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
        </Avatar.Root>
        <div className="member-copy">
          <strong>{name}</strong>
          <span>{role}</span>
        </div>
      </td>
      <td>
        <span className="member-email">{email}</span>
      </td>
      <td>
        <span className={`status-pill ${statusClassName}`}>{status}</span>
      </td>
      <td>
        <time>{formatMemberDate(createdAt)}</time>
      </td>
      <td className="member-role-cell">
        <RoleSelect
          value={role}
          options={isAdminMember ? allRoleOptions : memberRoleOptions}
          disabled={!canEdit || isAdminMember}
          onValueChange={(nextRole) => onRoleChange(memberId, nextRole)}
        />
      </td>
      <td className="member-actions-cell">
        {canDelete && !isAdminMember ? (
          <DeleteMemberButton
            memberName={name}
            onDelete={() => onDelete(memberId, name)}
          />
        ) : (
          <span className="member-action-placeholder">-</span>
        )}
      </td>
    </tr>
  );
}

function formatMemberDate(value) {
  if (!value) return "No date";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
