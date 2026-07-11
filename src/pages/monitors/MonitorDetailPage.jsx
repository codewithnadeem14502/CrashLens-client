import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { Pagination } from "../../shared/components/Pagination";
import { getMonitor, listCheckIns } from "../../features/monitors/api/monitorService";
import { getUptimeMonitor, listUptimeChecks } from "../../features/monitors/api/uptimeService";

const HISTORY_PAGE_LIMIT = 20;
const VALID_TYPES = new Set(["cron", "uptime"]);

function MonitorDetailPage() {
  const { type, monitorId } = useParams();
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const isCron = type === "cron";
  const isValidType = VALID_TYPES.has(type);

  const canView = useMemo(() => hasPermission(session, Permissions.MONITOR_VIEW), [session]);

  const [monitor, setMonitor] = useState(null);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: HISTORY_PAGE_LIMIT, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchMonitor = useCallback(async () => {
    if (!isValidType || !canView) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = isCron ? await getMonitor(monitorId) : await getUptimeMonitor(monitorId);
      setMonitor(data);
    } catch (error) {
      notify({ title: "Could not load monitor", description: getApiError(error), tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [isValidType, canView, isCron, monitorId, notify]);

  const fetchHistory = useCallback(async () => {
    if (!isValidType || !canView) {
      setIsHistoryLoading(false);
      return;
    }

    setIsHistoryLoading(true);

    try {
      if (isCron) {
        const data = await listCheckIns(monitorId, { page, limit: HISTORY_PAGE_LIMIT });
        setHistory(data.checkIns);
        setPagination(data.pagination);
      } else {
        const data = await listUptimeChecks(monitorId, { page, limit: HISTORY_PAGE_LIMIT });
        setHistory(data.checks);
        setPagination(data.pagination);
      }
    } catch (error) {
      notify({ title: "Could not load history", description: getApiError(error), tone: "danger" });
    } finally {
      setIsHistoryLoading(false);
    }
  }, [isValidType, canView, isCron, monitorId, page, notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMonitor();
  }, [fetchMonitor]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  if (!isValidType) {
    return (
      <WorkspaceLayout onSignOut={signOut}>
        <main className="issues-page">
          <section className="empty-state">
            Unknown monitor type "{type}" - expected "cron" or "uptime".
          </section>
        </main>
      </WorkspaceLayout>
    );
  }

  if (!canView) {
    return (
      <WorkspaceLayout onSignOut={signOut}>
        <main className="issues-page">
          <section className="empty-state">
            You do not have permission to view monitors.
          </section>
        </main>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="issues-page">
        <header className="issues-header">
          <div>
            <button
              className="text-button"
              type="button"
              onClick={() => navigate("/workspace/monitors")}
            >
              <FiArrowLeft />
              Back to monitors
            </button>
            <p className="eyebrow">{isCron ? "Cron monitor" : "Uptime monitor"}</p>
            <h1>{isLoading ? "Loading..." : monitor?.name ?? "Monitor not found"}</h1>
          </div>
        </header>

        {!isLoading && monitor ? (
          <section className="performance-summary-grid">
            <SummaryCard label="Status" value={monitor.status} />
            {isCron ? (
              <>
                <SummaryCard
                  label="Schedule"
                  value={monitor.scheduleType === "crontab" ? monitor.crontab : `every ${monitor.intervalSeconds}s`}
                />
                <SummaryCard label="Last check-in" value={monitor.lastCheckInStatus ?? "none yet"} />
                <SummaryCard label="Next expected" value={formatDate(monitor.nextExpectedAt)} />
              </>
            ) : (
              <>
                <SummaryCard label="Target" value={monitor.url} />
                <SummaryCard label="Last status" value={monitor.lastStatus} />
                <SummaryCard label="Consecutive failures" value={String(monitor.consecutiveFailures ?? 0)} />
              </>
            )}
            <SummaryCard label="Environment" value={monitor.environment} />
          </section>
        ) : null}

        <section className="issue-list">
          <div className="issue-table-wrap">
            <table className="issue-table" aria-label="History">
              <thead className="issue-table-header">
                <tr>
                  <th scope="col">Status</th>
                  {isCron ? <th scope="col">Message</th> : <th scope="col">Status code</th>}
                  <th scope="col">{isCron ? "Duration" : "Response time"}</th>
                  <th scope="col">{isCron ? "Started" : "Checked"}</th>
                </tr>
              </thead>
              <tbody>
                {isHistoryLoading ? (
                  <tr>
                    <td className="issue-table-state" colSpan="4">Loading history...</td>
                  </tr>
                ) : null}
                {!isHistoryLoading && history.length === 0 ? (
                  <tr>
                    <td className="issue-table-state" colSpan="4">No history yet.</td>
                  </tr>
                ) : null}
                {!isHistoryLoading
                  ? history.map((entry) => (
                      <tr className="issue-row" key={entry.id}>
                        <td>
                          <span className={`health-pill ${entry.status}`}>{entry.status}</span>
                        </td>
                        {isCron ? (
                          <td>{entry.message ?? "-"}</td>
                        ) : (
                          <td>{entry.statusCode ?? entry.error ?? "-"}</td>
                        )}
                        <td>
                          {isCron
                            ? entry.durationMs != null
                              ? `${entry.durationMs}ms`
                              : "-"
                            : entry.responseTimeMs != null
                              ? `${entry.responseTimeMs}ms`
                              : "-"}
                        </td>
                        <td>
                          <time>{formatDate(isCron ? entry.startedAt : entry.checkedAt)}</time>
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

export default MonitorDetailPage;
