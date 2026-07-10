import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiAlertTriangle,
  FiClock,
  FiDatabase,
  FiRefreshCw,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { listProjects } from "../../features/projects/api/projectService";
import {
  getEndpointPerformance,
  getEndpointTrends,
  getTrace,
  listPerformanceEndpoints,
} from "../../features/performance/api/performanceService";

const defaultFilters = Object.freeze({
  projectId: "all",
  environment: "all",
  release: "",
  dateFrom: "",
  dateTo: "",
  slowThresholdMs: 1000,
});

const environmentOptions = ["all", "development", "staging", "production"];

export function PerformancePage() {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const [projects, setProjects] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedEndpointId, setSelectedEndpointId] = useState("");
  const [endpointDetail, setEndpointDetail] = useState(null);
  const [endpointTrends, setEndpointTrends] = useState(null);
  const [tracePreview, setTracePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const canViewPerformance = useMemo(
    () => hasPermission(session, Permissions.ISSUE_VIEW),
    [session],
  );

  const requestParams = useMemo(
    () => ({
      projectId: filters.projectId === "all" ? undefined : filters.projectId,
      environment:
        filters.environment === "all" ? undefined : filters.environment,
      release: filters.release.trim() || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      slowThresholdMs: filters.slowThresholdMs,
    }),
    [filters],
  );

  const selectedEndpoint = useMemo(
    () =>
      endpoints.find((endpoint) => endpoint.endpointId === selectedEndpointId) ??
      endpoints[0] ??
      null,
    [endpoints, selectedEndpointId],
  );

  const totalSummary = useMemo(() => summarizeEndpoints(endpoints), [endpoints]);

  const fetchProjects = useCallback(async () => {
    try {
      const projectData = await listProjects();
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (error) {
      notify({
        title: "Could not load projects",
        description: getApiError(error),
        tone: "danger",
      });
    }
  }, [notify]);

  const fetchEndpoints = useCallback(async () => {
    if (!canViewPerformance || !session.organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const performanceData = await listPerformanceEndpoints(requestParams);
      const nextEndpoints = performanceData.endpoints ?? [];
      setEndpoints(nextEndpoints);
      setSelectedEndpointId((current) => {
        if (nextEndpoints.some((endpoint) => endpoint.endpointId === current)) {
          return current;
        }

        return nextEndpoints[0]?.endpointId ?? "";
      });
    } catch (error) {
      notify({
        title: "Could not load performance data",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [canViewPerformance, notify, requestParams, session.organizationId]);

  const fetchEndpointDetail = useCallback(async () => {
    if (!selectedEndpoint?.endpointId) {
      setEndpointDetail(null);
      setEndpointTrends(null);
      setTracePreview(null);
      return;
    }

    setIsDetailLoading(true);

    try {
      const [detail, trends] = await Promise.all([
        getEndpointPerformance(selectedEndpoint.endpointId, requestParams),
        getEndpointTrends(selectedEndpoint.endpointId, requestParams),
      ]);
      setEndpointDetail(detail);
      setEndpointTrends(trends);

      const traceId = detail?.slowestTransactions?.find(
        (transaction) => transaction.traceId,
      )?.traceId;

      if (traceId) {
        const trace = await getTrace(traceId, requestParams);
        setTracePreview(trace);
      } else {
        setTracePreview(null);
      }
    } catch (error) {
      notify({
        title: "Could not load endpoint details",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsDetailLoading(false);
    }
  }, [notify, requestParams, selectedEndpoint]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEndpoints();
  }, [fetchEndpoints]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEndpointDetail();
  }, [fetchEndpointDetail]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  if (!canViewPerformance) {
    return (
      <WorkspaceLayout onSignOut={signOut}>
        <main className="performance-page">
          <section className="empty-state">
            You do not have permission to view performance data.
          </section>
        </main>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="performance-page">
        <header className="performance-header">
          <div>
            <p className="eyebrow">Performance</p>
            <h1>API response-time tracking</h1>
            <p className="muted">
              Compare endpoint latency, request volume, errors, and slow traces.
            </p>
          </div>
          <button
            className="ghost-button performance-refresh"
            type="button"
            onClick={fetchEndpoints}
            disabled={isLoading}
          >
            <FiRefreshCw />
            Refresh
          </button>
        </header>

        <section className="performance-filters" aria-label="Performance filters">
          <label className="performance-filter-field">
            <span>Project</span>
            <select
              className="input"
              value={filters.projectId}
              onChange={(event) => updateFilter("projectId", event.target.value)}
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id ?? project._id} value={project.id ?? project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="performance-filter-field">
            <span>Environment</span>
            <select
              className="input"
              value={filters.environment}
              onChange={(event) =>
                updateFilter("environment", event.target.value)
              }
            >
              {environmentOptions.map((environment) => (
                <option key={environment} value={environment}>
                  {environment === "all" ? "All environments" : environment}
                </option>
              ))}
            </select>
          </label>
          <label className="performance-filter-field">
            <span>Release</span>
            <input
              className="input"
              value={filters.release}
              placeholder="release tag"
              onChange={(event) => updateFilter("release", event.target.value)}
            />
          </label>
          <label className="performance-filter-field">
            <span>From</span>
            <input
              className="input"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
            />
          </label>
          <label className="performance-filter-field">
            <span>To</span>
            <input
              className="input"
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
            />
          </label>
          <label className="performance-filter-field compact">
            <span>Slow ms</span>
            <input
              className="input"
              min="1"
              type="number"
              value={filters.slowThresholdMs}
              onChange={(event) =>
                updateFilter("slowThresholdMs", event.target.value)
              }
            />
          </label>
          <button className="text-button" type="button" onClick={resetFilters}>
            Reset
          </button>
        </section>

        <section className="performance-summary-grid">
          <MetricCard
            icon={<FiDatabase />}
            label="Endpoints"
            value={formatNumber(endpoints.length)}
          />
          <MetricCard
            icon={<FiClock />}
            label="Avg latency"
            value={formatMs(totalSummary.averageDurationMs)}
          />
          <MetricCard
            icon={<FiTrendingUp />}
            label="p95 latency"
            value={formatMs(totalSummary.p95DurationMs)}
          />
          <MetricCard
            icon={<FiAlertTriangle />}
            label="Error rate"
            value={`${formatNumber(totalSummary.errorRate)}%`}
          />
          <MetricCard
            icon={<FiZap />}
            label="Slow requests"
            value={formatNumber(totalSummary.slowRequestCount)}
          />
        </section>

        <section className="performance-grid">
          <div className="performance-panel performance-endpoints-panel">
            <div className="performance-panel-heading">
              <div>
                <h2>Endpoints</h2>
                <span>{isLoading ? "Loading" : `${endpoints.length} routes`}</span>
              </div>
            </div>
            <EndpointTable
              endpoints={endpoints}
              isLoading={isLoading}
              selectedEndpointId={selectedEndpoint?.endpointId}
              onSelect={setSelectedEndpointId}
            />
          </div>

          <div className="performance-detail-column">
            <EndpointOverview
              endpoint={selectedEndpoint}
              detail={endpointDetail}
              trends={endpointTrends}
              trace={tracePreview}
              isLoading={isDetailLoading}
            />
          </div>
        </section>
      </main>
    </WorkspaceLayout>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <article className="performance-metric">
      <span aria-hidden="true">{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </article>
  );
}

function EndpointTable({ endpoints, isLoading, selectedEndpointId, onSelect }) {
  if (isLoading) {
    return <div className="performance-state">Loading endpoint metrics...</div>;
  }

  if (!endpoints.length) {
    return (
      <div className="performance-state">
        No transaction data found for this filter.
      </div>
    );
  }

  return (
    <div className="performance-table-wrap">
      <table className="performance-table">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Requests</th>
            <th>Avg</th>
            <th>p95</th>
            <th>Errors</th>
            <th>Slow</th>
            <th>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((endpoint) => (
            <tr
              key={endpoint.endpointId}
              className={
                endpoint.endpointId === selectedEndpointId ? "active" : ""
              }
              onClick={() => onSelect(endpoint.endpointId)}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSelect(endpoint.endpointId);
                }
              }}
            >
              <td>
                <div className="endpoint-cell">
                  <span className="method-pill">{endpoint.method}</span>
                  <strong>{endpoint.route}</strong>
                </div>
              </td>
              <td>{formatNumber(endpoint.requestCount)}</td>
              <td>{formatMs(endpoint.averageDurationMs)}</td>
              <td>{formatMs(endpoint.p95DurationMs)}</td>
              <td>{formatNumber(endpoint.errorRate)}%</td>
              <td>{formatNumber(endpoint.slowRequestCount)}</td>
              <td>{formatDate(endpoint.latestSeen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointOverview({ endpoint, detail, trends, trace, isLoading }) {
  if (!endpoint) {
    return (
      <div className="performance-panel">
        <div className="performance-state">Select an endpoint to inspect.</div>
      </div>
    );
  }

  const trendRows = trends?.trend ?? [];
  const comparison = trends?.comparison ?? {};
  const summary = detail?.summary ?? endpoint;
  const comparisonClass = comparison.averageDeltaPercent > 0 ? "bad" : "good";

  return (
    <>
      <div className="performance-panel endpoint-detail-panel">
        <div className="performance-panel-heading">
          <div>
            <h2>
              {endpoint.method} {endpoint.route}
            </h2>
            <span>{isLoading ? "Refreshing details" : "Selected endpoint"}</span>
          </div>
        </div>

        <div className="endpoint-comparison">
          <div>
            <span>Previous</span>
            <strong>{formatMs(comparison.previousAverageDurationMs)}</strong>
            <p>{comparison.previousBucket ?? "No previous bucket"}</p>
          </div>
          <div>
            <span>Current</span>
            <strong>{formatMs(comparison.currentAverageDurationMs)}</strong>
            <p>{comparison.currentBucket ?? "No current bucket"}</p>
          </div>
          <div className={comparisonClass}>
            <span>Delta</span>
            <strong>{formatDelta(comparison.averageDeltaPercent)}</strong>
            <p>{formatMs(comparison.averageDeltaMs)} change</p>
          </div>
        </div>

        <div className="endpoint-stats">
          <span>Requests: {formatNumber(summary.requestCount)}</span>
          <span>Avg: {formatMs(summary.averageDurationMs)}</span>
          <span>p50: {formatMs(summary.p50DurationMs)}</span>
          <span>p95: {formatMs(summary.p95DurationMs)}</span>
          <span>p99: {formatMs(summary.p99DurationMs)}</span>
          <span>Error rate: {formatNumber(summary.errorRate)}%</span>
        </div>
      </div>

      <div className="performance-panel chart-panel">
        <div className="performance-panel-heading">
          <div>
            <h2>Latency trend</h2>
            <span>Average, p95, and p99 by day</span>
          </div>
        </div>
        <ChartFrame>
          <LineChart data={trendRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="bucket" tickLine={false} />
            <YAxis tickLine={false} width={42} />
            <Tooltip formatter={(value) => formatMs(value)} />
            <Line
              type="monotone"
              dataKey="averageDurationMs"
              stroke="#0770e4"
              strokeWidth={2}
              dot={false}
              name="Avg"
            />
            <Line
              type="monotone"
              dataKey="p95DurationMs"
              stroke="#fc790d"
              strokeWidth={2}
              dot={false}
              name="p95"
            />
            <Line
              type="monotone"
              dataKey="p99DurationMs"
              stroke="#dc3532"
              strokeWidth={2}
              dot={false}
              name="p99"
            />
          </LineChart>
        </ChartFrame>
      </div>

      <div className="performance-two-up">
        <div className="performance-panel chart-panel">
          <div className="performance-panel-heading">
            <div>
              <h2>Throughput</h2>
              <span>Requests per day</span>
            </div>
          </div>
          <ChartFrame compact>
            <AreaChart data={trendRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="bucket" tickLine={false} />
              <YAxis tickLine={false} width={36} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="requestCount"
                stroke="#0770e4"
                fill="#f2f9ff"
                name="Requests"
              />
            </AreaChart>
          </ChartFrame>
        </div>

        <div className="performance-panel chart-panel">
          <div className="performance-panel-heading">
            <div>
              <h2>Error rate</h2>
              <span>5xx percentage</span>
            </div>
          </div>
          <ChartFrame compact>
            <AreaChart data={trendRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="bucket" tickLine={false} />
              <YAxis tickLine={false} width={36} />
              <Tooltip formatter={(value) => `${formatNumber(value)}%`} />
              <Area
                type="monotone"
                dataKey="errorRate"
                stroke="#dc3532"
                fill="#fff0f0"
                name="Error rate"
              />
            </AreaChart>
          </ChartFrame>
        </div>
      </div>

      <div className="performance-panel">
        <div className="performance-panel-heading">
          <div>
            <h2>Slowest traces</h2>
            <span>Highest duration transactions</span>
          </div>
        </div>
        <TransactionList transactions={detail?.slowestTransactions ?? []} />
      </div>

      <div className="performance-panel">
        <div className="performance-panel-heading">
          <div>
            <h2>Trace preview</h2>
            <span>{trace?.traceId ?? "No trace selected"}</span>
          </div>
        </div>
        <TransactionList transactions={trace?.transactions ?? []} compact />
      </div>
    </>
  );
}

function ChartFrame({ children, compact = false }) {
  return (
    <div className={compact ? "chart-frame compact" : "chart-frame"}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function TransactionList({ transactions, compact = false }) {
  if (!transactions.length) {
    return <div className="performance-state compact">No transactions found.</div>;
  }

  return (
    <div className={compact ? "transaction-list compact" : "transaction-list"}>
      {transactions.map((transaction) => (
        <article key={transaction.transactionId ?? transaction.id}>
          <div>
            <strong>
              {transaction.method} {transaction.route}
            </strong>
            <span>{transaction.traceId ?? "trace unavailable"}</span>
          </div>
          <div>
            <strong>{formatMs(transaction.durationMs)}</strong>
            <span>{transaction.statusCode}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function summarizeEndpoints(endpoints) {
  const requestCount = endpoints.reduce(
    (sum, endpoint) => sum + Number(endpoint.requestCount ?? 0),
    0,
  );
  const slowRequestCount = endpoints.reduce(
    (sum, endpoint) => sum + Number(endpoint.slowRequestCount ?? 0),
    0,
  );

  if (!endpoints.length || !requestCount) {
    return {
      averageDurationMs: 0,
      p95DurationMs: 0,
      errorRate: 0,
      slowRequestCount,
    };
  }

  const weightedAverage = endpoints.reduce(
    (sum, endpoint) =>
      sum +
      Number(endpoint.averageDurationMs ?? 0) *
        Number(endpoint.requestCount ?? 0),
    0,
  );
  const weightedErrors = endpoints.reduce(
    (sum, endpoint) =>
      sum + Number(endpoint.errorRate ?? 0) * Number(endpoint.requestCount ?? 0),
    0,
  );
  const p95DurationMs = Math.max(
    ...endpoints.map((endpoint) => Number(endpoint.p95DurationMs ?? 0)),
  );

  return {
    averageDurationMs: weightedAverage / requestCount,
    p95DurationMs,
    errorRate: weightedErrors / requestCount,
    slowRequestCount,
  };
}

function formatMs(value) {
  return `${formatNumber(value)}ms`;
}

function formatNumber(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(number)
    : "0";
}

function formatDelta(value) {
  const number = Number(value ?? 0);
  const prefix = number > 0 ? "+" : "";
  return `${prefix}${formatNumber(number)}%`;
}

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default PerformancePage;
