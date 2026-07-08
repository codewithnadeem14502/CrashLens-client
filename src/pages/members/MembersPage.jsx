import { useCallback, useEffect, useMemo, useState } from "react";
import * as Separator from "@radix-ui/react-separator";
import * as Dialog from "@radix-ui/react-dialog";
import { FiRefreshCw, FiUserPlus, FiX } from "react-icons/fi";
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const filterMembers = useCallback((data, query) => {
    const search = query.trim().toLowerCase();

    return data.filter((member) => {
      const name = member.user?.name?.toLowerCase() || "";
      const email = member.user?.email?.toLowerCase() || "";

      return name.includes(search) || email.includes(search);
    });
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
      setIsCreateModalOpen(false);
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
        <div className="header-actions">
          {userRole === Roles.ADMIN && (
            <Dialog.Root
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <Dialog.Trigger asChild>
                <button className="primary-button" type="button">
                  <FiUserPlus />
                  Create member
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Invite</p>
                      <Dialog.Title asChild>
                        <h2>Add a member</h2>
                      </Dialog.Title>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        className="icon-button"
                        type="button"
                        aria-label="Close"
                      >
                        <FiX />
                      </button>
                    </Dialog.Close>
                  </div>
                  <Separator.Root className="separator" />
                  <MemberCreateForm
                    canManageMembers={canCreateMembers}
                    isSubmitting={isSubmitting}
                    onCreate={handleCreateMember}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
          <UserBadge session={session} />
        </div>
      </header>

      <section className="panel member-list-panel scrollbar-hide">
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

        <MemberList
          members={filteredMembers}
          isLoading={isLoading}
          searchQuery={searchQuery}
          canUpdateRoles={canUpdateRoles}
          canDeleteMembers={canDeleteMembers}
          onRoleChange={handleRoleChange}
          onDeleteMember={handleDeleteMember}
        />
      </section>
    </WorkspaceLayout>
  );
}
