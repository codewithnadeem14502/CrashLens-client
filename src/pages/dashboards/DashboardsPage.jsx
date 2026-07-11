import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { FiGrid, FiPlus, FiTrash2 } from "react-icons/fi";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { FormField } from "../../shared/ui/FormField";
import { EmptyState } from "../../shared/components/EmptyState";
import {
  createDashboard,
  deleteDashboard,
  listDashboards,
} from "../../features/dashboards/api/dashboardService";

function DashboardsPage() {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const canView = useMemo(() => hasPermission(session, Permissions.ALERT_VIEW), [session]);
  const canManage = useMemo(() => hasPermission(session, Permissions.ALERT_MANAGE), [session]);

  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchDashboards = useCallback(async () => {
    if (!canView) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await listDashboards({ limit: 100 });
      setDashboards(data.dashboards);
    } catch (error) {
      notify({ title: "Could not load dashboards", description: getApiError(error), tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [canView, notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboards();
  }, [fetchDashboards]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await createDashboard({ name: newName, widgets: [] });
      setNewName("");
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

  const createDashboardForm = (
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
        Create dashboard
      </button>
    </form>
  );

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

        {canManage && dashboards.length > 0 ? createDashboardForm : null}

        <section className="projects-surface">
          <div className="projects-surface-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{dashboards.length} dashboards</h2>
            </div>
          </div>

          {isLoading ? <div className="project-table-state">Loading dashboards...</div> : null}
          {!isLoading && dashboards.length === 0 ? (
            <EmptyState
              icon={FiGrid}
              title="No dashboards yet"
              description="Build a custom dashboard from your issues, performance, logs, and monitor data."
            >
              {canManage ? createDashboardForm : null}
            </EmptyState>
          ) : null}
          {!isLoading && dashboards.length > 0 ? (
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
                  {dashboards.map((dashboard) => (
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
