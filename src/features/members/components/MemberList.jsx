import { useMemo, useState } from "react";
import { Pagination } from "../../../shared/components/Pagination";
import { MemberRow } from "./MemberRow";
import { getMemberId } from "../utils/memberFormatters";

const PAGE_SIZE = 5;

export function MemberList({
  members,
  isLoading,
  searchQuery,
  canUpdateRoles,
  canDeleteMembers,
  onRoleChange,
  onDeleteMember,
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

  const emptyMessage = searchQuery
    ? "No member matches your search."
    : "No members available. Create a new member to get started.";

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
            {isLoading ? (
              <tr>
                <td className="member-table-state" colSpan="6">
                  Loading members...
                </td>
              </tr>
            ) : null}
            {!isLoading && !members.length ? (
              <tr>
                <td className="member-table-state" colSpan="6">
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
            {!isLoading
              ? visibleMembers.map((member) => (
                  <MemberRow
                    key={getMemberId(member)}
                    member={member}
                    onRoleChange={onRoleChange}
                    onDelete={onDeleteMember}
                    canEdit={canUpdateRoles}
                    canDelete={canDeleteMembers}
                  />
                ))
              : null}
          </tbody>
        </table>
      </div>
      <div className="member-pagination-row">
        {isLoading ? (
          <span className="issue-pagination-status">Updating table...</span>
        ) : null}
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          total={total}
          limit={PAGE_SIZE}
          disabled={isLoading}
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
