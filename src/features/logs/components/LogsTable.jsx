import { FiFileText } from "react-icons/fi";
import { Pagination } from "../../../shared/components/Pagination";
import { EmptyState } from "../../../shared/components/EmptyState";
import { LogRow } from "./LogRow";
import { LogsTableHeader } from "./LogsTableHeader";

export function LogsTable({
  logs = [],
  isLoading,
  onViewTrace,
  pagination,
  onPageChange,
}) {
  if (!isLoading && logs.length === 0) {
    return (
      <section className="issue-list">
        <EmptyState
          icon={FiFileText}
          title="No logs found"
          description="No log lines match the current filters, or your projects haven't sent any yet."
        />
      </section>
    );
  }

  return (
    <section className="issue-list">
      <div className="issue-table-wrap">
        <table className="issue-table" aria-label="Logs">
          <LogsTableHeader />
          <tbody>
            {isLoading ? (
              <tr>
                <td className="issue-table-state" colSpan="5">Loading logs...</td>
              </tr>
            ) : null}
            {!isLoading
              ? logs.map((log) => (
                  <LogRow log={log} key={log.id ?? log.entryId} onViewTrace={onViewTrace} />
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
}
