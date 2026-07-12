import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Separator from "@radix-ui/react-separator";
import * as Dialog from "@radix-ui/react-dialog";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { ProjectFilterField } from "../../shared/components/ProjectFilterField";
import { useProjectFilter } from "../../shared/projectFilter/useProjectFilter";
import {
  createMonitor,
  deleteMonitor,
  listMonitors,
} from "../../features/monitors/api/monitorService";
import {
  createUptimeMonitor,
  deleteUptimeMonitor,
  listUptimeMonitors,
} from "../../features/monitors/api/uptimeService";
import { MonitorList } from "../../features/monitors/components/MonitorList";
import { MonitorsFilters } from "../../features/monitors/components/MonitorsFilters";
import { CronMonitorForm } from "../../features/monitors/components/CronMonitorForm";
import { UptimeMonitorForm } from "../../features/monitors/components/UptimeMonitorForm";
import { CheckTokenCallout } from "../../features/monitors/components/CheckTokenCallout";

const typeFilterOptions = [
  { value: "all", label: "All types" },
  { value: "cron", label: "Cron" },
  { value: "uptime", label: "Uptime" },
];

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const environmentFilterOptions = [
  { value: "all", label: "All environments" },
  { value: "development", label: "development" },
  { value: "staging", label: "staging" },
  { value: "production", label: "production" },
];

const defaultMonitorFilters = Object.freeze({
  type: "all",
  status: "all",
  environment: "all",
});

export function MonitorsPage() {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { projects, selectedProjectId } = useProjectFilter();

  const canView = useMemo(
    () => hasPermission(session, Permissions.MONITOR_VIEW),
    [session],
  );
  const canManage = useMemo(
    () => hasPermission(session, Permissions.MONITOR_MANAGE),
    [session],
  );

  const [monitors, setMonitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openForm, setOpenForm] = useState(null); // "cron" | "uptime" | null
  const [issuedCheckToken, setIssuedCheckToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(defaultMonitorFilters);

  const latestRequestIdRef = useRef(0);

  const fetchMonitors = useCallback(async () => {
    if (!session.organizationId || !canView) {
      setIsLoading(false);
      return;
    }

    const requestId = (latestRequestIdRef.current += 1);
    setIsLoading(true);

    const projectId =
      selectedProjectId === "all" ? undefined : selectedProjectId;
    const status =
      appliedFilters.status === "all" ? undefined : appliedFilters.status;

    try {
      const [cronResult, uptimeResult] = await Promise.all([
        listMonitors({ limit: 100, projectId, status }),
        listUptimeMonitors({ limit: 100, projectId, status }),
      ]);

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      const combined = [
        ...cronResult.monitors.map((monitor) => ({ ...monitor, type: "cron" })),
        ...uptimeResult.uptimeMonitors.map((monitor) => ({
          ...monitor,
          type: "uptime",
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setMonitors(combined);
    } catch (error) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      notify({
        title: "Could not load monitors",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    session.organizationId,
    canView,
    notify,
    selectedProjectId,
    appliedFilters.status,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMonitors();
  }, [fetchMonitors]);

  // Type/environment/search have no server-side filter support today (see
  // .claude/rules/real-architecture-reference.md) - filtered client-side over
  // the already-fetched, project+status-narrowed page. Status is server-side
  // only (see fetchMonitors) so it isn't re-applied here.
  const visibleMonitors = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();

    return monitors.filter(
      (monitor) =>
        (appliedFilters.type === "all" ||
          monitor.type === appliedFilters.type) &&
        (appliedFilters.environment === "all" ||
          monitor.environment === appliedFilters.environment) &&
        (!needle || monitor.name?.toLowerCase().includes(needle)),
    );
  }, [monitors, appliedFilters.type, appliedFilters.environment, searchQuery]);

  const applyFilters = (nextFilters) => {
    setAppliedFilters(nextFilters);
  };

  const resetFilters = () => {
    setAppliedFilters(defaultMonitorFilters);
  };

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
      notify({
        title: "Monitor created",
        description: response.message,
        tone: "success",
      });
    } catch (error) {
      notify({
        title: "Could not create monitor",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUptime = async (payload) => {
    setIsSubmitting(true);

    try {
      const response = await createUptimeMonitor(payload);
      await fetchMonitors();
      notify({
        title: "Uptime monitor created",
        description: response.message,
        tone: "success",
      });
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
      notify({
        title: "Monitor deleted",
        description: response.message,
        tone: "success",
      });
    } catch (error) {
      notify({
        title: "Could not delete monitor",
        description: getApiError(error),
        tone: "danger",
      });
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
              Track scheduled job check-ins and HTTP endpoint availability in
              one place.
            </p>
          </div>

          {canManage && monitors.length > 0 ? (
            <div className="header-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setOpenForm("cron")}
              >
                <FiPlus />
                Cron monitor
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => setOpenForm("uptime")}
              >
                <FiPlus />
                Uptime monitor
              </button>
            </div>
          ) : null}
        </header>

        <Dialog.Root
          open={openForm !== null}
          onOpenChange={(open) => (open ? null : closeForm())}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="project-dialog-overlay" />
            <Dialog.Content className="project-dialog-content">
              <div className="project-dialog-header">
                <div>
                  <p className="eyebrow">Create</p>
                  <Dialog.Title asChild>
                    <h2>
                      {openForm === "cron"
                        ? "Add a cron monitor"
                        : "Add an uptime monitor"}
                    </h2>
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

              <div className="project-dialog-body">
                {issuedCheckToken ? (
                  <>
                    <CheckTokenCallout checkToken={issuedCheckToken} />
                    <div className="form-actions project-dialog-footer">
                      <button
                        className="primary-button"
                        type="button"
                        onClick={closeForm}
                      >
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

        <div className="project-scope-toolbar">
          <ProjectFilterField />
          <div className="issue-search-box">
            <FiSearch />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by monitor name"
              type="text"
            />
            {searchQuery ? (
              <button
                className="issue-search-clear"
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear monitor search"
              >
                <FiX />
              </button>
            ) : null}
          </div>
          <MonitorsFilters
            filters={appliedFilters}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
            typeOptions={typeFilterOptions}
            statusOptions={statusFilterOptions}
            environmentOptions={environmentFilterOptions}
          />
        </div>

        <section className="projects-surface">
          <div className="projects-surface-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{visibleMonitors.length} monitors</h2>
            </div>
          </div>

          <MonitorList
            monitors={visibleMonitors}
            isLoading={isLoading}
            canManage={canManage}
            onView={handleView}
            onDelete={handleDelete}
            onCreateCron={() => setOpenForm("cron")}
            onCreateUptime={() => setOpenForm("uptime")}
          />
        </section>
      </main>
    </WorkspaceLayout>
  );
}

export default MonitorsPage;
