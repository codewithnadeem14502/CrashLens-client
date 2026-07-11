import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPause, FiPlay } from "react-icons/fi";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { Pagination } from "../../shared/components/Pagination";
import { getAlertRule, listAlertEvents, updateAlertRule } from "../../features/alerts/api/alertService";

const HISTORY_PAGE_LIMIT = 20;

function AlertRuleDetailPage() {
  const { ruleId } = useParams();
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const canView = useMemo(() => hasPermission(session, Permissions.ALERT_VIEW), [session]);
  const canManage = useMemo(() => hasPermission(session, Permissions.ALERT_MANAGE), [session]);

  const [rule, setRule] = useState(null);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: HISTORY_PAGE_LIMIT, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchRule = useCallback(async () => {
    if (!canView) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await getAlertRule(ruleId);
      setRule(data);
    } catch (error) {
      notify({ title: "Could not load alert rule", description: getApiError(error), tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [canView, ruleId, notify]);

  const fetchHistory = useCallback(async () => {
    if (!canView) {
      setIsHistoryLoading(false);
      return;
    }

    setIsHistoryLoading(true);

    try {
      const data = await listAlertEvents(ruleId, { page, limit: HISTORY_PAGE_LIMIT });
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (error) {
      notify({ title: "Could not load alert history", description: getApiError(error), tone: "danger" });
    } finally {
      setIsHistoryLoading(false);
    }
  }, [canView, ruleId, page, notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRule();
  }, [fetchRule]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  const toggleStatus = async () => {
    const nextStatus = rule.status === "active" ? "paused" : "active";

    try {
      const response = await updateAlertRule(ruleId, { status: nextStatus });
      setRule(response.data.rule);
      notify({ title: `Rule ${nextStatus === "paused" ? "paused" : "resumed"}`, tone: "success" });
    } catch (error) {
      notify({ title: "Could not update rule", description: getApiError(error), tone: "danger" });
    }
  };

  if (!canView) {
    return (
      <WorkspaceLayout onSignOut={signOut}>
        <main className="issues-page">
          <section className="empty-state">You do not have permission to view alert rules.</section>
        </main>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="issues-page">
        <header className="issues-header">
          <div>
            <button className="text-button" type="button" onClick={() => navigate("/workspace/alerts")}>
              <FiArrowLeft />
              Back to alerts
            </button>
            <p className="eyebrow">Alert rule</p>
            <h1>{isLoading ? "Loading..." : (rule?.name ?? "Rule not found")}</h1>
          </div>
          {canManage && rule ? (
            <button className="secondary-button" type="button" onClick={toggleStatus}>
              {rule.status === "active" ? <FiPause /> : <FiPlay />}
              {rule.status === "active" ? "Pause" : "Resume"}
            </button>
          ) : null}
        </header>

        {!isLoading && rule ? (
          <section className="performance-summary-grid">
            <SummaryCard label="State" value={rule.state} />
            <SummaryCard label="Status" value={rule.status} />
            <SummaryCard label="Last value" value={rule.lastValue == null ? "-" : String(rule.lastValue)} />
            <SummaryCard label="Dataset" value={`${rule.query.dataset} / ${rule.query.aggregate}`} />
            <SummaryCard label="Direction" value={rule.direction} />
          </section>
        ) : null}

        <section className="issue-list">
          <div className="issue-table-wrap">
            <table className="issue-table" aria-label="Alert history">
              <thead className="issue-table-header">
                <tr>
                  <th scope="col">Transition</th>
                  <th scope="col">Value</th>
                  <th scope="col">Notifications</th>
                  <th scope="col">Triggered</th>
                </tr>
              </thead>
              <tbody>
                {isHistoryLoading ? (
                  <tr>
                    <td className="issue-table-state" colSpan="4">Loading history...</td>
                  </tr>
                ) : null}
                {!isHistoryLoading && events.length === 0 ? (
                  <tr>
                    <td className="issue-table-state" colSpan="4">No alert history yet.</td>
                  </tr>
                ) : null}
                {!isHistoryLoading
                  ? events.map((event) => (
                      <tr className="issue-row" key={event._id ?? event.id}>
                        <td>
                          <span className={`health-pill ${event.fromState}`}>{event.fromState}</span>
                          {" -> "}
                          <span className={`health-pill ${event.toState}`}>{event.toState}</span>
                        </td>
                        <td>{event.value}</td>
                        <td>
                          {event.notifications && event.notifications.length > 0
                            ? event.notifications
                                .map((notification) => `${notification.type}: ${notification.status}`)
                                .join(", ")
                            : "-"}
                        </td>
                        <td>
                          <time>{formatDate(event.triggeredAt)}</time>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
          <div className="issue-pagination-row">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              disabled={isHistoryLoading}
              onPageChange={setPage}
            />
          </div>
        </section>
      </main>
    </WorkspaceLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <article className="performance-metric">
      <div>
        <strong>{value ?? "-"}</strong>
        <p>{label}</p>
      </div>
    </article>
  );
}

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default AlertRuleDetailPage;
