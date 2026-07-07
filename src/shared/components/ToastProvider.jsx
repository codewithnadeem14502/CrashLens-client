import { useCallback, useMemo, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { ToastContext } from "./toastContext";

const emptyToast = { open: false, title: "", description: "", tone: "default" };

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(emptyToast);

  const notify = useCallback((nextToast) => {
    setToast(emptyToast);
    window.setTimeout(() => setToast({ open: true, ...nextToast }), 20);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root
          className={`toast ${toast.tone}`}
          open={toast.open}
          onOpenChange={(open) => setToast((item) => ({ ...item, open }))}
        >
          <Toast.Title className="toast-title">{toast.title}</Toast.Title>
          <Toast.Description className="toast-description">{toast.description}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="toast-viewport" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
