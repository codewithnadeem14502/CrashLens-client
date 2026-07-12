import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { listLogs } from "../../features/logs/api/logsService";
import { getTrace } from "../../features/performance/api/performanceService";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { LogsTable } from "../../features/logs/components/LogsTable";
import { LogsSearchBar } from "../../features/logs/components/LogsSearchBar";
import { LogsFilters } from "../../features/logs/components/LogsFilters";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { ProjectFilterField } from "../../shared/components/ProjectFilterField";
import { useProjectFilter } from "../../shared/projectFilter/useProjectFilter";

const LOG_PAGE_LIMIT = 25;

const levelFilterOptions = [
  { value: "all", label: "All levels" },
  { value: "fatal", label: "Fatal" },
  { value: "error", label: "Error" },
  { value: "warn", label: "Warn" },
  { value: "info", label: "Info" },
  { value: "debug", label: "Debug" },
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const defaultLogFilters = Object.freeze({
  level: "all",
  sort: "newest",
});

export function LogsPage() {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const { selectedProjectId } = useProjectFilter();

  const organizationId = session.organizationId;

  const canViewLogs = useMemo(
    () => hasPermission(session, Permissions.ISSUE_VIEW),
    [session],
  );

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LOG_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(defaultLogFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [tracePreview, setTracePreview] = useState(null);
  const [isTraceLoading, setIsTraceLoading] = useState(false);

  // Same debounce-then-reset-page pattern as IssuesPage - a new search term
  // can change which page is "page 1" for the matching set. Also clears any
  // open trace preview: leaving a stale trace for a row that's no longer in
  // the (now re-filtered) visible set is confusing UI, not a data bug, but
  // cheap to avoid.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
      setTracePreview(null);
    }, 350);

    return () => clearTimeout(handle);
  }, [searchQuery]);

  // Same overlapping-request guard as IssuesPage (see latestRequestIdRef
  // there) - only the most recently *fired* request's response is applied.
  const latestRequestIdRef = useRef(0);
  // Same guard, applied to trace-preview lookups: a user double-clicking
  // "View trace" on two different rows in quick succession must not have
  // the slower response overwrite the faster/newer one's preview panel.
  const latestTraceRequestIdRef = useRef(0);

  const fetchLogs = useCallback(async () => {
    if (!organizationId || !canViewLogs) {
      setIsLoading(false);
      return;
    }

    const requestId = (latestRequestIdRef.current += 1);
    setIsLoading(true);

    try {
      const logData = await listLogs({
        page,
        limit: LOG_PAGE_LIMIT,
        projectId: selectedProjectId === "all" ? undefined : selectedProjectId,
        level:
          appliedFilters.level === "all" ? undefined : appliedFilters.level,
        search: debouncedSearch || undefined,
        order: appliedFilters.sort === "oldest" ? "asc" : "desc",
      });

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      const nextLogs = Array.isArray(logData.logs) ? logData.logs : [];
      setLogs(nextLogs);
      setPagination(
        logData.pagination ?? {
          page,
          limit: LOG_PAGE_LIMIT,
          total: nextLogs.length,
          totalPages: 1,
        },
      );
    } catch (error) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      notify({
        title: "Could not load logs",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    page,
    organizationId,
    canViewLogs,
    notify,
    selectedProjectId,
    appliedFilters.level,
    appliedFilters.sort,
    debouncedSearch,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  const applyFilters = (nextFilters) => {
    setPage(1);
    setTracePreview(null);
    setAppliedFilters(nextFilters);
  };

  const resetFilters = () => {
    setPage(1);
    setTracePreview(null);
    setAppliedFilters(defaultLogFilters);
  };

  const clearLevelFilter = () => {
    setPage(1);
    setTracePreview(null);
    setAppliedFilters((current) => ({ ...current, level: "all" }));
  };

  // Correlation-ID/traceId population on the producer side is still
  // deferred (Module 2 fast-follow), so most log rows won't carry a
  // traceId yet - this click-through exists structurally so it lights up
  // the moment a producer starts sending one, no later frontend change
  // needed. Reuses the same getTrace call PerformancePage already uses,
  // since LogEntry.traceId and PerformanceTransaction.traceId are meant to
  // correlate against the same value.
  const handleViewTrace = async (traceId) => {
    if (!traceId) {
      return;
    }

    const requestId = (latestTraceRequestIdRef.current += 1);
    setIsTraceLoading(true);

    try {
      const trace = await getTrace(traceId);

      if (requestId !== latestTraceRequestIdRef.current) {
        return;
      }

      setTracePreview({ traceId, ...trace });
    } catch (error) {
      if (requestId !== latestTraceRequestIdRef.current) {
        return;
      }

      notify({
        title: "Could not load trace",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      if (requestId === latestTraceRequestIdRef.current) {
        setIsTraceLoading(false);
      }
    }
  };

  if (!canViewLogs) {
    return (
      <WorkspaceLayout onSignOut={signOut}>
        <main className="issues-page">
          <section className="empty-state">
            You do not have permission to view logs.
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
            <p className="eyebrow">Logs</p>
            <h1>Application logs</h1>
            <p className="muted">
              Search and filter log lines ingested from your projects.
            </p>
          </div>
        </header>

        <div className="issues-toolbar">
          <ProjectFilterField />
          <LogsSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            activeLevel={appliedFilters.level}
            resultCount={pagination.total}
            onClearLevel={clearLevelFilter}
          />
          <LogsFilters
            filters={appliedFilters}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
            levelOptions={levelFilterOptions}
            sortOptions={sortOptions}
          />
        </div>

        <LogsTable
          logs={logs}
          isLoading={isLoading}
          onViewTrace={handleViewTrace}
          pagination={pagination}
          onPageChange={setPage}
        />

        {tracePreview ? (
          <section className="performance-panel">
            <div className="performance-panel-heading">
              <div>
                <h2>Trace preview</h2>
                <span>
                  {isTraceLoading ? "Loading..." : tracePreview.traceId}
                </span>
              </div>
            </div>
            {(tracePreview.transactions ?? []).length ? (
              <div className="transaction-list compact">
                {tracePreview.transactions.map((transaction) => (
                  <article key={transaction.transactionId ?? transaction.id}>
                    <div>
                      <strong>
                        {transaction.method} {transaction.route}
                      </strong>
                      <span>
                        {transaction.environment ?? "unknown environment"}
                      </span>
                    </div>
                    <div>
                      <strong>{transaction.durationMs}ms</strong>
                      <span>{transaction.statusCode}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="performance-state compact">
                No performance transactions found for this trace.
              </div>
            )}
          </section>
        ) : null}
      </main>
    </WorkspaceLayout>
  );
}

export default LogsPage;
