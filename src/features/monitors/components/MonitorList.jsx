import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { FiTrash2 } from "react-icons/fi";

export function MonitorList({ monitors, isLoading, canManage, onView, onDelete }) {
  if (isLoading) {
    return <div className="project-table-state">Loading monitors...</div>;
  }

  if (!monitors.length) {
    return <div className="project-table-state">No monitors configured yet.</div>;
  }

  return (
    <div className="project-table-wrap">
      <table className="project-table" aria-label="Monitors">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Monitor</th>
            <th scope="col">Status</th>
            <th scope="col">Health</th>
            <th scope="col">Environment</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {monitors.map((monitor) => {
            const id = monitor.id ?? monitor._id;
            const health = monitor.type === "cron" ? monitor.lastCheckInStatus : monitor.lastStatus;

            return (
              <tr
                className="project-table-row clickable"
                key={`${monitor.type}-${id}`}
                onClick={() => onView(monitor)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onView(monitor);
                }}
              >
                <td>
                  <span className={`type-pill ${monitor.type}`}>
                    {monitor.type === "cron" ? "Cron" : "Uptime"}
                  </span>
                </td>
                <td>
                  <strong>{monitor.name}</strong>
                  <div className="project-mono">
                    {monitor.type === "cron"
                      ? monitor.scheduleType === "crontab"
                        ? monitor.crontab
                        : `every ${monitor.intervalSeconds}s`
                      : monitor.url}
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${monitor.status}`}>{monitor.status}</span>
                </td>
                <td>
                  <span className={`health-pill ${health ?? "unknown"}`}>{health ?? "unknown"}</span>
                </td>
                <td>{monitor.environment}</td>
                <td
                  className="project-row-actions"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {canManage ? (
                    <ConfirmDeleteAction
                      title="Are you sure?"
                      description={`This permanently deletes "${monitor.name}" and its check history.`}
                      onConfirm={() => onDelete(monitor)}
                    >
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`Delete ${monitor.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </ConfirmDeleteAction>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Mirrors ProjectRow.jsx's local ConfirmProjectAction (not a shared
// component in this codebase yet - kept local here too rather than
// introducing a new shared abstraction for one extra call site).
function ConfirmDeleteAction({ title, description, onConfirm, children }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title className="dialog-title">{title}</AlertDialog.Title>
          <AlertDialog.Description className="dialog-description">
            {description}
          </AlertDialog.Description>
          <div className="dialog-actions">
            <AlertDialog.Cancel asChild>
              <button className="secondary-button" type="button">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className="danger-button" type="button" onClick={onConfirm}>
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
