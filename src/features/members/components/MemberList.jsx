import { useMemo, useState } from "react";
import { FiSearch, FiUserPlus, FiUsers } from "react-icons/fi";
import { Pagination } from "../../../shared/components/Pagination";
import { EmptyState } from "../../../shared/components/EmptyState";
import { MemberRow } from "./MemberRow";
import { getMemberId } from "../utils/memberFormatters";

const PAGE_SIZE = 5;

export function MemberList({
  members,
  isLoading,
  searchQuery,
  canUpdateRoles,
  canDeleteMembers,
  canCreateMembers,
  onRoleChange,
  onDeleteMember,
  onCreateMember,
}) {
  const total = members.length;
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const paginationSignature = useMemo(
    () => `${searchQuery}:${members.map(getMemberId).join("|")}`,
    [members, searchQuery],
  );
  const [paginationState, setPaginationState] = useState({
    page: 1,
    signature: paginationSignature,
  });
  const activePage =
    paginationState.signature === paginationSignature
      ? paginationState.page
      : 1;
  const currentPage = Math.min(activePage, totalPages);
  const visibleMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return members.slice(start, start + PAGE_SIZE);
  }, [currentPage, members]);

  if (isLoading) {
    return <div className="member-table-state">Loading members...</div>;
  }

  if (!members.length) {
    if (searchQuery) {
      return (
        <EmptyState
          icon={FiSearch}
          title="No members match your search"
          description="Try a different name or email."
        />
      );
    }

    return (
      <EmptyState
        icon={FiUsers}
        title="No members yet"
        description="Invite a teammate to give them access to this organization."
        actions={
          canCreateMembers
            ? [{ label: "Invite member", icon: <FiUserPlus />, onClick: onCreateMember }]
            : undefined
        }
      />
    );
  }

  return (
    <div className="member-directory">
      <div className="member-table-wrap">
        <table className="member-table" aria-label="Organization members">
          <thead className="member-table-header">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
              <th scope="col">Role</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleMembers.map((member) => (
              <MemberRow
                key={getMemberId(member)}
                member={member}
                onRoleChange={onRoleChange}
                onDelete={onDeleteMember}
                canEdit={canUpdateRoles}
                canDelete={canDeleteMembers}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="member-pagination-row">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={(nextPage) =>
            setPaginationState({
              page: nextPage,
              signature: paginationSignature,
            })
          }
        />
      </div>
    </div>
  );
}
