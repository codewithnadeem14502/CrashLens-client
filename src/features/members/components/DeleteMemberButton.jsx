import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { FiTrash2 } from "react-icons/fi";

export function DeleteMemberButton({ memberName, onDelete }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          className="icon-button danger"
          type="button"
          aria-label={`Delete ${memberName}`}
        >
          <FiTrash2 />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title className="dialog-title">Remove member</AlertDialog.Title>
          <AlertDialog.Description className="dialog-description">
            This will remove {memberName} from the organization. Their access will be revoked for this workspace.
          </AlertDialog.Description>
          <div className="dialog-actions">
            <AlertDialog.Cancel asChild>
              <button className="secondary-button" type="button">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className="danger-button" type="button" onClick={onDelete}>
                Remove member
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
