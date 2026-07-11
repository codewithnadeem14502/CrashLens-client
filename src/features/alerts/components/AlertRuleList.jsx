import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { FiBell, FiPlus, FiTrash2 } from "react-icons/fi";
import { EmptyState } from "../../../shared/components/EmptyState";

export function AlertRuleList({ rules, isLoading, canManage, onView, onDelete, onCreate }) {
  if (isLoading) {
    return <div className="project-table-state">Loading alert rules...</div>;
  }

  if (!rules.length) {
    return (
      <EmptyState
        icon={FiBell}
        title="No alert rules configured yet"
        description="Create an alert rule to get notified when your issues, transactions, or monitors cross a threshold."
        actions={
          canManage
            ? [{ label: "Create alert rule", icon: <FiPlus />, onClick: onCreate }]
            : undefined
        }
      />
    );
  }

  return (
    <div className="project-table-wrap">
      <table className="project-table" aria-label="Alert rules">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Dataset</th>
            <th scope="col">Status</th>
            <th scope="col">State</th>
            <th scope="col">Last value</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr
              className="project-table-row clickable"
              key={rule.id}
              onClick={() => onView(rule)}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter") onView(rule);
              }}
            >
              <td>
                <strong>{rule.name}</strong>
              </td>
              <td>{rule.query.dataset}</td>
              <td>
                <span className={`status-pill ${rule.status}`}>{rule.status}</span>
              </td>
              <td>
                <span className={`health-pill ${rule.state}`}>{rule.state}</span>
              </td>
              <td>{rule.lastValue == null ? "-" : rule.lastValue}</td>
              <td
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <div className="project-row-actions">
                  {canManage ? (
                    <ConfirmDeleteAction
                      title="Are you sure?"
                      description={`This permanently deletes "${rule.name}" and its alert history.`}
                      onConfirm={() => onDelete(rule)}
                    >
                      <button className="icon-button" type="button" aria-label={`Delete ${rule.name}`}>
                        <FiTrash2 />
                      </button>
                    </ConfirmDeleteAction>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfirmDeleteAction({ title, description, onConfirm, children }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title className="dialog-title">{title}</AlertDialog.Title>
          <AlertDialog.Description className="dialog-description">{description}</AlertDialog.Description>
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
