import { RoleSelect } from "../../../shared/ui/RoleSelect";

const issueStatusOptions = [
  { value: "unresolved", label: "Unresolved" },
  { value: "resolved", label: "Resolved" },
  { value: "ignored", label: "Ignored" },
];

export function IssueRow({
  issue,
  canManageIssue,
  canReadIssue,
  onViewIssueEvents,
  onUpdateIssueStatus,
}) {
  const issueId = issue.id ?? issue._id;
  const title = issue.title ?? issue.message ?? "Untitled issue";
  const lastSeen = issue.lastSeen ?? issue.updatedAt ?? issue.createdAt;
  const createdAt = issue.firstSeen ?? issue.createdAt ?? lastSeen;
  const eventCount = Number(issue.occurrenceCount ?? issue.eventCount ?? 0);
  const severity = issue.severity ?? "medium";
  const status = issue.status ?? "unresolved";

  const openIssue = () => {
    if (canReadIssue) {
      onViewIssueEvents(issue);
    }
  };

  const openIssueFromKeyboard = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openIssue();
    }
  };

  return (
    <tr
      className={`issue-row ${canReadIssue ? "clickable" : ""}`}
      tabIndex={canReadIssue ? 0 : undefined}
      onClick={openIssue}
      onKeyDown={openIssueFromKeyboard}
    >
      <td className="issue-cell-main">
        <div className="issue-title-line">
          <span className={`severity-dot ${severity}`} />
          <span className="issue-type">{issue.errorName ?? "Error"}</span>
          <strong>{title}</strong>
        </div>
        <div className="issue-meta">
          <span>{issue.projectName ?? issue.project?.name ?? "CrashLens"}</span>
          <span>{issue.culprit ?? issue.transaction ?? "No culprit"}</span>
        </div>
      </td>

      <td>
        <time>{formatCompactDate(lastSeen)}</time>
      </td>
      <td>{formatAge(createdAt)}</td>
      <td>{eventCount}</td>
      <td>
        <span className={`severity-pill ${severity}`}>{severity}</span>
      </td>
      <td
        className="issue-row-actions"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {canManageIssue ? (
          <RoleSelect
            value={status}
            options={issueStatusOptions}
            onValueChange={(status) => onUpdateIssueStatus(issueId, status)}
          />
        ) : (
          <span className="status-pill">{status}</span>
        )}
      </td>
    </tr>
  );
}

function formatCompactDate(value) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAge(value) {
  if (!value) return "Unknown";

  const ageMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(Math.floor(ageMs / 60000), 0);

  if (minutes < 60) return `${minutes || 1}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;

  return `${Math.floor(hours / 24)}d`;
}
