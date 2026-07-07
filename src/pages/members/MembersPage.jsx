import { useCallback, useEffect, useMemo, useState } from "react";
import * as Separator from "@radix-ui/react-separator";
import { FiRefreshCw, FiUserPlus } from "react-icons/fi";
import {
  createMember,
  deleteMember,
  listMembers,
  updateMemberRole,
} from "../../features/members/api/memberService";
import { MemberCreateForm } from "../../features/members/components/MemberCreateForm";
import { MemberList } from "../../features/members/components/MemberList";
import { UserBadge } from "../../features/members/components/UserBadge";
import { getMemberId } from "../../features/members/utils/memberFormatters";
import { getApiError } from "../../shared/api/errors";
import {
  Permissions,
  RolePermissions,
  Roles,
} from "../../shared/auth/authEnums";
import { hasPermission } from "../../shared/auth/permissions";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import SearchBar from "../../shared/components/SearchBar";

export function MembersPage() {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const organizationId = session.organizationId;

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateMembers = useMemo(
    () => hasPermission(session, Permissions.MEMBER_INVITE),
    [session],
  );
  const canUpdateRoles = useMemo(
    () => hasPermission(session, Permissions.MEMBER_ROLE_UPDATE),
    [session],
  );
  const canDeleteMembers = useMemo(
    () => hasPermission(session, Permissions.MEMBER_REMOVE),
    [session],
  );

  const fetchMembers = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const nextMembers = await listMembers(organizationId);
      setMembers(Array.isArray(nextMembers) ? nextMembers : []);
    } catch (error) {
      notify({
        title: "Could not load members",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [notify, organizationId]);

  const filterMembers = useCallback((member, query) => {
    const lowerQuery = query.toLowerCase();
    return (
      member.name.toLowerCase().includes(lowerQuery) ||
      member.email.toLowerCase().includes(lowerQuery)
    );
  }, []);

  async function handleCreateMember(form) {
    setIsSubmitting(true);

    try {
      await createMember(organizationId, form);
      await fetchMembers();
      notify({
        title: "Member created",
        description: `${form.name} was added as ${form.role}.`,
        tone: "success",
      });
    } catch (error) {
      notify({
        title: "Could not create member",
        description: getApiError(error),
        tone: "danger",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRoleChange(memberId, role) {
    try {
      await updateMemberRole(organizationId, memberId, role);
      setMembers((current) =>
        current.map((member) =>
          getMemberId(member) === memberId ? { ...member, role } : member,
        ),
      );
      notify({
        title: "Role updated",
        description: "Member permissions will follow the new role.",
        tone: "success",
      });
    } catch (error) {
      notify({
        title: "Could not update role",
        description: getApiError(error),
        tone: "danger",
      });
    }
  }

  async function handleDeleteMember(memberId, memberName) {
    try {
      await deleteMember(organizationId, memberId);
      setMembers((current) =>
        current.filter((member) => getMemberId(member) !== memberId),
      );
      notify({
        title: "Member removed",
        description: `${memberName} was removed from the organization.`,
        tone: "success",
      });
    } catch (error) {
      notify({
        title: "Could not remove member",
        description: getApiError(error),
        tone: "danger",
      });
    }
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMembers();
  }, [fetchMembers]);
  const userRole = useMemo(
    () => session?.membership?.role || Roles.VIEWER,
    [session],
  );
  return (
    <WorkspaceLayout onSignOut={signOut}>
      <header className="workspace-header">
        <div>
          <h1>Organization members</h1>
          <p className="muted">Create developer/viewer accounts</p>
        </div>
        <UserBadge session={session} />
      </header>

      <div className="dashboard-grid">
        {userRole === Roles.ADMIN && (
          <section className="panel member-form-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Invite</p>
                <h2>Add a member</h2>
              </div>
              <FiUserPlus />
            </div>
            <Separator.Root className="separator" />
            <MemberCreateForm
              canManageMembers={canCreateMembers}
              isSubmitting={isSubmitting}
              onCreate={handleCreateMember}
            />
          </section>
        )}
        <section className="panel member-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{members.length || 0} members</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={fetchMembers}
              aria-label="Refresh members"
            >
              <FiRefreshCw />
            </button>
          </div>

          <SearchBar
            data={members}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterFn={filterMembers}
            onFilteredData={setFilteredMembers}
            placeholder="Search members..."
          />

          <Separator.Root className="separator" />
          {filteredMembers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {searchQuery
                ? "No Member match your search."
                : "No members available. Create a new member to get started."}
            </div>
          )}
          <MemberList
            members={filteredMembers}
            isLoading={isLoading}
            canUpdateRoles={canUpdateRoles}
            canDeleteMembers={canDeleteMembers}
            onRoleChange={handleRoleChange}
            onDeleteMember={handleDeleteMember}
          />
        </section>
      </div>
    </WorkspaceLayout>
  );
}
