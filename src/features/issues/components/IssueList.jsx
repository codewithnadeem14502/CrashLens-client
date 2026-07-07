import { FiActivity, FiClock, FiGitCommit, FiLayers } from "react-icons/fi";
import { Pagination } from "../../../shared/components/Pagination";
import { RoleSelect } from "../../../shared/ui/RoleSelect";

const issueStatusOptions = [
  { value: "unresolved", label: "Unresolved" },
  { value: "resolved", label: "Resolved" },
  { value: "ignored", label: "Ignored" },
];

const IssueList = ({
  issues = [],
  isLoading,
  canManageIssue,
  canReadIssue,
  onViewIssueEvents,
  onUpdateIssueStatus,
  pagination,
  onPageChange,
}) => {
  if (isLoading) {
    return <div className="empty-state">Loading issues...</div>;
  }

  return (
    <div className="issue-list">
      {issues.map((issue) => (
        <article
          className={`issue-row ${canReadIssue ? "clickable" : ""}`}
          key={issue.id ?? issue._id}
          onClick={() => {
            if (canReadIssue) {
              onViewIssueEvents(issue);
            }
          }}
        >
          <div className="issue-main">
            <div className="issue-title-row">
              <span className={`severity-pill ${issue.severity ?? "medium"}`}>
                {issue.severity ?? "medium"}
              </span>
              <h3>{issue.title ?? issue.message ?? "Untitled issue"}</h3>
            </div>
            <div className="issue-meta">
              <span>
                <FiActivity />
                {issue.errorName ?? "Error"}
              </span>
              <span>
                <FiLayers />
                {issue.culprit ?? "No culprit"}
              </span>
              <span>
                <FiGitCommit />
                {issue.occurrenceCount ?? 0} occurrences
              </span>
              <span>
                <FiClock />
                {formatDate(issue.lastSeen ?? issue.updatedAt)}
              </span>
            </div>
          </div>
          <div className="issue-actions" onClick={(event) => event.stopPropagation()}>
            <RoleSelect
              value={issue.status ?? "unresolved"}
              options={issueStatusOptions}
              disabled={!canManageIssue}
              onValueChange={(status) => onUpdateIssueStatus(issue.id ?? issue._id, status)}
            />
          </div>
        </article>
      ))}
      <Pagination
        page={pagination?.page}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
        disabled={isLoading}
        onPageChange={onPageChange}
      />
    </div>
  );
};

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleString();
}

export default IssueList;
