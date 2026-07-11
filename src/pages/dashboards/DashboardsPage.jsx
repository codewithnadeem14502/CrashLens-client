import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Separator from "@radix-ui/react-separator";
import * as Dialog from "@radix-ui/react-dialog";
import { FiGrid, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { FormField } from "../../shared/ui/FormField";
import { EmptyState } from "../../shared/components/EmptyState";
import { ProjectFilterField } from "../../shared/components/ProjectFilterField";
import { useProjectFilter } from "../../shared/projectFilter/useProjectFilter";
import {
  createDashboard,
  deleteDashboard,
  listDashboards,
} from "../../features/dashboards/api/dashboardService";

function DashboardsPage() {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { selectedProjectId } = useProjectFilter();

  const canView = useMemo(() => hasPermission(session, Permissions.ALERT_VIEW), [session]);
  const canManage = useMemo(() => hasPermission(session, Permissions.ALERT_MANAGE), [session]);

  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const latestRequestIdRef = useRef(0);

  const fetchDashboards = useCallback(async () => {
    if (!canView) {
      setIsLoading(false);
      return;
    }

    const requestId = (latestRequestIdRef.current += 1);
    setIsLoading(true);

    try {
      const data = await listDashboards({
        limit: 100,
        projectId: selectedProjectId === "all" ? undefined : selectedProjectId,
      });

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      setDashboards(data.dashboards);
    } catch (error) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      notify({ title: "Could not load dashboards", description: getApiError(error), tone: "danger" });
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [canView, notify, selectedProjectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboards();
  }, [fetchDashboards]);

  // No server-side search support (see
  // .claude/rules/real-architecture-reference.md) - filtered client-side
  // over the already-fetched, project-narrowed page.
  const visibleDashboards = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return dashboards.filter((dashboard) => !needle || dashboard.name?.toLowerCase().includes(needle));
  }, [dashboards, searchQuery]);

  const closeForm = () => {
    setIsFormOpen(false);
    setNewName("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await createDashboard({ name: newName, widgets: [] });
      closeForm();
      await fetchDashboards();
      navigate(`/workspace/dashboards/${response.data.dashboard.id}`);
    } catch (error) {
      notify({ title: "Could not create dashboard", description: getApiError(error), tone: "danger" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (dashboard) => {
    try {
      await deleteDashboard(dashboard.id);
      await fetchDashboards();
      notify({ title: "Dashboard deleted", tone: "success" });
    } catch (error) {
      notify({ title: "Could not delete dashboard", description: getApiError(error), tone: "danger" });
    }
  };

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="projects-page">
        <header className="projects-header">
          <div>
            <p className="eyebrow">Dashboards</p>
            <h1>Custom dashboards</h1>
            <p className="muted">Build widgets from issues, performance, logs, and monitor data.</p>
          </div>
        </header>

        <Dialog.Root open={isFormOpen} onOpenChange={(open) => (open ? null : closeForm())}>
          <Dialog.Portal>
            <Dialog.Overlay className="project-dialog-overlay" />
            <Dialog.Content className="project-dialog-content">
              <div className="project-dialog-header">
                <div>
                  <p className="eyebrow">Create</p>
                  <Dialog.Title asChild>
                    <h2>New dashboard</h2>
                  </Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button className="icon-button" type="button" aria-label="Close">
                    <FiX />
                  </button>
                </Dialog.Close>
              </div>
              <Separator.Root className="separator" />
              <div className="project-dialog-body">
                <form className="field-row" onSubmit={handleCreate}>
                  <FormField
                    label="New dashboard name"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Production overview"
                    required
                  />
                  <button className="primary-button" type="submit" disabled={isCreating || !newName}>
                    <FiPlus />
                    Save dashboard
                  </button>
                </form>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className="project-scope-toolbar">
          <ProjectFilterField />
          <div className="issue-search-box">
            <FiSearch />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by dashboard name"
              type="text"
            />
            {searchQuery ? (
              <button
                className="issue-search-clear"
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear dashboard search"
              >
                <FiX />
              </button>
            ) : null}
          </div>
          {canManage && dashboards.length > 0 ? (
            <button className="primary-button" type="button" onClick={() => setIsFormOpen(true)}>
              <FiPlus />
              Create dashboard
            </button>
          ) : null}
        </div>

        <section className="projects-surface">
          <div className="projects-surface-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{visibleDashboards.length} dashboards</h2>
            </div>
          </div>

          {isLoading ? <div className="project-table-state">Loading dashboards...</div> : null}
          {!isLoading && visibleDashboards.length === 0 ? (
            <EmptyState
              icon={FiGrid}
              title="No dashboards yet"
              description="Build a custom dashboard from your issues, performance, logs, and monitor data."
              actions={
                canManage
                  ? [{ label: "Create dashboard", icon: <FiPlus />, onClick: () => setIsFormOpen(true) }]
                  : undefined
              }
            />
          ) : null}
          {!isLoading && visibleDashboards.length > 0 ? (
            <div className="project-table-wrap">
              <table className="project-table dashboard-table" aria-label="Dashboards">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Widgets</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDashboards.map((dashboard) => (
                    <tr
                      className="project-table-row clickable"
                      key={dashboard.id}
                      onClick={() => navigate(`/workspace/dashboards/${dashboard.id}`)}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") navigate(`/workspace/dashboards/${dashboard.id}`);
                      }}
                    >
                      <td>
                        <strong>{dashboard.name}</strong>
                      </td>
                      <td>{dashboard.widgets.length}</td>
                      <td
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <div className="project-row-actions">
                          {canManage ? (
                            <ConfirmDeleteAction
                              title="Are you sure?"
                              description={`This permanently deletes "${dashboard.name}" and its widgets.`}
                              onConfirm={() => handleDelete(dashboard)}
                            >
                              <button className="icon-button" type="button" aria-label={`Delete ${dashboard.name}`}>
                                <FiTrash2 />
                              </button>
                            </ConfirmDeleteAction>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>
    </WorkspaceLayout>
  );
}

function ConfirmDeleteAction({ title, description, onConfirm, children }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title className="dialog-title">{title}</AlertDialog.Title>
          <AlertDialog.Description className="dialog-description">{description}</AlertDialog.Description>
          <div className="dialog-actions">
            <AlertDialog.Cancel asChild>
              <button className="secondary-button" type="button">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className="danger-button" type="button" onClick={onConfirm}>
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export default DashboardsPage;
