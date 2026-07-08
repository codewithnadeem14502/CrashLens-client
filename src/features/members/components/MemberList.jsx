import { useEffect, useMemo, useRef, useState } from "react";
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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [members]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((current) =>
            Math.min(current + PAGE_SIZE, members.length),
          );
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [members.length]);

  const visibleMembers = useMemo(
    () => members.slice(0, visibleCount),
    [members, visibleCount],
  );

  if (isLoading) {
    return <div className="empty-state">Loading members...</div>;
  }

  if (!members.length) {
    return (
      <div className="empty-state">
        {searchQuery
          ? "No member matches your search."
          : "No members available. Create a new member to get started."}
      </div>
    );
  }

  return (
    <div className="member-list scrollbar-hide">
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
      {visibleCount < members.length && (
        <div
          ref={sentinelRef}
          className="member-list-sentinel"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
