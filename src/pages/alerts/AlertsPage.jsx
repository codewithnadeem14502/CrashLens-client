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
import { createAlertRule, deleteAlertRule, listAlertRules } from "../../features/alerts/api/alertService";
import { AlertRuleList } from "../../features/alerts/components/AlertRuleList";
import { AlertRuleForm } from "../../features/alerts/components/AlertRuleForm";
import { AlertsFilters } from "../../features/alerts/components/AlertsFilters";

const stateFilterOptions = [
  { value: "all", label: "All states" },
  { value: "ok", label: "OK" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const defaultAlertFilters = Object.freeze({
  state: "all",
  status: "all",
});

function AlertsPage() {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { selectedProjectId } = useProjectFilter();

  const canView = useMemo(() => hasPermission(session, Permissions.ALERT_VIEW), [session]);
  const canManage = useMemo(() => hasPermission(session, Permissions.ALERT_MANAGE), [session]);

  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(defaultAlertFilters);

  const latestRequestIdRef = useRef(0);

  const fetchRules = useCallback(async () => {
    if (!canView) {
      setIsLoading(false);
      return;
    }

    const requestId = (latestRequestIdRef.current += 1);
    setIsLoading(true);

    try {
      const data = await listAlertRules({
        limit: 100,
        projectId: selectedProjectId === "all" ? undefined : selectedProjectId,
        status: appliedFilters.status === "all" ? undefined : appliedFilters.status,
      });

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      setRules(data.rules);
    } catch (error) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      notify({ title: "Could not load alert rules", description: getApiError(error), tone: "danger" });
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [canView, notify, selectedProjectId, appliedFilters.status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRules();
  }, [fetchRules]);

  // State has no server-side filter support (see
  // .claude/rules/real-architecture-reference.md) - filtered client-side over
  // the already-fetched, project+status-narrowed page. Status is server-side
  // only (see fetchRules) so it isn't re-applied here.
  const visibleRules = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();

    return rules.filter(
      (rule) =>
        (appliedFilters.state === "all" || rule.state === appliedFilters.state) &&
        (!needle || rule.name?.toLowerCase().includes(needle)),
    );
  }, [rules, appliedFilters.state, searchQuery]);

  const applyFilters = (nextFilters) => {
    setAppliedFilters(nextFilters);
  };

  const resetFilters = () => {
    setAppliedFilters(defaultAlertFilters);
  };

  const handleCreate = async (payload) => {
    setIsSubmitting(true);

    try {
      await createAlertRule(payload);
      await fetchRules();
      setIsFormOpen(false);
      notify({ title: "Alert rule created", tone: "success" });
    } catch (error) {
      notify({ title: "Could not create alert rule", description: getApiError(error), tone: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rule) => {
    try {
      await deleteAlertRule(rule.id);
      await fetchRules();
      notify({ title: "Alert rule deleted", tone: "success" });
    } catch (error) {
      notify({ title: "Could not delete alert rule", description: getApiError(error), tone: "danger" });
    }
  };

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="projects-page">
        <header className="projects-header">
          <div>
            <p className="eyebrow">Alerts</p>
            <h1>Alert rules</h1>
            <p className="muted">
              Threshold or percent-change rules over issues, performance, logs, and monitors.
            </p>
          </div>
        </header>

        <Dialog.Root open={isFormOpen} onOpenChange={(open) => (open ? null : setIsFormOpen(false))}>
          <Dialog.Portal>
            <Dialog.Overlay className="project-dialog-overlay" />
            <Dialog.Content className="project-dialog-content">
              <div className="project-dialog-header">
                <div>
                  <p className="eyebrow">Create</p>
                  <Dialog.Title asChild>
                    <h2>New alert rule</h2>
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
                <AlertRuleForm
                  isSubmitting={isSubmitting}
                  onSubmit={handleCreate}
                  onCancel={() => setIsFormOpen(false)}
                />
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
              placeholder="Search by rule name"
              type="text"
            />
            {searchQuery ? (
              <button
                className="issue-search-clear"
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear alert rule search"
              >
                <FiX />
              </button>
            ) : null}
          </div>
          <div className="issues-filter-group align-end">
            <AlertsFilters
              filters={appliedFilters}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
              stateOptions={stateFilterOptions}
              statusOptions={statusFilterOptions}
            />
            {canManage && rules.length > 0 ? (
              <button className="primary-button" type="button" onClick={() => setIsFormOpen(true)}>
                <FiPlus />
                New alert rule
              </button>
            ) : null}
          </div>
        </div>

        <section className="projects-surface">
          <div className="projects-surface-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{visibleRules.length} alert rules</h2>
            </div>
          </div>

          <AlertRuleList
            rules={visibleRules}
            isLoading={isLoading}
            canManage={canManage}
            onView={(rule) => navigate(`/workspace/alerts/${rule.id}`)}
            onDelete={handleDelete}
            onCreate={() => setIsFormOpen(true)}
          />
        </section>
      </main>
    </WorkspaceLayout>
  );
}

export default AlertsPage;
