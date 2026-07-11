import { AuthProvider } from "../../shared/auth/AuthProvider";
import { ToastProvider } from "../../shared/components/ToastProvider";
import { ProjectFilterProvider } from "../../shared/projectFilter/ProjectFilterProvider";

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProjectFilterProvider>{children}</ProjectFilterProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
