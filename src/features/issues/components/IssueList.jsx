import { Pagination } from "../../../shared/components/Pagination";
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
  return (
    <section className="issue-list">
      <div className="issue-table-wrap">
        <table className="issue-table" aria-label="Issues">
          <IssueTableHeader />
          <tbody>
            {isLoading ? (
              <tr>
                <td className="issue-table-state" colSpan="7">Loading issues...</td>
              </tr>
            ) : null}
            {!isLoading && issues.length === 0 ? (
              <tr>
                <td className="issue-table-state" colSpan="7">No issues match this view.</td>
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
