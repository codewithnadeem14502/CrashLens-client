import { MemberRow } from "./MemberRow";
import { getMemberId } from "../utils/memberFormatters";

export function MemberList({
  members,
  isLoading,
  canUpdateRoles,
  canDeleteMembers,
  onRoleChange,
  onDeleteMember,
}) {
  if (isLoading) {
    return <div className="empty-state">Loading members...</div>;
  }

  if (!members.length) {
    return <div className="empty-state">No members returned yet.</div>;
  }

  return (
    <div className="member-list">
      {members.map((member) => (
        <MemberRow
          key={getMemberId(member)}
          member={member}
          onRoleChange={onRoleChange}
          onDelete={onDeleteMember}
          canEdit={canUpdateRoles}
          canDelete={canDeleteMembers}
        />
      ))}
    </div>
  );
}
