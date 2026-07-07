import { AuthProvider } from "../../shared/auth/AuthProvider";
import { ToastProvider } from "../../shared/components/ToastProvider";

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
