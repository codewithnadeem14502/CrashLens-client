import { FiAlertOctagon } from "react-icons/fi";
import { Pagination } from "../../../shared/components/Pagination";
import { EmptyState } from "../../../shared/components/EmptyState";
import { IssueRow } from "./IssueRow";
import { IssueTableHeader } from "./IssueTableHeader";

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
  if (!isLoading && issues.length === 0) {
    return (
      <section className="issue-list">
        <EmptyState
          icon={FiAlertOctagon}
          title="No issues found"
          description="No errors match the current filters, or your projects haven't reported any yet."
        />
      </section>
    );
  }

  return (
    <section className="issue-list">
      <div className="issue-table-wrap">
        <table className="issue-table" aria-label="Issues">
          <IssueTableHeader />
          <tbody>
            {isLoading ? (
              <tr>
                <td className="issue-table-state" colSpan="6">Loading issues...</td>
              </tr>
            ) : null}
            {!isLoading
              ? issues.map((issue) => (
                  <IssueRow
                    issue={issue}
                    key={issue.id ?? issue._id}
                    canManageIssue={canManageIssue}
                    canReadIssue={canReadIssue}
                    onUpdateIssueStatus={onUpdateIssueStatus}
                    onViewIssueEvents={onViewIssueEvents}
                  />
                ))
              : null}
          </tbody>
        </table>
      </div>
      <div className="issue-pagination-row">
        {isLoading ? (
          <span className="issue-pagination-status">Updating table...</span>
        ) : null}
        <Pagination
          page={pagination?.page}
          totalPages={pagination?.totalPages}
          total={pagination?.total}
          limit={pagination?.limit}
          disabled={isLoading}
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
};

export default IssueList;
