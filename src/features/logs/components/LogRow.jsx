export function LogRow({ log, onViewTrace }) {
  const level = log.level ?? "info";
  const occurredAt = log.occurredAt ?? log.createdAt;

  const viewTrace = (event) => {
    event.stopPropagation();
    onViewTrace(log.traceId);
  };

  return (
    <tr className="issue-row">
      <td>
        <span className={`severity-pill ${mapLevelToSeverityClass(level)}`}>
          {level}
        </span>
      </td>
      <td className="issue-cell-main">
        <strong>{log.message}</strong>
        {log.correlationId ? (
          <div className="issue-meta">
            <span>correlation:{log.correlationId}</span>
          </div>
        ) : null}
      </td>
      <td>{log.logger ?? "-"}</td>
      <td>
        <time>{formatCompactDate(occurredAt)}</time>
      </td>
      <td>
        {log.traceId ? (
          <button className="text-button" type="button" onClick={viewTrace}>
            View trace
          </button>
        ) : (
          <span className="muted">No trace</span>
        )}
      </td>
    </tr>
  );
}

// Reuses the issue-table's severity-pill styling (critical/high/medium/low)
// so logs visually align with the rest of the workspace's design tokens
// instead of introducing a parallel color set - see the design-system rules.
function mapLevelToSeverityClass(level) {
  switch (level) {
    case "fatal":
      return "critical";
    case "error":
      return "high";
    case "warn":
      return "medium";
    default:
      return "low";
  }
}

function formatCompactDate(value) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
