import * as AlertDialog from "@radix-ui/react-alert-dialog";

export function ConfirmProjectAction({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  onConfirm,
  children,
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {children ? (
        <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      ) : null}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title className="dialog-title">
            {title}
          </AlertDialog.Title>
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
              <button
                className="danger-button"
                type="button"
                onClick={onConfirm}
              >
                {actionLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export default ConfirmProjectAction;
