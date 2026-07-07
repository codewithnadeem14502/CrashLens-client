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
  const isAdminMember = role === Roles.ADMIN;

  return (
    <div className="member-row">
      <Avatar.Root className="avatar">
        <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
      </Avatar.Root>
      <div className="member-copy">
        <strong>{name}</strong>
        <span>{email}</span>
      </div>
      <RoleSelect
        value={role}
        options={isAdminMember ? allRoleOptions : memberRoleOptions}
        disabled={!canEdit || isAdminMember}
        onValueChange={(nextRole) => onRoleChange(memberId, nextRole)}
      />
      {canDelete && !isAdminMember ? (
        <DeleteMemberButton
          memberName={name}
          onDelete={() => onDelete(memberId, name)}
        />
      ) : null}
    </div>
  );
}
