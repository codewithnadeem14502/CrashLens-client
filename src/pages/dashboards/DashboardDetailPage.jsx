import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Separator from "@radix-ui/react-separator";
import * as Dialog from "@radix-ui/react-dialog";
import { FiArrowLeft, FiPlus, FiX } from "react-icons/fi";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { getDashboard, updateDashboard } from "../../features/dashboards/api/dashboardService";
import { WidgetCard } from "../../features/dashboards/components/WidgetCard";
import { WidgetForm } from "../../features/dashboards/components/WidgetForm";

function DashboardDetailPage() {
  const { dashboardId } = useParams();
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const canView = useMemo(() => hasPermission(session, Permissions.ALERT_VIEW), [session]);
  const canManage = useMemo(() => hasPermission(session, Permissions.ALERT_MANAGE), [session]);

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingWidget, setIsAddingWidget] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!canView) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await getDashboard(dashboardId);
      setDashboard(data);
    } catch (error) {
      notify({ title: "Could not load dashboard", description: getApiError(error), tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [canView, dashboardId, notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, [fetchDashboard]);

  const saveWidgets = async (widgets) => {
    try {
      const response = await updateDashboard(dashboardId, { widgets });
      setDashboard(response.data.dashboard);
    } catch (error) {
      notify({ title: "Could not update dashboard", description: getApiError(error), tone: "danger" });
    }
  };

  const handleAddWidget = async (widget) => {
    await saveWidgets([...dashboard.widgets, widget]);
    setIsAddingWidget(false);
  };

  const handleDeleteWidget = async (widgetId) => {
    await saveWidgets(dashboard.widgets.filter((widget) => widget.widgetId !== widgetId));
  };

  if (!canView) {
    return (
      <WorkspaceLayout onSignOut={signOut}>
        <main className="issues-page">
          <section className="empty-state">You do not have permission to view dashboards.</section>
        </main>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="issues-page">
        <header className="issues-header">
          <div>
            <button className="text-button" type="button" onClick={() => navigate("/workspace/dashboards")}>
              <FiArrowLeft />
              Back to dashboards
            </button>
            <p className="eyebrow">Dashboard</p>
            <h1>{isLoading ? "Loading..." : (dashboard?.name ?? "Dashboard not found")}</h1>
          </div>
          {canManage && dashboard ? (
            <button className="primary-button" type="button" onClick={() => setIsAddingWidget(true)}>
              <FiPlus />
              Add widget
            </button>
          ) : null}
        </header>

        <Dialog.Root open={isAddingWidget} onOpenChange={(open) => (open ? null : setIsAddingWidget(false))}>
          <Dialog.Portal>
            <Dialog.Overlay className="project-dialog-overlay" />
            <Dialog.Content className="project-dialog-content">
              <div className="project-dialog-header">
                <div>
                  <p className="eyebrow">Widget builder</p>
                  <Dialog.Title asChild>
                    <h2>Add a widget</h2>
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
                <WidgetForm onSave={handleAddWidget} onCancel={() => setIsAddingWidget(false)} />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {!isLoading && dashboard && dashboard.widgets.length === 0 ? (
          <div className="project-table-state">No widgets yet - add one to get started.</div>
        ) : null}

        {!isLoading && dashboard && dashboard.widgets.length > 0 ? (
          <section className="performance-summary-grid">
            {dashboard.widgets.map((widget) => (
              <WidgetCard
                key={widget.widgetId}
                widget={widget}
                canManage={canManage}
                onDelete={handleDeleteWidget}
              />
            ))}
          </section>
        ) : null}
      </main>
    </WorkspaceLayout>
  );
}

export default DashboardDetailPage;
