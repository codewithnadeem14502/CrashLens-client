import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Separator from "@radix-ui/react-separator";
import * as Dialog from "@radix-ui/react-dialog";
import { FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { listProjects } from "../../features/projects/api/projectService";
import { createMonitor, deleteMonitor, listMonitors } from "../../features/monitors/api/monitorService";
import {
  createUptimeMonitor,
  deleteUptimeMonitor,
  listUptimeMonitors,
} from "../../features/monitors/api/uptimeService";
import { MonitorList } from "../../features/monitors/components/MonitorList";
import { CronMonitorForm } from "../../features/monitors/components/CronMonitorForm";
import { UptimeMonitorForm } from "../../features/monitors/components/UptimeMonitorForm";
import { CheckTokenCallout } from "../../features/monitors/components/CheckTokenCallout";

function MonitorsPage() {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const canView = useMemo(() => hasPermission(session, Permissions.MONITOR_VIEW), [session]);
  const canManage = useMemo(() => hasPermission(session, Permissions.MONITOR_MANAGE), [session]);

  const [projects, setProjects] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openForm, setOpenForm] = useState(null); // "cron" | "uptime" | null
  const [issuedCheckToken, setIssuedCheckToken] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const projectData = await listProjects();
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (error) {
      notify({ title: "Could not load projects", description: getApiError(error), tone: "danger" });
    }
  }, [notify]);

  const fetchMonitors = useCallback(async () => {
    if (!session.organizationId || !canView) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [cronResult, uptimeResult] = await Promise.all([
        listMonitors({ limit: 100 }),
        listUptimeMonitors({ limit: 100 }),
      ]);

      const combined = [
        ...cronResult.monitors.map((monitor) => ({ ...monitor, type: "cron" })),
        ...uptimeResult.uptimeMonitors.map((monitor) => ({ ...monitor, type: "uptime" })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setMonitors(combined);
    } catch (error) {
      notify({ title: "Could not load monitors", description: getApiError(error), tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [session.organizationId, canView, notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
    fetchMonitors();
  }, [fetchProjects, fetchMonitors]);

  const closeForm = () => {
    setOpenForm(null);
    setIssuedCheckToken(null);
  };

  const handleCreateCron = async (payload) => {
    setIsSubmitting(true);

    try {
      const response = await createMonitor(payload);
      await fetchMonitors();
      setIssuedCheckToken(response?.data?.checkToken ?? null);
      notify({ title: "Monitor created", description: response.message, tone: "success" });
    } catch (error) {
      notify({ title: "Could not create monitor", description: getApiError(error), tone: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUptime = async (payload) => {
    setIsSubmitting(true);

    try {
      const response = await createUptimeMonitor(payload);
      await fetchMonitors();
      notify({ title: "Uptime monitor created", description: response.message, tone: "success" });
      closeForm();
    } catch (error) {
      notify({
        title: "Could not create uptime monitor",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (monitor) => {
    try {
      const response =
        monitor.type === "cron"
          ? await deleteMonitor(monitor.id ?? monitor._id)
          : await deleteUptimeMonitor(monitor.id ?? monitor._id);
      await fetchMonitors();
      notify({ title: "Monitor deleted", description: response.message, tone: "success" });
    } catch (error) {
      notify({ title: "Could not delete monitor", description: getApiError(error), tone: "danger" });
    }
  };

  const handleView = (monitor) => {
    const id = monitor.id ?? monitor._id;
    navigate(`/workspace/monitors/${monitor.type}/${id}`);
  };

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="projects-page">
        <header className="projects-header">
          <div>
            <p className="eyebrow">Monitors</p>
            <h1>Cron &amp; uptime monitoring</h1>
            <p className="muted">
              Track scheduled job check-ins and HTTP endpoint availability in one place.
            </p>
          </div>

          {canManage ? (
            <div className="header-actions">
              <button className="secondary-button" type="button" onClick={() => setOpenForm("cron")}>
                <FiPlus />
                Cron monitor
              </button>
              <button className="primary-button" type="button" onClick={() => setOpenForm("uptime")}>
                <FiPlus />
                Uptime monitor
              </button>
            </div>
          ) : null}
        </header>

        <Dialog.Root open={openForm !== null} onOpenChange={(open) => (open ? null : closeForm())}>
          <Dialog.Portal>
            <Dialog.Overlay className="project-dialog-overlay" />
            <Dialog.Content className="project-dialog-content">
              <div className="project-dialog-header">
                <div>
                  <p className="eyebrow">Create</p>
                  <Dialog.Title asChild>
                    <h2>{openForm === "cron" ? "Add a cron monitor" : "Add an uptime monitor"}</h2>
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
                {issuedCheckToken ? (
                  <>
                    <CheckTokenCallout checkToken={issuedCheckToken} />
                    <div className="form-actions project-dialog-footer">
                      <button className="primary-button" type="button" onClick={closeForm}>
                        Done
                      </button>
                    </div>
                  </>
                ) : openForm === "cron" ? (
                  <CronMonitorForm
                    projects={projects}
                    isSubmitting={isSubmitting}
                    canManage={canManage}
                    onSubmit={handleCreateCron}
                    onCancel={closeForm}
                  />
                ) : openForm === "uptime" ? (
                  <UptimeMonitorForm
                    projects={projects}
                    isSubmitting={isSubmitting}
                    canManage={canManage}
                    onSubmit={handleCreateUptime}
                    onCancel={closeForm}
                  />
                ) : null}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <section className="projects-surface">
          <div className="projects-surface-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{monitors.length} monitors</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={fetchMonitors}
              aria-label="Refresh monitors"
              title="Refresh monitors"
            >
              <FiRefreshCw />
            </button>
          </div>

          <MonitorList
            monitors={monitors}
            isLoading={isLoading}
            canManage={canManage}
            onView={handleView}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </WorkspaceLayout>
  );
}

export default MonitorsPage;
